import { validateField, validateForm } from '../lib/validation';

describe('validateField', () => {
  describe('required fields', () => {
    it('returns error for empty required field', () => {
      expect(validateField('name', '', true)).toBe('Bu alan zorunludur');
    });

    it('returns error for whitespace-only required field', () => {
      expect(validateField('name', '   ', true)).toBe('Bu alan zorunludur');
    });

    it('returns null for non-empty required field', () => {
      expect(validateField('name', 'Ahmet', true)).toBeNull();
    });
  });

  describe('optional fields', () => {
    it('returns null for empty optional field', () => {
      expect(validateField('name', '', false)).toBeNull();
    });

    it('returns null for whitespace-only optional field', () => {
      expect(validateField('notes', '   ', false)).toBeNull();
    });
  });

  describe('TC Kimlik validation', () => {
    it('accepts valid 11-digit TC Kimlik', () => {
      expect(validateField('tc_kimlik', '12345678901', false)).toBeNull();
    });

    it('rejects TC Kimlik shorter than 11 digits', () => {
      expect(validateField('tc_kimlik', '1234567890', false)).toBe(
        'T.C. Kimlik No 11 haneli olmalıdır'
      );
    });

    it('rejects TC Kimlik longer than 11 digits', () => {
      expect(validateField('tc_kimlik', '123456789012', false)).toBe(
        'T.C. Kimlik No 11 haneli olmalıdır'
      );
    });

    it('rejects TC Kimlik with non-numeric chars', () => {
      expect(validateField('tc_kimlik', '1234567890a', false)).toBe(
        'T.C. Kimlik No 11 haneli olmalıdır'
      );
    });

    it('matches field IDs containing "tc"', () => {
      expect(validateField('supheli_tc', '12345678901', false)).toBeNull();
    });

    it('matches field IDs containing "kimlik"', () => {
      expect(validateField('kimlik_no', '12345678901', false)).toBeNull();
    });
  });

  describe('Sicil No validation', () => {
    it('accepts valid numeric sicil', () => {
      expect(validateField('duzenleyen_sicil', '12345', false)).toBeNull();
    });

    it('rejects sicil with letters', () => {
      expect(validateField('duzenleyen_sicil', '123abc', false)).toBe(
        'Sicil No yalnızca rakam içermelidir'
      );
    });
  });
});

describe('validateForm', () => {
  const fields = [
    { id: 'name', required: true },
    { id: 'tc_kimlik', required: false },
    { id: 'notes', required: false },
  ];

  it('returns empty errors for valid form', () => {
    const values = { name: 'Ahmet', tc_kimlik: '12345678901', notes: '' };
    expect(validateForm(fields, values)).toEqual({});
  });

  it('returns errors for missing required fields', () => {
    const values = { tc_kimlik: '12345678901' };
    const errors = validateForm(fields, values);
    expect(errors.name).toBe('Bu alan zorunludur');
    expect(errors.tc_kimlik).toBeUndefined();
  });

  it('returns multiple errors', () => {
    const values = { name: '', tc_kimlik: 'abc' };
    const errors = validateForm(fields, values);
    expect(errors.name).toBe('Bu alan zorunludur');
    expect(errors.tc_kimlik).toBe('T.C. Kimlik No 11 haneli olmalıdır');
  });
});
