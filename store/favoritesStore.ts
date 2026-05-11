import { create } from 'zustand';
import { loadFromStorage, persistToStorage } from './persistence';

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

const STORAGE_KEY = '@gendarme:favorites:v1';

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favorites: [],
    loaded: false,

    load: async () => {
        const favorites = await loadFromStorage<Favorite[]>(STORAGE_KEY, []);
        set({ favorites, loaded: true });
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
        set({ favorites: next });
        persistToStorage(STORAGE_KEY, next);
    },

    isFavorite: (referenceId) => {
        return get().favorites.some((f) => f.referenceId === referenceId);
    },

    remove: (referenceId) => {
        const next = get().favorites.filter((f) => f.referenceId !== referenceId);
        set({ favorites: next });
        persistToStorage(STORAGE_KEY, next);
    },

    getByType: (type) => {
        return get().favorites.filter((f) => f.type === type);
    },
}));
