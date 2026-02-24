import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../../constants/theme';
import events from '../../../data/events.json';
import forms from '../../../data/forms.json';
import { useAppStore } from '../../../lib/store';

type TabId = 'definition' | 'actions' | 'documents';

export default function EventDetailScreen() {
    const { eventId } = useLocalSearchParams<{ eventId: string }>();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabId>('definition');

    const toggleFavorite = useAppStore((s) => s.toggleFavorite);
    const isFavorite = useAppStore((s) => s.isFavorite);
    const toggleChecklistItem = useAppStore((s) => s.toggleChecklistItem);
    const checklistState = useAppStore((s) => s.checklistState);

    const event = events.find((e) => e.id === eventId);

    if (!event) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Olay bulunamadı</Text>
            </View>
        );
    }

    const relatedForms = event.related_forms
        .map((fId) => forms.find((f) => f.id === fId))
        .filter(Boolean);

    const checklist = checklistState[event.id] || [];
    const completedSteps = checklist.filter(Boolean).length;

    const tabs: { id: TabId; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { id: 'definition', label: 'Tanım', icon: 'information-circle' },
        { id: 'actions', label: 'İşlemler', icon: 'checkbox' },
        { id: 'documents', label: 'Belgeler', icon: 'document-text' },
    ];

    return (
        <>
            <Stack.Screen
                options={{
                    title: event.title,
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => toggleFavorite('event_type', event.id)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={{ marginRight: 8 }}
                        >
                            <Ionicons
                                name={isFavorite(event.id) ? 'star' : 'star-outline'}
                                size={24}
                                color={isFavorite(event.id) ? '#FFD700' : Colors.textLight}
                            />
                        </TouchableOpacity>
                    ),
                }}
            />
            <View style={styles.container}>
                {/* Tab Bar */}
                <View style={styles.tabBar}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                            onPress={() => setActiveTab(tab.id)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={18}
                                color={activeTab === tab.id ? Colors.primary : Colors.textSecondary}
                            />
                            <Text
                                style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Definition Tab */}
                    {activeTab === 'definition' && (
                        <View style={styles.tabContent}>
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>📖 Tanım</Text>
                                <Text style={styles.cardText}>{event.definition}</Text>
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>🔍 Nasıl Gerçekleşir?</Text>
                                <Text style={styles.cardText}>{event.how_it_occurs}</Text>
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>📞 Savcı İletişimi</Text>
                                <Text style={styles.cardText}>{event.prosecutor_info}</Text>
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>👥 Taraf Hakları</Text>
                                <Text style={styles.cardText}>{event.party_roles}</Text>
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>👁️ Tanık Prosedürü</Text>
                                <Text style={styles.cardText}>{event.witness_procedure}</Text>
                            </View>

                            <View style={[styles.card, styles.legalCard]}>
                                <Text style={styles.cardTitle}>⚖️ İlgili Kanun Maddeleri</Text>
                                <Text style={styles.cardText}>{event.legal_references}</Text>
                            </View>
                        </View>
                    )}

                    {/* Actions Tab */}
                    {activeTab === 'actions' && (
                        <View style={styles.tabContent}>
                            {/* Progress */}
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${event.steps.length > 0 ? (completedSteps / event.steps.length) * 100 : 0}%`,
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>
                                    {completedSteps}/{event.steps.length} tamamlandı
                                </Text>
                            </View>

                            {event.steps.map((step, index) => {
                                const isChecked = checklist[index] || false;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.stepCard,
                                            step.is_critical && styles.criticalStep,
                                            isChecked && styles.checkedStep,
                                        ]}
                                        onPress={() => toggleChecklistItem(event.id, index, event.steps.length)}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            style={[
                                                styles.checkbox,
                                                isChecked && styles.checkboxChecked,
                                            ]}
                                        >
                                            {isChecked && (
                                                <Ionicons name="checkmark" size={16} color={Colors.textLight} />
                                            )}
                                        </View>
                                        <View style={styles.stepInfo}>
                                            <Text
                                                style={[
                                                    styles.stepOrder,
                                                    step.is_critical && styles.criticalText,
                                                ]}
                                            >
                                                Adım {step.order}
                                                {step.is_critical && ' ⚠️'}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.stepText,
                                                    isChecked && styles.checkedStepText,
                                                ]}
                                            >
                                                {step.text}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <View style={styles.tabContent}>
                            <Text style={styles.docSectionTitle}>İlgili Formlar</Text>
                            {relatedForms.map((form) => (
                                <TouchableOpacity
                                    key={form!.id}
                                    style={styles.formLink}
                                    onPress={() => router.push(`/form/${form!.id}`)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.formLinkIcon}>
                                        <Ionicons name="document-text" size={22} color={Colors.primary} />
                                    </View>
                                    <View style={styles.formLinkInfo}>
                                        <Text style={styles.formLinkTitle}>{form!.title}</Text>
                                        <Text style={styles.formLinkSub}>{form!.fields.length} alan</Text>
                                    </View>
                                    <View style={styles.fillButton}>
                                        <Text style={styles.fillButtonText}>Doldur</Text>
                                        <Ionicons name="arrow-forward" size={14} color={Colors.textLight} />
                                    </View>
                                </TouchableOpacity>
                            ))}

                            <View style={[styles.card, styles.legalCard, { marginTop: Spacing.xl }]}>
                                <Text style={styles.cardTitle}>⚖️ İlgili Kanun Maddeleri</Text>
                                <Text style={styles.cardText}>{event.legal_references}</Text>
                            </View>
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
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: FontSize.lg,
        color: Colors.textSecondary,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        gap: 6,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: Colors.primary,
    },
    tabText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: FontWeight.medium,
    },
    activeTabText: {
        color: Colors.primary,
        fontWeight: FontWeight.bold,
    },
    content: {
        flex: 1,
    },
    tabContent: {
        padding: Spacing.lg,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
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
    legalCard: {
        borderLeftWidth: 4,
        borderLeftColor: Colors.warning,
    },
    cardTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    cardText: {
        fontSize: FontSize.sm,
        color: Colors.text,
        lineHeight: 22,
    },
    // Actions tab
    progressContainer: {
        marginBottom: Spacing.lg,
    },
    progressBar: {
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: Spacing.xs,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.success,
        borderRadius: 4,
    },
    progressText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        textAlign: 'right',
    },
    stepCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary,
    },
    criticalStep: {
        borderLeftColor: Colors.accent,
        backgroundColor: Colors.accent + '06',
    },
    checkedStep: {
        opacity: 0.7,
        borderLeftColor: Colors.success,
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: Colors.success,
        borderColor: Colors.success,
    },
    stepInfo: {
        flex: 1,
    },
    stepOrder: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
        marginBottom: 2,
    },
    criticalText: {
        color: Colors.accent,
    },
    stepText: {
        fontSize: FontSize.sm,
        color: Colors.text,
        lineHeight: 20,
    },
    checkedStepText: {
        textDecorationLine: 'line-through',
        color: Colors.textSecondary,
    },
    // Documents tab
    docSectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    formLink: {
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
    formLinkIcon: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: Colors.primary + '12',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    formLinkInfo: {
        flex: 1,
    },
    formLinkTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: Colors.text,
    },
    formLinkSub: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    fillButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
        gap: 4,
    },
    fillButtonText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.textLight,
    },
});
