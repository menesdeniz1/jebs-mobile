import { useState, useCallback, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    TextInput, Platform, Keyboard,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../constants/theme';
import { searchAll, getAutocompleteSuggestions, SearchResult } from '../lib/search';
import { useAppStore } from '../lib/store';

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const searchHistory = useAppStore((s) => s.searchHistory);
    const addSearchHistory = useAppStore((s) => s.addSearchHistory);
    const clearSearchHistory = useAppStore((s) => s.clearSearchHistory);

    useEffect(() => {
        if (query.length >= 2) {
            const searchResults = searchAll(query);
            setResults(searchResults);
            setSuggestions([]);
        } else if (query.length >= 1) {
            const autoSuggestions = getAutocompleteSuggestions(query);
            setSuggestions(autoSuggestions);
            setResults([]);
        } else {
            setResults([]);
            setSuggestions([]);
        }
    }, [query]);

    const handleSearch = useCallback(
        (text: string) => {
            setQuery(text);
            if (text.length >= 2) {
                addSearchHistory(text);
            }
        },
        [addSearchHistory]
    );

    const handleResultPress = useCallback(
        (result: SearchResult) => {
            addSearchHistory(query);
            Keyboard.dismiss();
            if (result.type === 'event') {
                router.push(`/guide/event/${result.id}`);
            } else if (result.type === 'form') {
                router.push(`/form/${result.id}`);
            } else if (result.type === 'category') {
                router.push(`/guide/${result.id}`);
            }
        },
        [router, query, addSearchHistory]
    );

    const handleSuggestionPress = useCallback((suggestion: string) => {
        setQuery(suggestion);
        handleSearch(suggestion);
    }, [handleSearch]);

    const resultTypeLabels: Record<string, string> = {
        event: 'Olay Rehberi',
        form: 'Form',
        category: 'Kategori',
    };

    const resultTypeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
        event: 'book',
        form: 'document-text',
        category: 'folder',
    };

    const resultTypeColors: Record<string, string> = {
        event: Colors.primary,
        form: Colors.info,
        category: '#E65100',
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                {/* Search Header */}
                <View style={styles.searchHeader}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.textLight} />
                    </TouchableOpacity>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={18} color={Colors.textSecondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Olay, form veya kanun maddesi ara..."
                            placeholderTextColor={Colors.textSecondary}
                            value={query}
                            onChangeText={setQuery}
                            autoFocus
                            returnKeyType="search"
                            onSubmitEditing={() => handleSearch(query)}
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery('')}>
                                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <View style={styles.section}>
                            {suggestions.map((suggestion, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.suggestionItem}
                                    onPress={() => handleSuggestionPress(suggestion)}
                                >
                                    <Ionicons name="search" size={16} color={Colors.textSecondary} />
                                    <Text style={styles.suggestionText}>{suggestion}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Recent Searches */}
                    {query.length === 0 && searchHistory.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Son Aramalar</Text>
                                <TouchableOpacity onPress={clearSearchHistory}>
                                    <Text style={styles.clearText}>Temizle</Text>
                                </TouchableOpacity>
                            </View>
                            {searchHistory.map((item, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.historyItem}
                                    onPress={() => {
                                        setQuery(item);
                                        handleSearch(item);
                                    }}
                                >
                                    <Ionicons name="time" size={18} color={Colors.textSecondary} />
                                    <Text style={styles.historyText}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Search Results */}
                    {results.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.resultCount}>
                                {results.length} sonuç bulundu
                            </Text>
                            {results.map((result, idx) => (
                                <TouchableOpacity
                                    key={`${result.type}-${result.id}-${idx}`}
                                    style={styles.resultCard}
                                    onPress={() => handleResultPress(result)}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        style={[
                                            styles.resultIcon,
                                            { backgroundColor: (resultTypeColors[result.type] || Colors.primary) + '12' },
                                        ]}
                                    >
                                        <Ionicons
                                            name={resultTypeIcons[result.type] || 'document'}
                                            size={22}
                                            color={resultTypeColors[result.type] || Colors.primary}
                                        />
                                    </View>
                                    <View style={styles.resultInfo}>
                                        <View style={styles.resultTypeRow}>
                                            <Text
                                                style={[
                                                    styles.resultType,
                                                    { color: resultTypeColors[result.type] },
                                                ]}
                                            >
                                                {resultTypeLabels[result.type]}
                                            </Text>
                                            <Text style={styles.matchField}>• {result.matchField}</Text>
                                        </View>
                                        <Text style={styles.resultTitle}>{result.title}</Text>
                                        <Text style={styles.resultDesc} numberOfLines={2}>
                                            {result.description}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* No Results */}
                    {query.length >= 2 && results.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="search" size={48} color={Colors.border} />
                            <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
                            <Text style={styles.emptySubtitle}>
                                Farklı anahtar kelimelerle tekrar deneyin
                            </Text>
                        </View>
                    )}

                    {/* Quick Hints */}
                    {query.length === 0 && searchHistory.length === 0 && (
                        <View style={styles.hintsSection}>
                            <Text style={styles.hintsTitle}>💡 Arama İpuçları</Text>
                            {[
                                'Olay türü: "darp", "hırsızlık", "uyuşturucu"',
                                'Form adı: "üst arama", "ifade tutanağı"',
                                'Kanun maddesi: "TCK 86", "CMK 90"',
                                'Anahtar kelime: "savcı", "yakalama", "arama"',
                            ].map((hint, idx) => (
                                <View key={idx} style={styles.hintItem}>
                                    <Ionicons name="bulb-outline" size={16} color={Colors.warning} />
                                    <Text style={styles.hintText}>{hint}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={{ height: 30 }} />
                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingTop: Platform.OS === 'ios' ? 54 : 40,
        paddingBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
    },
    backButton: {
        padding: Spacing.sm,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.md,
        height: 44,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: FontSize.md,
        color: Colors.text,
        height: '100%',
    },
    content: {
        flex: 1,
    },
    section: {
        padding: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text,
    },
    clearText: {
        fontSize: FontSize.sm,
        color: Colors.accent,
        fontWeight: FontWeight.medium,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        gap: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    historyText: {
        fontSize: FontSize.md,
        color: Colors.text,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        gap: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    suggestionText: {
        fontSize: FontSize.md,
        color: Colors.text,
    },
    resultCount: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
        fontWeight: FontWeight.medium,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
            },
            android: { elevation: 1 },
            web: { boxShadow: '0 1px 4px rgba(0,0,0,0.04)' as any },
        }),
    },
    resultIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    resultInfo: {
        flex: 1,
    },
    resultTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: 2,
    },
    resultType: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        textTransform: 'uppercase',
    },
    matchField: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    resultTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.text,
        marginBottom: 2,
    },
    resultDesc: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        lineHeight: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text,
        marginTop: Spacing.lg,
    },
    emptySubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    hintsSection: {
        padding: Spacing.lg,
    },
    hintsTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    hintItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    hintText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
});
