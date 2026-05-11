import React, { useState, useCallback } from 'react';
import { View, TextInput, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, X, Clock, BookOpen, FileText, Scale } from 'lucide-react-native';
import ListCard from '../../components/ui/ListCard';
import SectionHeader from '../../components/ui/SectionHeader';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { useSearchStore } from '../../store/searchStore';
import { search, GroupedResults } from '../../lib/search';

export default function SearchScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GroupedResults>({ events: [], forms: [], lawArticles: [] });
    const history = useSearchStore((s) => s.history);
    const addQuery = useSearchStore((s) => s.addQuery);
    const clearHistory = useSearchStore((s) => s.clear);

    const handleSearch = useCallback(
        (text: string) => {
            setQuery(text);
            if (text.length >= 2) {
                setResults(search(text));
            } else {
                setResults({ events: [], forms: [], lawArticles: [] });
            }
        },
        []
    );

    const handleResultPress = (route: string, params: Record<string, string>) => {
        if (query.length >= 2) {
            addQuery(query);
        }
        router.push({ pathname: route as any, params });
    };

    const hasResults = results.events.length > 0 || results.forms.length > 0 || results.lawArticles.length > 0;
    const showHistory = query.length < 2 && history.length > 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Search bar */}
            <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <SearchIcon size={20} color={colors.textSecondary} />
                <TextInput
                    style={[styles.searchInput, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}
                    placeholder="Olay, form veya kanun maddesi ara..."
                    placeholderTextColor={colors.textSecondary}
                    value={query}
                    onChangeText={handleSearch}
                    autoFocus
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch('')}>
                        <X size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Recent searches */}
                {showHistory && (
                    <View>
                        <SectionHeader
                            title="Son Aramalar"
                            actionLabel="Temizle"
                            onAction={clearHistory}
                        />
                        {history.map((q, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.historyItem, { borderBottomColor: colors.divider }]}
                                onPress={() => handleSearch(q)}
                            >
                                <Clock size={16} color={colors.textSecondary} />
                                <Text style={[styles.historyText, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                                    {q}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Search results */}
                {query.length >= 2 && hasResults && (
                    <>
                        {results.events.length > 0 && (
                            <View>
                                <SectionHeader title="OLAY TÜRLERİ" />
                                {results.events.map((r) => (
                                    <ListCard
                                        key={r.id}
                                        icon={<BookOpen size={18} color="#1565C0" />}
                                        title={r.title}
                                        subtitle={r.subtitle}
                                        borderColor="#1565C0"
                                        onPress={() => handleResultPress(r.route, r.routeParams)}
                                    />
                                ))}
                            </View>
                        )}

                        {results.forms.length > 0 && (
                            <View>
                                <SectionHeader title="TUTANAKLAR" />
                                {results.forms.map((r) => (
                                    <ListCard
                                        key={r.id}
                                        icon={<FileText size={18} color="#1B5E20" />}
                                        title={r.title}
                                        borderColor="#1B5E20"
                                        onPress={() => handleResultPress(r.route, r.routeParams)}
                                    />
                                ))}
                            </View>
                        )}

                        {results.lawArticles.length > 0 && (
                            <View>
                                <SectionHeader title="KANUN MADDELERİ" />
                                {results.lawArticles.map((r) => (
                                    <ListCard
                                        key={r.id}
                                        icon={<Scale size={18} color="#4527A0" />}
                                        title={r.title}
                                        subtitle={r.subtitle}
                                        borderColor="#4527A0"
                                        onPress={() => handleResultPress(r.route, r.routeParams)}
                                    />
                                ))}
                            </View>
                        )}
                    </>
                )}

                {/* No results */}
                {query.length >= 2 && !hasResults && (
                    <View style={styles.emptyContainer}>
                        <SearchIcon size={48} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: FontFamily.regular }]}>
                            Sonuç bulunamadı
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: Spacing.lg,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: FontSize.body,
        padding: 0,
    },
    content: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 30,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        gap: Spacing.sm,
    },
    historyText: {
        fontSize: FontSize.body,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: FontSize.heading,
        marginTop: Spacing.lg,
    },
});
