import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { signToken } from '../../shared/jwt';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

type Challenge = { nonce: string; message: string; createdAt: number };

@Injectable()
export class AuthService {
  private challenges = new Map<string, Challenge>(); // publicKey -> challenge

  constructor(private readonly users: UsersService) {}

  createChallenge(publicKey: string) {
    if (!publicKey) throw new BadRequestException('publicKey required');
    const nonce = cryptoSafeNonce();
    const message = `Sol Bounties login\n\nWallet: ${publicKey}\nNonce: ${nonce}\n\nSign this message to authenticate.`;
    const challenge: Challenge = { nonce, message, createdAt: Date.now() };
    this.challenges.set(publicKey, challenge);
    return challenge;
  }

  async verify(payload: { publicKey: string; signature: string; message: string; nonce: string }) {
    const { publicKey, signature, message, nonce } = payload;
    const challenge = this.challenges.get(publicKey);
    if (!challenge) {
      console.error('Auth verification failed: No challenge found for', publicKey);
      throw new UnauthorizedException('No challenge found');
    }

    // Strict normalization: remove all \r and ensure \n
    const cleanReceived = message.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const cleanExpected = challenge.message.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    if (challenge.nonce !== nonce) {
      console.error('Nonce mismatch:', { expected: challenge.nonce, received: nonce });
      throw new UnauthorizedException('Invalid nonce');
    }

    if (cleanExpected !== cleanReceived) {
      console.error('Message mismatch detected!');
      console.error('Expected (hex):', Buffer.from(cleanExpected).toString('hex'));
      console.error('Received (hex):', Buffer.from(cleanReceived).toString('hex'));
      throw new UnauthorizedException('Message mismatch');
    }

    // Expire challenges after 5 minutes
    if (Date.now() - challenge.createdAt > 5 * 60 * 1000) {
      this.challenges.delete(publicKey);
      throw new UnauthorizedException('Challenge expired');
    }

    // Always verify against our cleanExpected to be safe
    const ok = verifySolanaSignature(publicKey, signature, cleanExpected);
    if (!ok) {
      console.error('Signature verification failed for user:', publicKey);
      // Log lengths for debugging
      try {
        const sigHex = bs58.decode(signature);
        const pkHex = bs58.decode(publicKey);
        console.error('Signature length:', sigHex.length, 'Public key length:', pkHex.length);
      } catch (e) {}
      throw new UnauthorizedException('Signature invalid');
    }

    // Upsert user and issue token
    const user = await this.users.upsertByWallet(publicKey);
    const token = signToken({ sub: user.id, walletAddress: user.walletAddress });

    // One-time use challenge
    this.challenges.delete(publicKey);

    return { token, user };
  }

  // Backdoor for demo testing as requested
  async devLogin(publicKey: string) {
     if (process.env.NODE_ENV === 'production') throw new UnauthorizedException('Not allowed in prod');
     
     const user = await this.users.upsertByWallet(publicKey);
     const token = signToken({ sub: user.id, walletAddress: user.walletAddress });
     return { token, user };
  }
}

function verifySolanaSignature(publicKeyBase58: string, signatureBase58: string, message: string): boolean {
  try {
    const pk = new Uint8Array(bs58.decode(publicKeyBase58));
    const sig = new Uint8Array(bs58.decode(signatureBase58));
    const msg = new TextEncoder().encode(message);
    
    console.log('DEBUG: Message Bytes Context:', {
      length: msg.length,
      firstBytes: Array.from(msg.slice(0, 10)),
      lastBytes: Array.from(msg.slice(-10)),
      rawMessageLength: message.length
    });

    const result = nacl.sign.detached.verify(msg, sig, pk);
    console.log('DEBUG: nacl verify result:', result);
    return result;
  } catch (e) {
    console.error('DEBUG: Signature decoding error:', e);
    return false;
  }
}

function cryptoSafeNonce(): string {
  // No Node crypto import needed; use random bytes-ish via Math + Date for simplicity in MVP
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
