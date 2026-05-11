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
import { getEventById, getFormById } from '../../../data/loader';
import type { FormTemplate, Step, InstructionStep } from '../../../data/types';

const TABS = ['Tanım', 'Yapılacaklar', 'Evraklar', 'Kanun'] as const;
type TabType = (typeof TABS)[number];

export default function EventDetailScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { eventId } = useLocalSearchParams<{ eventId: string }>();

    const event = getEventById(eventId);
    const isFavorite = useFavoritesStore((s) => s.isFavorite(eventId));
    const toggleFavorite = useFavoritesStore((s) => s.toggle);

    const [activeTab, setActiveTab] = useState<TabType>('Tanım');
    const [checkedState, setCheckedState] = useState<boolean[]>(
        new Array(event?.steps?.length || 0).fill(false)
    );
    const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);

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

    const relatedForms = event.related_forms
        ? event.related_forms
            .map((fId: string) => getFormById(fId))
            .filter((f): f is FormTemplate => f !== undefined)
        : [];

    /** Get instruction steps for the checklist */
    const instructionSteps = event.steps
        .filter((s: Step): s is InstructionStep => s.type === 'instruction')
        .map((s) => ({
            order: s.order,
            text: s.text,
            is_critical: s.is_critical ?? false,
        }));

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

                        {/* Prosecutor Info — structured */}
                        {event.prosecutor_info && (
                            <>
                                <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: FontFamily.bold }]}>
                                    Savcı Görüşmesi
                                </Text>
                                <Text style={[styles.label, { color: colors.textSecondary, fontFamily: FontFamily.semibold }]}>
                                    Ne zaman aranır:
                                </Text>
                                <Text style={[styles.bodyText, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                                    {event.prosecutor_info.when}
                                </Text>
                                {event.prosecutor_info.how ? (
                                    <>
                                        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: FontFamily.semibold }]}>
                                            Nasıl aranır:
                                        </Text>
                                        <Text style={[styles.bodyText, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                                            {event.prosecutor_info.how}
                                        </Text>
                                    </>
                                ) : null}
                                {event.prosecutor_info.what_to_report.length > 0 && (
                                    <>
                                        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: FontFamily.semibold }]}>
                                            Ne söylenir:
                                        </Text>
                                        {event.prosecutor_info.what_to_report.map((item, i) => (
                                            <Text key={i} style={[styles.bulletItem, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                                                • {item}
                                            </Text>
                                        ))}
                                    </>
                                )}
                                {event.prosecutor_info.expected_orders.length > 0 && (
                                    <>
                                        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: FontFamily.semibold }]}>
                                            Önemli:
                                        </Text>
                                        {event.prosecutor_info.expected_orders.map((item, i) => (
                                            <Text key={i} style={[styles.bodyText, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                                                {item}
                                            </Text>
                                        ))}
                                    </>
                                )}
                            </>
                        )}

                        {/* Party Roles — structured */}
                        {event.party_roles && (
                            <>
                                <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: FontFamily.bold }]}>
                                    Tarafların Hakları
                                </Text>
                                {event.party_roles.suspect.length > 0 && (
                                    <>
                                        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: FontFamily.semibold }]}>
                                            Şüpheli Hakları:
                                        </Text>
                                        {event.party_roles.suspect.map((item, i) => (
                                            <Text key={i} style={[styles.bulletItem, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                                                • {item}
                                            </Text>
                                        ))}
                                    </>
                                )}
                                {event.party_roles.victim.length > 0 && (
                                    <>
                                        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: FontFamily.semibold }]}>
                                            Mağdur Hakları:
                                        </Text>
                                        {event.party_roles.victim.map((item, i) => (
                                            <Text key={i} style={[styles.bulletItem, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                                                • {item}
                                            </Text>
                                        ))}
                                    </>
                                )}
                                {event.party_roles.witness.length > 0 && (
                                    <>
                                        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: FontFamily.semibold }]}>
                                            Tanık Hakları:
                                        </Text>
                                        {event.party_roles.witness.map((item, i) => (
                                            <Text key={i} style={[styles.bulletItem, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                                                • {item}
                                            </Text>
                                        ))}
                                    </>
                                )}
                            </>
                        )}

                        {/* Witness Procedure — structured */}
                        {event.witness_procedure && event.witness_procedure.length > 0 && (
                            <>
                                <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: FontFamily.bold }]}>
                                    Tanık Dinleme Prosedürü
                                </Text>
                                {event.witness_procedure.map((step, i) => (
                                    <Text key={i} style={[styles.numberedItem, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                                        {i + 1}. {step}
                                    </Text>
                                ))}
                            </>
                        )}
                    </ScrollView>
                );

            case 'Yapılacaklar':
                return (
                    <ScrollView contentContainerStyle={styles.tabContent}>
                        <StepChecklist
                            steps={instructionSteps}
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
                            relatedForms.map((form: FormTemplate) => (
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
                                    const formId = selectedForm.id;
                                    setSelectedForm(null);
                                    router.push(`/form/${formId}`);
                                }}
                                onClose={() => setSelectedForm(null)}
                            />
                        )}
                    </ScrollView>
                );

            case 'Kanun': {
                const refs = event.legal_references ?? [];
                return (
                    <ScrollView contentContainerStyle={styles.tabContent}>
                        {refs.length > 0 ? (
                            refs.map((ref, i) => (
                                <LawArticle
                                    key={i}
                                    article={ref.article}
                                    title={ref.title}
                                    summary={ref.penalty || ref.summary}
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
    label: {
        fontSize: FontSize.small,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    bodyText: {
        fontSize: FontSize.body,
        lineHeight: 22,
    },
    bulletItem: {
        fontSize: FontSize.body,
        lineHeight: 24,
        paddingLeft: Spacing.sm,
    },
    numberedItem: {
        fontSize: FontSize.body,
        lineHeight: 24,
        paddingLeft: Spacing.xs,
        marginBottom: Spacing.xs,
    },
});
