import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedForm {
    id: string;
    template_id: string;
    values: Record<string, string>;
    created_at: string;
    updated_at: string;
    is_draft: boolean;
    pdf_path: string | null;
}

export interface Favorite {
    id: string;
    type: 'event_type' | 'form_template';
    reference_id: string;
    added_at: string;
}

interface AppState {
    favorites: Favorite[];
    savedForms: SavedForm[];
    searchHistory: string[];
    checklistState: Record<string, boolean[]>;

    // Actions
    toggleFavorite: (type: 'event_type' | 'form_template', referenceId: string) => void;
    isFavorite: (referenceId: string) => boolean;
    addSearchHistory: (query: string) => void;
    clearSearchHistory: () => void;
    saveForm: (form: SavedForm) => void;
    deleteForm: (id: string) => void;
    getFormsByTemplate: (templateId: string) => SavedForm[];
    toggleChecklistItem: (eventId: string, stepIndex: number, totalSteps: number) => void;
    getChecklistState: (eventId: string) => boolean[];
    loadPersistedData: () => Promise<void>;
}

const STORAGE_KEYS = {
    FAVORITES: '@jebs_favorites',
    SAVED_FORMS: '@jebs_saved_forms',
    SEARCH_HISTORY: '@jebs_search_history',
    CHECKLIST: '@jebs_checklist',
};

export const useAppStore = create<AppState>((set, get) => ({
    favorites: [],
    savedForms: [],
    searchHistory: [],
    checklistState: {},

    toggleFavorite: (type, referenceId) => {
        set((state) => {
            const exists = state.favorites.find((f) => f.reference_id === referenceId);
            let newFavorites: Favorite[];
            if (exists) {
                newFavorites = state.favorites.filter((f) => f.reference_id !== referenceId);
            } else {
                newFavorites = [
                    ...state.favorites,
                    {
                        id: Date.now().toString(),
                        type,
                        reference_id: referenceId,
                        added_at: new Date().toISOString(),
                    },
                ];
            }
            AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
            return { favorites: newFavorites };
        });
    },

    isFavorite: (referenceId) => {
        return get().favorites.some((f) => f.reference_id === referenceId);
    },

    addSearchHistory: (query) => {
        set((state) => {
            const filtered = state.searchHistory.filter((q) => q !== query);
            const newHistory = [query, ...filtered].slice(0, 20);
            AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(newHistory));
            return { searchHistory: newHistory };
        });
    },

    clearSearchHistory: () => {
        AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
        set({ searchHistory: [] });
    },

    saveForm: (form) => {
        set((state) => {
            const filtered = state.savedForms.filter((f) => f.id !== form.id);
            const newForms = [form, ...filtered];
            AsyncStorage.setItem(STORAGE_KEYS.SAVED_FORMS, JSON.stringify(newForms));
            return { savedForms: newForms };
        });
    },

    deleteForm: (id) => {
        set((state) => {
            const newForms = state.savedForms.filter((f) => f.id !== id);
            AsyncStorage.setItem(STORAGE_KEYS.SAVED_FORMS, JSON.stringify(newForms));
            return { savedForms: newForms };
        });
    },

    getFormsByTemplate: (templateId) => {
        return get().savedForms.filter((f) => f.template_id === templateId);
    },

    toggleChecklistItem: (eventId, stepIndex, totalSteps) => {
        set((state) => {
            const current = state.checklistState[eventId] || new Array(totalSteps).fill(false);
            const updated = [...current];
            updated[stepIndex] = !updated[stepIndex];
            const newState = { ...state.checklistState, [eventId]: updated };
            AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(newState));
            return { checklistState: newState };
        });
    },

    getChecklistState: (eventId) => {
        return get().checklistState[eventId] || [];
    },

    loadPersistedData: async () => {
        try {
            const [favData, formsData, historyData, checklistData] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
                AsyncStorage.getItem(STORAGE_KEYS.SAVED_FORMS),
                AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY),
                AsyncStorage.getItem(STORAGE_KEYS.CHECKLIST),
            ]);
            set({
                favorites: favData ? JSON.parse(favData) : [],
                savedForms: formsData ? JSON.parse(formsData) : [],
                searchHistory: historyData ? JSON.parse(historyData) : [],
                checklistState: checklistData ? JSON.parse(checklistData) : {},
            });
        } catch (error) {
            console.error('Failed to load persisted data:', error);
        }
    },
}));
