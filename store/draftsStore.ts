import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Draft {
    id: string;
    templateId: string;
    templateTitle: string;
    values: Record<string, string>;
    createdAt: string;
    updatedAt: string;
}

interface DraftsState {
    drafts: Draft[];
    loaded: boolean;
    load: () => Promise<void>;
    save: (draft: Draft) => void;
    remove: (id: string) => void;
    getByTemplate: (templateId: string) => Draft[];
    getRecent: (count: number) => Draft[];
}

const STORAGE_KEY = '@jebs_drafts';

const persist = (drafts: Draft[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(drafts)).catch(console.error);
};

export const useDraftsStore = create<DraftsState>((set, get) => ({
    drafts: [],
    loaded: false,

    load: async () => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            set({ drafts: raw ? JSON.parse(raw) : [], loaded: true });
        } catch {
            set({ loaded: true });
        }
    },

    save: (draft) => {
        const state = get();
        const filtered = state.drafts.filter((d) => d.id !== draft.id);
        const next = [draft, ...filtered];
        persist(next);
        set({ drafts: next });
    },

    remove: (id) => {
        const next = get().drafts.filter((d) => d.id !== id);
        persist(next);
        set({ drafts: next });
    },

    getByTemplate: (templateId) => {
        return get().drafts.filter((d) => d.templateId === templateId);
    },

    getRecent: (count) => {
        return get()
            .drafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, count);
    },
}));
