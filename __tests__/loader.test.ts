/**
 * Tests for data/loader.ts
 * Validates that the JSON data loads correctly with schema validation.
 */

import {
  getCategories,
  getEvents,
  getForms,
  getEventById,
  getCategoryById,
  getFormById,
  getEventsByCategory,
} from '../data/loader';

describe('getCategories', () => {
  it('returns an array of categories', () => {
    const categories = getCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  it('each category has required fields', () => {
    const categories = getCategories();
    for (const cat of categories) {
      expect(typeof cat.id).toBe('string');
      expect(typeof cat.title).toBe('string');
      expect(typeof cat.icon).toBe('string');
      expect(typeof cat.description).toBe('string');
      expect(typeof cat.color).toBe('string');
      expect(typeof cat.order).toBe('number');
    }
  });

  it('returns cached result on second call', () => {
    const first = getCategories();
    const second = getCategories();
    expect(first).toBe(second); // same reference = cached
  });
});

describe('getEvents', () => {
  it('returns an array of events', () => {
    const events = getEvents();
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);
  });

  it('each event has required fields', () => {
    const events = getEvents();
    for (const event of events) {
      expect(typeof event.id).toBe('string');
      expect(typeof event.category_id).toBe('string');
      expect(typeof event.title).toBe('string');
      expect(typeof event.definition).toBe('string');
      expect(Array.isArray(event.steps)).toBe(true);
      expect(typeof event.order).toBe('number');
    }
  });

  it('normalizes steps to have type field', () => {
    const events = getEvents();
    for (const event of events) {
      for (const step of event.steps) {
        expect(step.type).toBeDefined();
        expect(['instruction', 'question', 'terminal']).toContain(step.type);
      }
    }
  });
});

describe('getForms', () => {
  it('returns an array of form templates', () => {
    const forms = getForms();
    expect(Array.isArray(forms)).toBe(true);
    expect(forms.length).toBeGreaterThan(0);
  });

  it('each form has required fields', () => {
    const forms = getForms();
    for (const form of forms) {
      expect(typeof form.id).toBe('string');
      expect(typeof form.title).toBe('string');
      expect(typeof form.category).toBe('string');
      expect(Array.isArray(form.fields)).toBe(true);
      expect(typeof form.order).toBe('number');
    }
  });

  it('form fields have required properties', () => {
    const forms = getForms();
    for (const form of forms) {
      for (const field of form.fields) {
        expect(typeof field.id).toBe('string');
        expect(typeof field.label).toBe('string');
        expect(typeof field.type).toBe('string');
        expect(typeof field.required).toBe('boolean');
      }
    }
  });
});

describe('convenience lookups', () => {
  it('getEventById returns existing event', () => {
    const events = getEvents();
    const first = events[0];
    const found = getEventById(first.id);
    expect(found).toEqual(first);
  });

  it('getEventById returns undefined for non-existent ID', () => {
    expect(getEventById('nonexistent_event_xyz')).toBeUndefined();
  });

  it('getCategoryById returns existing category', () => {
    const categories = getCategories();
    const first = categories[0];
    const found = getCategoryById(first.id);
    expect(found).toEqual(first);
  });

  it('getCategoryById returns undefined for non-existent ID', () => {
    expect(getCategoryById('nonexistent_cat_xyz')).toBeUndefined();
  });

  it('getFormById returns existing form', () => {
    const forms = getForms();
    const first = forms[0];
    const found = getFormById(first.id);
    expect(found).toEqual(first);
  });

  it('getFormById returns undefined for non-existent ID', () => {
    expect(getFormById('nonexistent_form_xyz')).toBeUndefined();
  });

  it('getEventsByCategory returns filtered and sorted events', () => {
    const categories = getCategories();
    const catId = categories[0].id;
    const events = getEventsByCategory(catId);
    expect(events.length).toBeGreaterThan(0);
    events.forEach((e) => expect(e.category_id).toBe(catId));
    // Verify sorted by order
    for (let i = 1; i < events.length; i++) {
      expect(events[i].order).toBeGreaterThanOrEqual(events[i - 1].order);
    }
  });

  it('getEventsByCategory returns empty for non-existent category', () => {
    expect(getEventsByCategory('nonexistent_cat_xyz')).toEqual([]);
  });
});
