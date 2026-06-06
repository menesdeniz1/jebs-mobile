import { create } from 'zustand';
import { loadFromStorage, persistToStorage, removeFromStorage } from './persistence';

interface SearchState {
    history: string[];
    loaded: boolean;
    load: () => Promise<void>;
    addQuery: (query: string) => void;
    clear: () => void;
}

const STORAGE_KEY = '@gendarme_search_history_v1';
const MAX_HISTORY = 10;

export const useSearchStore = create<SearchState>((set, get) => ({
    history: [],
    loaded: false,

    load: async () => {
        const history = await loadFromStorage<string[]>(STORAGE_KEY, []);
        set({ history, loaded: true });
    },

    addQuery: (query) => {
        const state = get();
        const filtered = state.history.filter((q) => q !== query);
        const next = [query, ...filtered].slice(0, MAX_HISTORY);
        set({ history: next });
        persistToStorage(STORAGE_KEY, next);
    },

    clear: () => {
        set({ history: [] });
        removeFromStorage(STORAGE_KEY);
    },
}));
