/**
 * Officer profile store (P3-16).
 *
 * Stores the officer's personal information (name, rank, sicil no, unit)
 * for auto-filling officer fields in forms. Persisted encrypted since
 * it contains PII (name + sicil no).
 */
import { create } from 'zustand';
import { loadEncrypted, persistEncrypted } from './persistence';

export interface OfficerProfile {
  name: string;
  rank: string;
  sicilNo: string;
  unit: string;
}

const EMPTY_PROFILE: OfficerProfile = {
  name: '',
  rank: '',
  sicilNo: '',
  unit: '',
};

interface OfficerProfileState {
  profile: OfficerProfile;
  loaded: boolean;
  load: () => Promise<void>;
  update: (profile: Partial<OfficerProfile>) => void;
  clear: () => void;
  /** Check if profile has any data filled in */
  hasProfile: () => boolean;
}

const STORAGE_KEY = '@gendarme_officer_profile_v1';

export const useOfficerProfileStore = create<OfficerProfileState>((set, get) => ({
  profile: { ...EMPTY_PROFILE },
  loaded: false,

  load: async () => {
    const profile = await loadEncrypted<OfficerProfile>(STORAGE_KEY, { ...EMPTY_PROFILE });
    set({ profile, loaded: true });
  },

  update: (partial) => {
    const current = get().profile;
    const next = { ...current, ...partial };
    set({ profile: next });
    persistEncrypted(STORAGE_KEY, next);
  },

  clear: () => {
    set({ profile: { ...EMPTY_PROFILE } });
    persistEncrypted(STORAGE_KEY, { ...EMPTY_PROFILE });
  },

  hasProfile: () => {
    const p = get().profile;
    return !!(p.name || p.rank || p.sicilNo || p.unit);
  },
}));

/**
 * Map officer profile fields to form field IDs.
 * Returns a partial values object for auto-filling.
 */
export function getOfficerAutoFillValues(profile: OfficerProfile): Record<string, string> {
  const values: Record<string, string> = {};

  if (profile.name) {
    values['duzenleyen_ad'] = profile.name;
    values['duzenleyen_isim'] = profile.name;
    values['memur_ad'] = profile.name;
  }

  if (profile.rank) {
    values['duzenleyen_rutbe'] = profile.rank;
    values['memur_rutbe'] = profile.rank;
  }

  if (profile.sicilNo) {
    values['duzenleyen_sicil'] = profile.sicilNo;
    values['memur_sicil'] = profile.sicilNo;
  }

  if (profile.unit) {
    values['duzenleyen_birim'] = profile.unit;
    values['memur_birim'] = profile.unit;
  }

  return values;
}
