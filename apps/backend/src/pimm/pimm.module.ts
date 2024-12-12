import { Module } from '@nestjs/common';
import { PlcController } from './pimm.controller';
import { PlcService } from './pimm.service';

@Module({
  imports: [
  ],
  controllers: [PlcController],
  providers: [PlcService],
  exports: [PlcService],
})
export class PlcModule {}
