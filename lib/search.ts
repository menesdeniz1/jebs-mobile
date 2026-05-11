/**
 * Search module with Turkish character normalization.
 * Uses in-memory search. The interface is designed so that
 * SQLite FTS5 can be swapped in later without changing callers.
 */

import { getCategories, getEvents, getForms } from '../data/loader';
import type { Event, Category, FormTemplate, Step } from '../data/types';

// ── Types ──────────────────────────────────────────────

export type SearchResultType = 'event' | 'form' | 'law_article';

export interface SearchResult {
    id: string;
    type: SearchResultType;
    title: string;
    subtitle?: string;
    /** navigation target */
    route: string;
    routeParams: Record<string, string>;
}

export interface GroupedResults {
    events: SearchResult[];
    forms: SearchResult[];
    lawArticles: SearchResult[];
}

// ── Turkish Normalization ──────────────────────────────

export function normalizeTurkish(text: string): string {
    return text
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/İ/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/Ö/g, 'o')
        .replace(/ü/g, 'u')
        .replace(/Ü/g, 'u')
        .replace(/ç/g, 'c')
        .replace(/Ç/g, 'c')
        .replace(/ş/g, 's')
        .replace(/Ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/Ğ/g, 'g');
}

function matches(haystack: string, needle: string): boolean {
    return normalizeTurkish(haystack).includes(normalizeTurkish(needle));
}

/** Extract step text from polymorphic step */
function getStepText(step: Step): string {
    return step.text;
}

// ── Search Engine (in-memory, swappable) ───────────────

export interface SearchEngine {
    search(query: string): GroupedResults;
}

class InMemorySearchEngine implements SearchEngine {
    search(query: string): GroupedResults {
        if (!query || query.length < 2) {
            return { events: [], forms: [], lawArticles: [] };
        }

        const categories = getCategories();
        const events = getEvents();
        const forms = getForms();

        const eventResults: SearchResult[] = [];
        const formResults: SearchResult[] = [];
        const lawResults: SearchResult[] = [];

        // Search events
        for (const event of events) {
            const searchable = [
                event.title,
                event.definition,
                event.how_it_occurs,
                ...(event.steps?.map(getStepText) || []),
            ].join(' ');

            if (matches(searchable, query)) {
                const category = categories.find((c: Category) => c.id === event.category_id);
                eventResults.push({
                    id: event.id,
                    type: 'event',
                    title: event.title,
                    subtitle: category?.title,
                    route: '/guide/event/[eventId]',
                    routeParams: { eventId: event.id },
                });
            }

            // Search law articles within events
            if (event.legal_references) {
                const refs = typeof event.legal_references === 'string'
                    ? event.legal_references
                    : Array.isArray(event.legal_references)
                        ? event.legal_references.map((r) => `${r.article} ${r.title} ${r.summary}`).join(' ')
                        : '';
                if (matches(refs, query)) {
                    // Extract individual article matches
                    const lines = refs.split('\n').filter((l: string) => l.trim());
                    for (const line of lines) {
                        if (matches(line, query) && line.includes('Madde')) {
                            const existing = lawResults.find((r) => r.title === line.trim().replace(/\*\*/g, ''));
                            if (!existing) {
                                lawResults.push({
                                    id: `${event.id}_law_${lawResults.length}`,
                                    type: 'law_article',
                                    title: line.trim().replace(/\*\*/g, '').split('—')[0].trim(),
                                    subtitle: line.trim().replace(/\*\*/g, '').split('—')[1]?.trim(),
                                    route: '/guide/event/[eventId]',
                                    routeParams: { eventId: event.id },
                                });
                            }
                        }
                    }
                }
            }
        }

        // Search forms
        for (const form of forms) {
            if (matches(form.title, query)) {
                formResults.push({
                    id: form.id,
                    type: 'form',
                    title: form.title,
                    route: '/form/[templateId]',
                    routeParams: { templateId: form.id },
                });
            }
        }

        return {
            events: eventResults,
            forms: formResults,
            lawArticles: lawResults,
        };
    }
}

// Singleton — swap this implementation for FTS5 later
let engine: SearchEngine = new InMemorySearchEngine();

export function getSearchEngine(): SearchEngine {
    return engine;
}

export function setSearchEngine(newEngine: SearchEngine): void {
    engine = newEngine;
}

/** Convenience function */
export function search(query: string): GroupedResults {
    return engine.search(query);
}
