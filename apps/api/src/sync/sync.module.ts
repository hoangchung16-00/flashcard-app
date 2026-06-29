import { Module } from '@nestjs/common';
import { SeedModule } from '../seed/seed.module';
import { StreakModule } from '../streak/streak.module';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [StreakModule, SeedModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
