import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamInfoController } from './exam-info.controller';
import { ExamService } from './exam.service';

@Module({
  controllers: [ExamController, ExamInfoController],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}
