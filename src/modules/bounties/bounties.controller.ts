import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { BountiesService } from './bounties.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('bounties')
export class BountiesController {
  constructor(private readonly bounties: BountiesService) {}

  @Get()
  list() {
    return this.bounties.findAll();
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Request() req, @Body() body: any) {
    return this.bounties.create(req.user.id, body);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.bounties.findOne(id);
  }

  @Post(':id/apply')
  @UseGuards(AuthGuard)
  apply(@Request() req, @Param('id') id: string, @Body('content') content: string) {
    return this.bounties.apply(id, req.user.id, content);
  }

  @Get(':id/applications')
  @UseGuards(AuthGuard)
  applications(@Request() req, @Param('id') id: string) {
    return this.bounties.getApplications(id, req.user.id);
  }

  // NOTE: Ideally these would be under /applications controller, but keeping here for simplicity
  @Patch('applications/:id/accept')
  @UseGuards(AuthGuard)
  accept(@Request() req, @Param('id') id: string) {
    return this.bounties.acceptApplication(id, req.user.id);
  }

  @Patch('applications/:id/reject')
  @UseGuards(AuthGuard)
  reject(@Request() req, @Param('id') id: string) {
    return this.bounties.rejectApplication(id, req.user.id);
  }

  @Post('applications/:id/delete') // Using POST for easy browser compatibility or DELETE
  @UseGuards(AuthGuard)
  deleteApp(@Request() req, @Param('id') id: string) {
    return this.bounties.deleteApplication(id, req.user.id);
  }
}
