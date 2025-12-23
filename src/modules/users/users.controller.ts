import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../../shared/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: any) {
    const { sub } = req.user;
    const user = this.users.findById(sub);
    return user;
  }

  @Get('leaderboard')
  leaderboard() {
    return this.users.getLeaderboard();
  }
}
