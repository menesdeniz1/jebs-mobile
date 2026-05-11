/**
 * Core data types for Jandarma Saha Rehberi.
 * These map 1:1 to the JSON data files in data/*.json.
 */

// ── Categories ────────────────────────────────────────

export interface Category {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  order: number;
}

// ── Events ────────────────────────────────────────────

/** Polymorphic step type: instruction (checkbox), question (branch), terminal (end) */
export type Step =
  | InstructionStep
  | QuestionStep
  | TerminalStep;

export interface InstructionStep {
  type: 'instruction';
  order: number;
  text: string;
  is_critical?: boolean;
}

export interface QuestionStep {
  type: 'question';
  order: number;
  text: string;
  branches: Branch[];
}

export interface Branch {
  label: string;
  next_order: number;
}

export interface TerminalStep {
  type: 'terminal';
  order: number;
  text: string;
  outcome: 'close_file' | 'continue_investigation' | 'refer_to_prosecutor';
}

/** Legacy step shape — linear only, no `type` field */
export interface LegacyStep {
  order: number;
  text: string;
  is_critical: boolean;
}

export interface LegalReference {
  code: 'TCK' | 'CMK' | 'PVSK' | 'KK' | 'Anayasa' | string;
  article: string;
  title: string;
  summary: string;
  penalty?: string;
}

export interface ProsecutorInfo {
  when: string;
  how: string;
  what_to_report: string[];
  expected_orders: string[];
}

export interface PartyRoles {
  suspect: string[];
  victim: string[];
  witness: string[];
}

export interface Event {
  id: string;
  category_id: string;
  title: string;
  definition: string;
  how_it_occurs: string;
  steps: Step[];
  /** Legacy string format kept for backward compat during migration */
  prosecutor_info?: string | ProsecutorInfo;
  party_roles?: string | PartyRoles;
  witness_procedure?: string | string[];
  legal_references?: string | LegalReference[];
  related_forms?: string[];
  order: number;
}

// ── Forms ─────────────────────────────────────────────

export type FormFieldType = 'text' | 'textarea' | 'date' | 'time' | 'dropdown' | 'checkbox';

export type FormFieldGroup =
  | 'location'
  | 'officer'
  | 'subject'
  | 'vehicle'
  | 'vehicle1'
  | 'vehicle2'
  | 'details'
  | 'witnesses'
  | 'statement'
  | 'damage';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  options: string[];
  required: boolean;
  placeholder: string;
  group: FormFieldGroup;
}

export interface FormTemplate {
  id: string;
  title: string;
  category: string;
  fields: FormField[];
  order: number;
}

// ── Versioned wrapper (P2-13, applied later) ──────────

export interface VersionedData<T> {
  schema_version: number;
  content_version: string;
  items: T[];
}
