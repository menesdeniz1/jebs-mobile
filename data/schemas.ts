/**
 * Zod schemas for runtime validation of JSON data.
 * Matches the TypeScript interfaces in data/types.ts.
 */
import { z } from 'zod';

// ── Categories ────────────────────────────────────────

export const CategorySchema = z.object({
  id: z.string(),
  title: z.string(),
  icon: z.string(),
  description: z.string(),
  color: z.string(),
  order: z.number(),
});

// ── Steps (polymorphic) ──────────────────────────────

export const BranchSchema = z.object({
  label: z.string(),
  next_order: z.number(),
});

export const InstructionStepSchema = z.object({
  type: z.literal('instruction'),
  order: z.number(),
  text: z.string(),
  is_critical: z.boolean().optional(),
});

export const QuestionStepSchema = z.object({
  type: z.literal('question'),
  order: z.number(),
  text: z.string(),
  branches: z.array(BranchSchema),
});

export const TerminalStepSchema = z.object({
  type: z.literal('terminal'),
  order: z.number(),
  text: z.string(),
  outcome: z.enum(['close_file', 'continue_investigation', 'refer_to_prosecutor']),
});

export const StepSchema = z.discriminatedUnion('type', [
  InstructionStepSchema,
  QuestionStepSchema,
  TerminalStepSchema,
]);

/**
 * Legacy step shape from existing JSON — no `type` field.
 * The loader normalizes these into InstructionStep.
 */
export const LegacyStepSchema = z.object({
  order: z.number(),
  text: z.string(),
  is_critical: z.boolean(),
});

/** Accept either legacy or new polymorphic steps */
export const FlexibleStepSchema = z.union([StepSchema, LegacyStepSchema]);

// ── Legal References ─────────────────────────────────

export const LegalReferenceSchema = z.object({
  code: z.string(),
  article: z.string(),
  title: z.string(),
  summary: z.string(),
  penalty: z.string().optional(),
});

// ── Prosecutor Info ──────────────────────────────────

export const ProsecutorInfoSchema = z.object({
  when: z.string(),
  how: z.string().default(''),
  what_to_report: z.array(z.string()).default([]),
  expected_orders: z.array(z.string()).default([]),
});

// ── Party Roles ──────────────────────────────────────

export const PartyRolesSchema = z.object({
  suspect: z.array(z.string()),
  victim: z.array(z.string()),
  witness: z.array(z.string()),
});

// ── Events ───────────────────────────────────────────

export const EventSchema = z.object({
  id: z.string(),
  category_id: z.string(),
  title: z.string(),
  definition: z.string(),
  how_it_occurs: z.string(),
  steps: z.array(FlexibleStepSchema),
  // Post-migration: structured objects only (P1-7 complete)
  prosecutor_info: ProsecutorInfoSchema.optional(),
  party_roles: PartyRolesSchema.optional(),
  witness_procedure: z.array(z.string()).optional(),
  legal_references: z.array(LegalReferenceSchema).optional(),
  related_forms: z.array(z.string()).optional(),
  order: z.number(),
});

// ── Forms ────────────────────────────────────────────

export const FormFieldGroupSchema = z.enum([
  'location', 'officer', 'subject', 'vehicle', 'vehicle1', 'vehicle2',
  'details', 'witnesses', 'statement', 'damage',
]);

export const FormFieldTypeSchema = z.enum([
  'text', 'textarea', 'date', 'time', 'dropdown', 'checkbox', 'number',
]);

export const FormFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: FormFieldTypeSchema,
  options: z.array(z.string()),
  required: z.boolean(),
  placeholder: z.string(),
  group: FormFieldGroupSchema,
});

export const FormTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  fields: z.array(FormFieldSchema),
  order: z.number(),
});
