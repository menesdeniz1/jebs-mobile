import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Star, FileText } from 'lucide-react-native';
import StepChecklist from '../../../components/guide/StepChecklist';
import LawArticle from '../../../components/guide/LawArticle';
import FormSheet from '../../../components/guide/FormSheet';
import ListCard from '../../../components/ui/ListCard';
import { showSuccess, showInfo } from '../../../components/ui/Toast';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius } from '../../../constants/theme';
import { useFavoritesStore } from '../../../store/favoritesStore';
import events from '../../../data/events.json';
import forms from '../../../data/forms.json';

const TABS = ['Tanım', 'Yapılacaklar', 'Evraklar', 'Kanun'] as const;
type TabType = (typeof TABS)[number];

export default function EventDetailScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { eventId } = useLocalSearchParams<{ eventId: string }>();

    const event = (events as any[]).find((e: any) => e.id === eventId);
    const isFavorite = useFavoritesStore((s) => s.isFavorite(eventId));
    const toggleFavorite = useFavoritesStore((s) => s.toggle);

    const [activeTab, setActiveTab] = useState<TabType>('Tanım');
    const [checkedState, setCheckedState] = useState<boolean[]>(
        new Array(event?.steps?.length || 0).fill(false)
    );
    const [selectedForm, setSelectedForm] = useState<any>(null);

    if (!event) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textPrimary }}>Olay bulunamadı</Text>
            </View>
        );
    }

    const handleToggleFavorite = () => {
        toggleFavorite('event_type', eventId, event.title);
        if (isFavorite) {
            showInfo('Favorilerden çıkarıldı');
        } else {
            showSuccess('Favorilere eklendi');
        }
    };

    const handleCheckToggle = (index: number) => {
        const next = [...checkedState];
        next[index] = !next[index];
        setCheckedState(next);
    };

    const handleCheckReset = () => {
        setCheckedState(new Array(event.steps.length).fill(false));
    };

    // Parse legal references from string format
    const parseLegalRefs = () => {
        if (!event.legal_references) return [];
        const text = typeof event.legal_references === 'string' ? event.legal_references : '';
        const lines = text.split('\n').filter((l: string) => l.trim());
        const refs: Array<{ article: string; title: string; summary: string }> = [];
        let current: any = null;

        for (const line of lines) {
            const clean = line.replace(/\*\*/g, '').trim();
            if (clean.match(/^(TCK|CMK|PVSK|\d{4})/)) {
                if (current) refs.push(current);
                const parts = clean.split('—').map((s: string) => s.trim());
                const articleParts = parts[0].split(':').map((s: string) => s.trim());
                current = {
                    article: articleParts[0],
                    title: parts[1] || articleParts[1] || '',
                    summary: articleParts[1] || parts[1] || '',
                };
            } else if (current && clean) {
                current.summary += '\n' + clean;
            }
        }
        if (current) refs.push(current);
        return refs;
    };

    const relatedForms = event.related_forms
        ? event.related_forms
            .map((fId: string) => (forms as any[]).find((f: any) => f.id === fId))
            .filter(Boolean)
        : [];

    const renderContent = () => {
        switch (activeTab) {
            case 'Tanım':
                return (
                    <ScrollView contentContainerStyle={styles.tabContent}>
                        <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: FontFamily.bold }]}>
                            Tanım
                        </Text>
                        <Text style={[styles.bodyText, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                            {event.definition}
                        </Text>

                        <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: FontFamily.bold }]}>
                            Nasıl Meydana Gelir
                        </Text>
                        <Text style={[styles.bodyText, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                            {event.how_it_occurs}
                        </Text>

                        {event.prosecutor_info && (
                            <>
                                <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: FontFamily.bold }]}>
                                    Savcı Görüşmesi
                                </Text>
                                <Text style={[styles.bodyText, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                                    {event.prosecutor_info.replace(/\*\*/g, '')}
                                </Text>
                            </>
                        )}

                        {event.party_roles && (
                            <>
                                <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: FontFamily.bold }]}>
                                    Tarafların Rolleri
                                </Text>
                                <Text style={[styles.bodyText, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                                    {event.party_roles.replace(/\*\*/g, '')}
                                </Text>
                            </>
                        )}
                    </ScrollView>
                );

            case 'Yapılacaklar':
                return (
                    <ScrollView contentContainerStyle={styles.tabContent}>
                        <StepChecklist
                            steps={event.steps}
                            checkedState={checkedState}
                            onToggle={handleCheckToggle}
                            onReset={handleCheckReset}
                        />
                    </ScrollView>
                );

            case 'Evraklar':
                return (
                    <ScrollView contentContainerStyle={styles.tabContent}>
                        {relatedForms.length > 0 ? (
                            relatedForms.map((form: any) => (
                                <ListCard
                                    key={form.id}
                                    icon={<FileText size={20} color={colors.primary} />}
                                    title={form.title}
                                    borderColor={colors.primary}
                                    onPress={() => setSelectedForm(form)}
                                />
                            ))
                        ) : (
                            <Text style={[styles.bodyText, { color: colors.textSecondary, fontFamily: FontFamily.regular }]}>
                                Bu olay türü için ilgili tutanak bulunmamaktadır.
                            </Text>
                        )}
                        {selectedForm && (
                            <FormSheet
                                visible={true}
                                formTitle={selectedForm.title}
                                formDescription={`Bu tutanağı doldurmak için aşağıdaki butona tıklayın.`}
                                onFill={() => {
                                    setSelectedForm(null);
                                    router.push(`/form/${selectedForm.id}`);
                                }}
                                onClose={() => setSelectedForm(null)}
                            />
                        )}
                    </ScrollView>
                );

            case 'Kanun':
                const refs = parseLegalRefs();
                return (
                    <ScrollView contentContainerStyle={styles.tabContent}>
                        {refs.length > 0 ? (
                            refs.map((ref, i) => (
                                <LawArticle
                                    key={i}
                                    article={ref.article}
                                    title={ref.title}
                                    summary={ref.summary}
                                />
                            ))
                        ) : (
                            <Text style={[styles.bodyText, { color: colors.textSecondary, fontFamily: FontFamily.regular }]}>
                                Bu olay türü için kanun maddesi bilgisi bulunmamaktadır.
                            </Text>
                        )}
                    </ScrollView>
                );
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: event.title,
                    headerRight: () => (
                        <TouchableOpacity onPress={handleToggleFavorite} style={{ padding: 8 }}>
                            <Star
                                size={22}
                                color={isFavorite ? '#FFD700' : '#FFFFFF'}
                                fill={isFavorite ? '#FFD700' : 'transparent'}
                            />
                        </TouchableOpacity>
                    ),
                }}
            />
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Tab bar */}
                <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                    {TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 3 },
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    {
                                        color: activeTab === tab ? colors.primary : colors.textSecondary,
                                        fontFamily: activeTab === tab ? FontFamily.bold : FontFamily.regular,
                                    },
                                ]}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tab content */}
                <View style={styles.contentContainer}>{renderContent()}</View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.md,
        alignItems: 'center',
    },
    tabText: {
        fontSize: FontSize.body,
    },
    contentContainer: {
        flex: 1,
    },
    tabContent: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: FontSize.subheading,
        marginTop: Spacing.xl,
        marginBottom: Spacing.sm,
    },
    bodyText: {
        fontSize: FontSize.body,
        lineHeight: 22,
    },
});
