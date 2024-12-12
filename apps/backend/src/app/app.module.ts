import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PlcModule } from '../pimm/pimm.module';

@Module({
  imports: [PlcModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
