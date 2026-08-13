import { ChunkingService } from './chunking.service';

describe('ChunkingService', () => {
  let service: ChunkingService;

  beforeEach(() => {
    service = new ChunkingService();
  });

  it('returns one chunk for short content', () => {
    const chunks = service.chunkDocument('Short lesson body');
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.chunkIndex).toBe(0);
  });

  it('splits long content with overlap', () => {
    const content = 'word '.repeat(900);
    const chunks = service.chunkDocument(content);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.chunkIndex).toBe(0);
    expect(chunks[1]?.chunkIndex).toBe(1);
  });
});
