import { Module } from '@nestjs/common';
import { StreakModule } from '../streak/streak.module';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [StreakModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
