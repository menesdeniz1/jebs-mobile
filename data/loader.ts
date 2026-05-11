/**
 * Typed data loader with runtime validation via zod.
 * Replaces all `as any[]` JSON imports throughout the codebase.
 *
 * During the migration period, legacy step shapes (without `type` field)
 * are normalized to `InstructionStep` on load.
 */
import type { Category, Event, FormTemplate, Step, LegacyStep } from './types';
import { CategorySchema, EventSchema, FormTemplateSchema } from './schemas';

import rawCategories from './categories.json';
import rawEvents from './events.json';
import rawForms from './forms.json';

// ── Helpers ──────────────────────────────────────────

/** Normalize a legacy step (no `type` field) into an InstructionStep */
function normalizeLegacyStep(step: LegacyStep): Step {
  return {
    type: 'instruction' as const,
    order: step.order,
    text: step.text,
    is_critical: step.is_critical,
  };
}

/** Normalize steps: if a step has no `type` field, treat it as legacy instruction */
function normalizeSteps(steps: unknown[]): Step[] {
  return steps.map((step) => {
    const s = step as Record<string, unknown>;
    if (!s.type) {
      return normalizeLegacyStep(s as unknown as LegacyStep);
    }
    return step as unknown as Step;
  });
}

// ── Loaders ──────────────────────────────────────────

let _categories: Category[] | null = null;
let _events: Event[] | null = null;
let _forms: FormTemplate[] | null = null;

export function getCategories(): Category[] {
  if (_categories) return _categories;

  const parsed = rawCategories.map((c) => {
    const result = CategorySchema.safeParse(c);
    if (!result.success) {
      throw new Error(
        `[data/loader] Category validation failed for "${(c as { id?: string }).id}": ${result.error.message}`
      );
    }
    return result.data as Category;
  });

  _categories = parsed;
  return parsed;
}

export function getEvents(): Event[] {
  if (_events) return _events;

  const parsed = rawEvents.map((e) => {
    // Normalize steps before validation
    const eventWithNormalizedSteps = {
      ...e,
      steps: normalizeSteps(e.steps as unknown[]),
    };

    const result = EventSchema.safeParse(eventWithNormalizedSteps);
    if (!result.success) {
      throw new Error(
        `[data/loader] Event validation failed for "${(e as { id?: string }).id}": ${result.error.message}`
      );
    }
    return result.data as Event;
  });

  _events = parsed;
  return parsed;
}

export function getForms(): FormTemplate[] {
  if (_forms) return _forms;

  const parsed = rawForms.map((f) => {
    const result = FormTemplateSchema.safeParse(f);
    if (!result.success) {
      throw new Error(
        `[data/loader] Form validation failed for "${(f as { id?: string }).id}": ${result.error.message}`
      );
    }
    return result.data as FormTemplate;
  });

  _forms = parsed;
  return parsed;
}

// ── Convenience lookups ──────────────────────────────

export function getEventById(id: string): Event | undefined {
  return getEvents().find((e) => e.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return getCategories().find((c) => c.id === id);
}

export function getFormById(id: string): FormTemplate | undefined {
  return getForms().find((f) => f.id === id);
}

export function getEventsByCategory(categoryId: string): Event[] {
  return getEvents()
    .filter((e) => e.category_id === categoryId)
    .sort((a, b) => a.order - b.order);
}
