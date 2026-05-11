import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FavoriteType = 'event_type' | 'form_template' | 'draft' | 'law_article';

export interface Favorite {
    id: string;
    type: FavoriteType;
    referenceId: string;
    title: string;
    addedAt: string;
}

interface FavoritesState {
    favorites: Favorite[];
    loaded: boolean;
    load: () => Promise<void>;
    toggle: (type: FavoriteType, referenceId: string, title: string) => void;
    isFavorite: (referenceId: string) => boolean;
    remove: (referenceId: string) => void;
    getByType: (type: FavoriteType) => Favorite[];
}

const STORAGE_KEY = '@jebs_favorites';

const persist = (favorites: Favorite[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch(console.error);
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favorites: [],
    loaded: false,

    load: async () => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            set({ favorites: raw ? JSON.parse(raw) : [], loaded: true });
        } catch {
            set({ loaded: true });
        }
    },

    toggle: (type, referenceId, title) => {
        const state = get();
        const exists = state.favorites.find((f) => f.referenceId === referenceId);
        let next: Favorite[];
        if (exists) {
            next = state.favorites.filter((f) => f.referenceId !== referenceId);
        } else {
            next = [
                ...state.favorites,
                {
                    id: Date.now().toString(),
                    type,
                    referenceId,
                    title,
                    addedAt: new Date().toISOString(),
                },
            ];
        }
        persist(next);
        set({ favorites: next });
    },

    isFavorite: (referenceId) => {
        return get().favorites.some((f) => f.referenceId === referenceId);
    },

    remove: (referenceId) => {
        const next = get().favorites.filter((f) => f.referenceId !== referenceId);
        persist(next);
        set({ favorites: next });
    },

    getByType: (type) => {
        return get().favorites.filter((f) => f.type === type);
    },
}));
