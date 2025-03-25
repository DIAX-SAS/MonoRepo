import { Module } from '@nestjs/common';
import { PIMMSController } from './pimms.controller';
import { PimmsService } from './pimms.service';

@Module({
  imports: [],
  controllers: [PIMMSController],
  providers: [PimmsService],
  exports: [PimmsService],
})

export class PimmsModule {}
