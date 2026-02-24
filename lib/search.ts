import categories from '../data/categories.json';
import events from '../data/events.json';
import forms from '../data/forms.json';

const turkishCharMap: Record<string, string> = {
    'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ü': 'u', 'Ü': 'u',
    'ş': 's', 'Ş': 's',
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
};

function normalizeTurkish(text: string): string {
    return text
        .toLowerCase()
        .replace(/[ıİöÖüÜşŞçÇğĞ]/g, (char) => turkishCharMap[char] || char);
}

export interface SearchResult {
    id: string;
    title: string;
    type: 'event' | 'form' | 'category';
    categoryId?: string;
    description: string;
    matchField: string;
}

export function searchAll(query: string): SearchResult[] {
    if (!query || query.trim().length < 2) return [];

    const normalizedQuery = normalizeTurkish(query.trim());
    const results: SearchResult[] = [];

    // Search categories
    for (const cat of categories) {
        if (
            normalizeTurkish(cat.title).includes(normalizedQuery) ||
            normalizeTurkish(cat.description).includes(normalizedQuery)
        ) {
            results.push({
                id: cat.id,
                title: cat.title,
                type: 'category',
                description: cat.description,
                matchField: 'Kategori',
            });
        }
    }

    // Search events
    for (const event of events) {
        const searchFields = [
            { field: 'Başlık', value: event.title },
            { field: 'Tanım', value: event.definition },
            { field: 'Nasıl Olur', value: event.how_it_occurs },
            { field: 'Savcı İletişimi', value: event.prosecutor_info },
            { field: 'Taraf Hakları', value: event.party_roles },
            { field: 'Kanun Maddeleri', value: event.legal_references },
        ];

        for (const { field, value } of searchFields) {
            if (normalizeTurkish(value).includes(normalizedQuery)) {
                // Avoid duplicates
                if (!results.find((r) => r.id === event.id && r.type === 'event')) {
                    results.push({
                        id: event.id,
                        title: event.title,
                        type: 'event',
                        categoryId: event.category_id,
                        description: event.definition.substring(0, 120) + '...',
                        matchField: field,
                    });
                }
                break;
            }
        }

        // Search steps
        for (const step of event.steps) {
            if (normalizeTurkish(step.text).includes(normalizedQuery)) {
                if (!results.find((r) => r.id === event.id && r.type === 'event')) {
                    results.push({
                        id: event.id,
                        title: event.title,
                        type: 'event',
                        categoryId: event.category_id,
                        description: `Adım ${step.order}: ${step.text}`,
                        matchField: 'İşlem Adımı',
                    });
                }
                break;
            }
        }
    }

    // Search forms
    for (const form of forms) {
        if (normalizeTurkish(form.title).includes(normalizedQuery)) {
            results.push({
                id: form.id,
                title: form.title,
                type: 'form',
                description: `${form.fields.length} alan içeren form şablonu`,
                matchField: 'Form Başlığı',
            });
        }
    }

    return results;
}

export function getAutocompleteSuggestions(query: string): string[] {
    if (!query || query.trim().length < 1) return [];

    const normalizedQuery = normalizeTurkish(query.trim());
    const suggestions: Set<string> = new Set();

    for (const event of events) {
        if (normalizeTurkish(event.title).includes(normalizedQuery)) {
            suggestions.add(event.title);
        }
    }

    for (const form of forms) {
        if (normalizeTurkish(form.title).includes(normalizedQuery)) {
            suggestions.add(form.title);
        }
    }

    for (const cat of categories) {
        if (normalizeTurkish(cat.title).includes(normalizedQuery)) {
            suggestions.add(cat.title);
        }
    }

    return Array.from(suggestions).slice(0, 8);
}
