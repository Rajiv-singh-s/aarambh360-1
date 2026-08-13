import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import type { SyllabusTreeNodeDto } from '@aarambh360/types';
import { ExamService } from '../exam/exam.service';

const SYLLABUS_CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class SyllabusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly examService: ExamService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getSyllabusTree(examCode: string): Promise<SyllabusTreeNodeDto[]> {
    const normalizedCode = examCode.trim().toUpperCase().replace(/-/g, '_');
    const cacheKey = `syllabus-tree:${normalizedCode}`;
    const cached = await this.cacheManager.get<SyllabusTreeNodeDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const exam = await this.examService.resolveExam(examCode);
    const nodes = await this.prisma.syllabusNode.findMany({
      where: {
        examId: exam.id,
        publishStatus: 'PUBLISHED',
      },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      select: {
        id: true,
        parentId: true,
        title: true,
        description: true,
        sortOrder: true,
        path: true,
      },
    });

    if (nodes.length === 0) {
      throw new NotFoundException(`Syllabus not found for exam: ${examCode}`);
    }

    const tree = this.buildTree(nodes);
    await this.cacheManager.set(cacheKey, tree, SYLLABUS_CACHE_TTL_MS);
    return tree;
  }

  private buildTree(
    nodes: Array<{
      id: string;
      parentId: string | null;
      title: string;
      description: string | null;
      sortOrder: number;
      path: string | null;
    }>,
  ): SyllabusTreeNodeDto[] {
    const byParent = new Map<string | null, SyllabusTreeNodeDto[]>();

    for (const node of nodes) {
      const dto: SyllabusTreeNodeDto = {
        id: node.id,
        title: node.title,
        description: node.description,
        sortOrder: node.sortOrder,
        path: node.path,
        children: [],
      };
      const siblings = byParent.get(node.parentId) ?? [];
      siblings.push(dto);
      byParent.set(node.parentId, siblings);
    }

    const attachChildren = (node: SyllabusTreeNodeDto): SyllabusTreeNodeDto => ({
      ...node,
      children: (byParent.get(node.id) ?? []).map(attachChildren),
    });

    return (byParent.get(null) ?? []).map(attachChildren);
  }
}
