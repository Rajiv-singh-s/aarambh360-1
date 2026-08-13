import { Module } from '@nestjs/common';
import { ExamModule } from '../exam/exam.module';
import { SyllabusController } from './syllabus.controller';
import { SyllabusService } from './syllabus.service';

@Module({
  imports: [ExamModule],
  controllers: [SyllabusController],
  providers: [SyllabusService],
})
export class SyllabusModule {}
