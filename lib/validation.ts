import { z } from 'zod';

export const tcKimlikSchema = z
    .string()
    .regex(/^\d{11}$/, 'T.C. Kimlik No 11 haneli olmalıdır');

export const sicilNoSchema = z
    .string()
    .regex(/^\d+$/, 'Sicil No yalnızca rakam içermelidir');

export const dateSchema = z
    .string()
    .regex(/^\d{2}\.\d{2}\.\d{4}$/, 'Tarih DD.MM.YYYY formatında olmalıdır');

export const timeSchema = z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Saat HH:MM formatında olmalıdır (00:00–23:59)');

export const requiredText = z
    .string()
    .min(1, 'Bu alan zorunludur');

export function validateField(
    fieldId: string,
    value: string,
    required: boolean
): string | null {
    if (required && (!value || value.trim() === '')) {
        return 'Bu alan zorunludur';
    }
    if (!value || value.trim() === '') return null;

    // TC Kimlik validation
    if (fieldId.includes('tc') || fieldId.includes('kimlik')) {
        const result = tcKimlikSchema.safeParse(value);
        if (!result.success) return result.error.errors[0].message;
    }

    // Sicil No validation
    if (fieldId === 'duzenleyen_sicil') {
        const result = sicilNoSchema.safeParse(value);
        if (!result.success) return result.error.errors[0].message;
    }

    return null;
}

export function validateForm(
    fields: Array<{ id: string; required: boolean }>,
    values: Record<string, string>
): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const field of fields) {
        const error = validateField(field.id, values[field.id] || '', field.required);
        if (error) {
            errors[field.id] = error;
        }
    }
    return errors;
}
