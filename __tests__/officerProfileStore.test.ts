// Mock persistence layer
jest.mock('../store/persistence', () => ({
  loadFromStorage: jest.fn().mockResolvedValue([]),
  persistToStorage: jest.fn().mockResolvedValue(true),
  removeFromStorage: jest.fn().mockResolvedValue(true),
  loadEncrypted: jest.fn().mockResolvedValue({
    name: '',
    rank: '',
    sicilNo: '',
    unit: '',
  }),
  persistEncrypted: jest.fn().mockResolvedValue(true),
}));

import {
  useOfficerProfileStore,
  getOfficerAutoFillValues,
  type OfficerProfile,
} from '../store/officerProfileStore';
import { loadEncrypted, persistEncrypted } from '../store/persistence';

beforeEach(() => {
  jest.clearAllMocks();
  useOfficerProfileStore.setState({
    profile: { name: '', rank: '', sicilNo: '', unit: '' },
    loaded: false,
  });
});

describe('officerProfileStore', () => {
  it('starts with empty profile', () => {
    const state = useOfficerProfileStore.getState();
    expect(state.profile.name).toBe('');
    expect(state.profile.rank).toBe('');
    expect(state.profile.sicilNo).toBe('');
    expect(state.profile.unit).toBe('');
    expect(state.loaded).toBe(false);
  });

  it('load() sets loaded=true and loads from persistence', async () => {
    const savedProfile: OfficerProfile = {
      name: 'Ahmet Yılmaz',
      rank: 'Üsteğmen',
      sicilNo: '12345',
      unit: 'Çankaya İlçe J.K.',
    };
    (loadEncrypted as jest.Mock).mockResolvedValueOnce(savedProfile);
    await useOfficerProfileStore.getState().load();
    const state = useOfficerProfileStore.getState();
    expect(state.loaded).toBe(true);
    expect(state.profile).toEqual(savedProfile);
  });

  it('update() partially updates profile', () => {
    useOfficerProfileStore.getState().update({ name: 'Mehmet', rank: 'Yüzbaşı' });
    const state = useOfficerProfileStore.getState();
    expect(state.profile.name).toBe('Mehmet');
    expect(state.profile.rank).toBe('Yüzbaşı');
    expect(state.profile.sicilNo).toBe(''); // unchanged
    expect(persistEncrypted).toHaveBeenCalled();
  });

  it('update() merges with existing data', () => {
    useOfficerProfileStore.getState().update({ name: 'Ali' });
    useOfficerProfileStore.getState().update({ rank: 'Çavuş' });
    const state = useOfficerProfileStore.getState();
    expect(state.profile.name).toBe('Ali');
    expect(state.profile.rank).toBe('Çavuş');
  });

  it('clear() resets to empty profile', () => {
    useOfficerProfileStore.getState().update({
      name: 'Ali',
      rank: 'Çavuş',
      sicilNo: '999',
      unit: 'Birim',
    });
    useOfficerProfileStore.getState().clear();
    const state = useOfficerProfileStore.getState();
    expect(state.profile.name).toBe('');
    expect(state.profile.rank).toBe('');
    expect(state.profile.sicilNo).toBe('');
    expect(state.profile.unit).toBe('');
  });

  it('hasProfile() returns false for empty profile', () => {
    expect(useOfficerProfileStore.getState().hasProfile()).toBe(false);
  });

  it('hasProfile() returns true when any field is filled', () => {
    useOfficerProfileStore.getState().update({ name: 'Test' });
    expect(useOfficerProfileStore.getState().hasProfile()).toBe(true);
  });

  it('hasProfile() returns true when only unit is filled', () => {
    useOfficerProfileStore.getState().update({ unit: 'Birim' });
    expect(useOfficerProfileStore.getState().hasProfile()).toBe(true);
  });
});

describe('getOfficerAutoFillValues', () => {
  it('maps all filled fields to form field IDs', () => {
    const profile: OfficerProfile = {
      name: 'Ahmet',
      rank: 'Üsteğmen',
      sicilNo: '12345',
      unit: 'Çankaya J.K.',
    };
    const values = getOfficerAutoFillValues(profile);
    expect(values['duzenleyen_ad']).toBe('Ahmet');
    expect(values['duzenleyen_isim']).toBe('Ahmet');
    expect(values['memur_ad']).toBe('Ahmet');
    expect(values['duzenleyen_rutbe']).toBe('Üsteğmen');
    expect(values['memur_rutbe']).toBe('Üsteğmen');
    expect(values['duzenleyen_sicil']).toBe('12345');
    expect(values['memur_sicil']).toBe('12345');
    expect(values['duzenleyen_birim']).toBe('Çankaya J.K.');
    expect(values['memur_birim']).toBe('Çankaya J.K.');
  });

  it('omits empty fields from mapping', () => {
    const profile: OfficerProfile = {
      name: 'Ahmet',
      rank: '',
      sicilNo: '',
      unit: '',
    };
    const values = getOfficerAutoFillValues(profile);
    expect(values['duzenleyen_ad']).toBe('Ahmet');
    expect(values['duzenleyen_rutbe']).toBeUndefined();
    expect(values['duzenleyen_sicil']).toBeUndefined();
    expect(values['duzenleyen_birim']).toBeUndefined();
  });

  it('returns empty object for fully empty profile', () => {
    const profile: OfficerProfile = { name: '', rank: '', sicilNo: '', unit: '' };
    const values = getOfficerAutoFillValues(profile);
    expect(Object.keys(values)).toHaveLength(0);
  });
});
