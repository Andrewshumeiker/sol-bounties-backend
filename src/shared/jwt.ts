import * as jwt from 'jsonwebtoken';

export type JwtPayload = {
  sub: string; // userId
  walletAddress: string;
};

export function signToken(payload: JwtPayload) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.verify(token, secret) as JwtPayload;
}
