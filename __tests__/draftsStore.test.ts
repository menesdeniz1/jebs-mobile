// Mock persistence layer
jest.mock('../store/persistence', () => ({
  loadFromStorage: jest.fn().mockResolvedValue([]),
  persistToStorage: jest.fn().mockResolvedValue(true),
  removeFromStorage: jest.fn().mockResolvedValue(true),
  loadEncrypted: jest.fn().mockResolvedValue([]),
  persistEncrypted: jest.fn().mockResolvedValue(true),
}));

import { useDraftsStore, type Draft } from '../store/draftsStore';
import { persistEncrypted, loadEncrypted } from '../store/persistence';

const makeDraft = (overrides: Partial<Draft> = {}): Draft => ({
  id: `draft-${Date.now()}-${Math.random()}`,
  templateId: 'ust_arama',
  templateTitle: 'Üst Arama Tutanağı',
  values: { il: 'Ankara', ilce: 'Çankaya' },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  useDraftsStore.setState({ drafts: [], loaded: false });
});

describe('draftsStore', () => {
  it('starts with empty drafts and loaded=false', () => {
    const state = useDraftsStore.getState();
    expect(state.drafts).toEqual([]);
    expect(state.loaded).toBe(false);
  });

  it('load() sets loaded=true and loads from persistence', async () => {
    const mockDrafts = [makeDraft({ id: 'saved-1' })];
    (loadEncrypted as jest.Mock).mockResolvedValueOnce(mockDrafts);
    await useDraftsStore.getState().load();
    const state = useDraftsStore.getState();
    expect(state.loaded).toBe(true);
    expect(state.drafts).toEqual(mockDrafts);
  });

  it('save() adds a new draft at the front', () => {
    const draft = makeDraft({ id: 'new-1' });
    useDraftsStore.getState().save(draft);
    const state = useDraftsStore.getState();
    expect(state.drafts).toHaveLength(1);
    expect(state.drafts[0].id).toBe('new-1');
    expect(persistEncrypted).toHaveBeenCalled();
  });

  it('save() updates existing draft (replaces same ID)', () => {
    const draft1 = makeDraft({ id: 'update-1', values: { il: 'Ankara' } });
    const draft2 = makeDraft({ id: 'update-1', values: { il: 'İstanbul' } });
    useDraftsStore.getState().save(draft1);
    useDraftsStore.getState().save(draft2);
    const state = useDraftsStore.getState();
    expect(state.drafts).toHaveLength(1);
    expect(state.drafts[0].values.il).toBe('İstanbul');
  });

  it('save() puts updated draft at the front', () => {
    const draft1 = makeDraft({ id: 'a' });
    const draft2 = makeDraft({ id: 'b' });
    useDraftsStore.getState().save(draft1);
    useDraftsStore.getState().save(draft2);
    // Now update draft1 — it should move to front
    const draft1Updated = makeDraft({ id: 'a', values: { il: 'İzmir' } });
    useDraftsStore.getState().save(draft1Updated);
    const state = useDraftsStore.getState();
    expect(state.drafts[0].id).toBe('a');
    expect(state.drafts[1].id).toBe('b');
  });

  it('remove() deletes by ID', () => {
    const draft1 = makeDraft({ id: 'del-1' });
    const draft2 = makeDraft({ id: 'del-2' });
    useDraftsStore.getState().save(draft1);
    useDraftsStore.getState().save(draft2);
    useDraftsStore.getState().remove('del-1');
    const state = useDraftsStore.getState();
    expect(state.drafts).toHaveLength(1);
    expect(state.drafts[0].id).toBe('del-2');
  });

  it('getByTemplate() filters by templateId', () => {
    useDraftsStore.getState().save(makeDraft({ id: 't1', templateId: 'ust_arama' }));
    useDraftsStore.getState().save(makeDraft({ id: 't2', templateId: 'yakalama' }));
    useDraftsStore.getState().save(makeDraft({ id: 't3', templateId: 'ust_arama' }));
    const result = useDraftsStore.getState().getByTemplate('ust_arama');
    expect(result).toHaveLength(2);
    result.forEach((d) => expect(d.templateId).toBe('ust_arama'));
  });

  it('getRecent() returns most recently updated drafts', () => {
    useDraftsStore.getState().save(makeDraft({
      id: 'old', updatedAt: '2026-01-01T00:00:00Z',
    }));
    useDraftsStore.getState().save(makeDraft({
      id: 'new', updatedAt: '2026-06-01T00:00:00Z',
    }));
    useDraftsStore.getState().save(makeDraft({
      id: 'mid', updatedAt: '2026-03-01T00:00:00Z',
    }));
    const recent = useDraftsStore.getState().getRecent(2);
    expect(recent).toHaveLength(2);
    expect(recent[0].id).toBe('new');
    expect(recent[1].id).toBe('mid');
  });

  it('getRecent() returns all when count exceeds available', () => {
    useDraftsStore.getState().save(makeDraft({ id: 'only' }));
    const recent = useDraftsStore.getState().getRecent(10);
    expect(recent).toHaveLength(1);
  });
});
