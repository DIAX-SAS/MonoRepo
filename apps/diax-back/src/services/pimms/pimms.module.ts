import { Module } from '@nestjs/common';
import { PIMMController } from './pimms.controller';
import { PIMMService } from './pimms.service';

@Module({
  imports: [],
  controllers: [PIMMController],
  providers: [PIMMService],
  exports: [PIMMService],
})
export class PimmsModule {}