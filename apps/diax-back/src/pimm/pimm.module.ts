import { Module } from '@nestjs/common';
import { PIMMController } from './pimm.controller';
import { PIMMService } from './pimm.service';

@Module({
  imports: [
  ],
  controllers: [PIMMController],
  providers: [PIMMService],
  exports: [PIMMService],
})
export class PIMMModule {}