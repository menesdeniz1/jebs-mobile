// Mock persistence layer
jest.mock('../store/persistence', () => ({
  loadFromStorage: jest.fn().mockResolvedValue([]),
  persistToStorage: jest.fn().mockResolvedValue(true),
  removeFromStorage: jest.fn().mockResolvedValue(true),
  loadEncrypted: jest.fn().mockResolvedValue([]),
  persistEncrypted: jest.fn().mockResolvedValue(true),
}));

import { useFavoritesStore } from '../store/favoritesStore';
import { useSearchStore } from '../store/searchStore';

describe('favoritesStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useFavoritesStore.setState({ favorites: [], loaded: false });
  });

  it('starts with empty favorites', () => {
    const state = useFavoritesStore.getState();
    expect(state.favorites).toEqual([]);
    expect(state.loaded).toBe(false);
  });

  it('load() sets loaded=true', async () => {
    await useFavoritesStore.getState().load();
    expect(useFavoritesStore.getState().loaded).toBe(true);
  });

  it('toggle adds a favorite', () => {
    useFavoritesStore.getState().toggle('event_type', 'darp', 'Darp');
    const state = useFavoritesStore.getState();
    expect(state.favorites).toHaveLength(1);
    expect(state.favorites[0].referenceId).toBe('darp');
    expect(state.favorites[0].title).toBe('Darp');
    expect(state.favorites[0].type).toBe('event_type');
  });

  it('toggle removes an existing favorite', () => {
    useFavoritesStore.getState().toggle('event_type', 'darp', 'Darp');
    useFavoritesStore.getState().toggle('event_type', 'darp', 'Darp');
    expect(useFavoritesStore.getState().favorites).toHaveLength(0);
  });

  it('isFavorite returns correct boolean', () => {
    const store = useFavoritesStore.getState();
    expect(store.isFavorite('darp')).toBe(false);
    store.toggle('event_type', 'darp', 'Darp');
    expect(useFavoritesStore.getState().isFavorite('darp')).toBe(true);
  });

  it('remove deletes by referenceId', () => {
    useFavoritesStore.getState().toggle('event_type', 'darp', 'Darp');
    useFavoritesStore.getState().toggle('event_type', 'hirsizlik', 'Hırsızlık');
    useFavoritesStore.getState().remove('darp');
    const state = useFavoritesStore.getState();
    expect(state.favorites).toHaveLength(1);
    expect(state.favorites[0].referenceId).toBe('hirsizlik');
  });

  it('getByType filters correctly', () => {
    useFavoritesStore.getState().toggle('event_type', 'darp', 'Darp');
    useFavoritesStore.getState().toggle('form_template', 'form1', 'Form');
    expect(useFavoritesStore.getState().getByType('event_type')).toHaveLength(1);
    expect(useFavoritesStore.getState().getByType('form_template')).toHaveLength(1);
    expect(useFavoritesStore.getState().getByType('draft')).toHaveLength(0);
  });
});

describe('searchStore', () => {
  beforeEach(() => {
    useSearchStore.setState({ history: [], loaded: false });
  });

  it('starts with empty history', () => {
    expect(useSearchStore.getState().history).toEqual([]);
  });

  it('load() sets loaded=true', async () => {
    await useSearchStore.getState().load();
    expect(useSearchStore.getState().loaded).toBe(true);
  });

  it('addQuery adds to front of history', () => {
    useSearchStore.getState().addQuery('darp');
    useSearchStore.getState().addQuery('hırsızlık');
    expect(useSearchStore.getState().history).toEqual(['hırsızlık', 'darp']);
  });

  it('addQuery deduplicates and moves to front', () => {
    useSearchStore.getState().addQuery('darp');
    useSearchStore.getState().addQuery('hırsızlık');
    useSearchStore.getState().addQuery('darp');
    expect(useSearchStore.getState().history).toEqual(['darp', 'hırsızlık']);
  });

  it('addQuery caps at 10 entries', () => {
    for (let i = 0; i < 15; i++) {
      useSearchStore.getState().addQuery(`query-${i}`);
    }
    expect(useSearchStore.getState().history).toHaveLength(10);
    expect(useSearchStore.getState().history[0]).toBe('query-14');
  });

  it('clear empties history', () => {
    useSearchStore.getState().addQuery('test');
    useSearchStore.getState().clear();
    expect(useSearchStore.getState().history).toEqual([]);
  });
});

