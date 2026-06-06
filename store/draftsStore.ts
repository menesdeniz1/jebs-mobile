import { create } from 'zustand';
import { loadEncrypted, persistEncrypted } from './persistence';

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

const STORAGE_KEY = '@gendarme_drafts_v1';

export const useDraftsStore = create<DraftsState>((set, get) => ({
    drafts: [],
    loaded: false,

    load: async () => {
        const drafts = await loadEncrypted<Draft[]>(STORAGE_KEY, []);
        set({ drafts, loaded: true });
    },

    save: (draft) => {
        const state = get();
        const filtered = state.drafts.filter((d) => d.id !== draft.id);
        const next = [draft, ...filtered];
        set({ drafts: next });
        persistEncrypted(STORAGE_KEY, next);
    },

    remove: (id) => {
        const next = get().drafts.filter((d) => d.id !== id);
        set({ drafts: next });
        persistEncrypted(STORAGE_KEY, next);
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
