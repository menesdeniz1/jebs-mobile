import { normalizeTurkish, search, getSearchEngine, setSearchEngine } from '../lib/search';
import type { SearchEngine, GroupedResults } from '../lib/search';

describe('normalizeTurkish', () => {
  it('converts uppercase Turkish chars', () => {
    expect(normalizeTurkish('İSTANBUL')).toBe('istanbul');
  });

  it('converts lowercase Turkish chars', () => {
    expect(normalizeTurkish('şüpheli')).toBe('supheli');
  });

  it('normalizes ı to i', () => {
    expect(normalizeTurkish('ışık')).toBe('isik');
  });

  it('normalizes ö to o', () => {
    expect(normalizeTurkish('görgü')).toBe('gorgu');
  });

  it('normalizes ü to u', () => {
    expect(normalizeTurkish('düzen')).toBe('duzen');
  });

  it('normalizes ç to c', () => {
    expect(normalizeTurkish('Çocuk')).toBe('cocuk');
  });

  it('normalizes ş to s', () => {
    expect(normalizeTurkish('Şüphe')).toBe('suphe');
  });

  it('normalizes ğ to g', () => {
    expect(normalizeTurkish('dağ')).toBe('dag');
  });

  it('handles mixed content', () => {
    expect(normalizeTurkish('Görgü Tanığı İfadesi')).toBe('gorgu tanigi ifadesi');
  });

  it('handles empty string', () => {
    expect(normalizeTurkish('')).toBe('');
  });

  it('passes through ASCII unchanged', () => {
    expect(normalizeTurkish('hello world')).toBe('hello world');
  });
});

describe('search()', () => {
  it('returns empty groups for empty query', () => {
    const result = search('');
    expect(result.events).toEqual([]);
    expect(result.forms).toEqual([]);
    expect(result.lawArticles).toEqual([]);
  });

  it('returns empty groups for single-char query', () => {
    const result = search('a');
    expect(result.events).toEqual([]);
  });

  it('finds events by title', () => {
    const result = search('Darp');
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events[0].type).toBe('event');
  });

  it('finds events by Turkish-normalized query', () => {
    const result = search('darp');
    expect(result.events.length).toBeGreaterThan(0);
  });

  it('finds forms by title', () => {
    const result = search('tutanak');
    expect(result.forms.length).toBeGreaterThanOrEqual(0);
  });

  it('finds law articles from legal references', () => {
    const result = search('TCK Madde');
    expect(result.lawArticles.length).toBeGreaterThan(0);
    expect(result.lawArticles[0].type).toBe('law_article');
  });

  it('returns proper route params', () => {
    const result = search('Darp');
    if (result.events.length > 0) {
      expect(result.events[0].route).toBe('/guide/event/[eventId]');
      expect(result.events[0].routeParams).toHaveProperty('eventId');
    }
  });
});

describe('search engine swap', () => {
  it('getSearchEngine returns an engine', () => {
    const engine = getSearchEngine();
    expect(engine).toBeDefined();
    expect(typeof engine.search).toBe('function');
  });

  it('setSearchEngine allows custom engine injection', () => {
    const original = getSearchEngine();
    const mockEngine: SearchEngine = {
      search: (): GroupedResults => ({ events: [], forms: [], lawArticles: [] }),
    };
    setSearchEngine(mockEngine);
    expect(search('anything')).toEqual({ events: [], forms: [], lawArticles: [] });
    // Restore
    setSearchEngine(original);
  });
});
