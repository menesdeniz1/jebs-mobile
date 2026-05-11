import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchState {
    history: string[];
    loaded: boolean;
    load: () => Promise<void>;
    addQuery: (query: string) => void;
    clear: () => void;
}

const STORAGE_KEY = '@jebs_search_history';
const MAX_HISTORY = 10;

export const useSearchStore = create<SearchState>((set, get) => ({
    history: [],
    loaded: false,

    load: async () => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            set({ history: raw ? JSON.parse(raw) : [], loaded: true });
        } catch {
            set({ loaded: true });
        }
    },

    addQuery: (query) => {
        const state = get();
        const filtered = state.history.filter((q) => q !== query);
        const next = [query, ...filtered].slice(0, MAX_HISTORY);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(console.error);
        set({ history: next });
    },

    clear: () => {
        AsyncStorage.removeItem(STORAGE_KEY).catch(console.error);
        set({ history: [] });
    },
}));
