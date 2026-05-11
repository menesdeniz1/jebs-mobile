import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FolderOpen, FileText, Clock, Sun, Moon, Phone } from 'lucide-react-native';
import ListCard from '../../components/ui/ListCard';
import SectionHeader from '../../components/ui/SectionHeader';
import { useTheme, Spacing, FontFamily, FontSize, BorderRadius, MinTapTarget, useFieldModeStore } from '../../constants/theme';
import { useDraftsStore } from '../../store/draftsStore';
import { getCategories, getForms } from '../../data/loader';
import type { Category, FormTemplate } from '../../data/types';
import OfficerProfileCard from '../../components/profile/OfficerProfileCard';

const categoryColors: Record<string, string> = {
    asayis: '#1565C0',
    teror: '#C62828',
    tem: '#4527A0',
    kacakcilik: '#E65100',
};

const categories = getCategories();
const quickForms = getForms().slice(0, 4);

export default function HomeScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    // Select the raw array — not a method that creates a new ref each render
    const drafts = useDraftsStore((s) => s.drafts);
    const recentDrafts = useMemo(
        () =>
            [...drafts]
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 3),
        [drafts]
    );

    const isFieldMode = useFieldModeStore((s) => s.isFieldMode);
    const toggleFieldMode = useFieldModeStore((s) => s.toggle);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
        >
            {/* Saha Modu Toggle */}
            <TouchableOpacity
                style={[
                    styles.fieldModeCard,
                    {
                        backgroundColor: isFieldMode ? '#FFF3E0' : colors.surface,
                        borderColor: isFieldMode ? '#E65100' : colors.border,
                    },
                ]}
                onPress={toggleFieldMode}
                activeOpacity={0.7}
            >
                {isFieldMode ? (
                    <Sun size={22} color="#E65100" />
                ) : (
                    <Moon size={22} color={colors.textSecondary} />
                )}
                <View style={styles.fieldModeText}>
                    <Text
                        style={[
                            styles.fieldModeTitle,
                            {
                                color: isFieldMode ? '#E65100' : colors.textPrimary,
                                fontFamily: FontFamily.bold,
                            },
                        ]}
                    >
                        {isFieldMode ? '🔶 Saha Modu AKTİF' : 'Saha Modu'}
                    </Text>
                    <Text
                        style={[
                            styles.fieldModeSubtitle,
                            {
                                color: isFieldMode ? '#BF360C' : colors.textSecondary,
                                fontFamily: FontFamily.regular,
                            },
                        ]}
                    >
                        {isFieldMode
                            ? 'Büyük yazı tipi aktif — dokunarak kapatın'
                            : 'Daha büyük yazı tipi için dokunun'}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Personel Profili (P3-16) */}
            <OfficerProfileCard />

            {/* Olay Rehberi */}
            <SectionHeader emoji="📋" title="Olay Rehberi" />
            {categories.map((cat: Category) => (
                <ListCard
                    key={cat.id}
                    icon={<FolderOpen size={22} color={categoryColors[cat.id] || colors.primary} />}
                    title={cat.title}
                    subtitle={cat.description}
                    borderColor={categoryColors[cat.id] || colors.primary}
                    onPress={() => router.push(`/guide/${cat.id}` as `/guide/${string}`)}
                />
            ))}

            {/* Sık Kullanılan Tutanaklar */}
            <SectionHeader
                emoji="📝"
                title="Sık Kullanılan Tutanaklar"
                actionLabel="Tümünü Gör"
                onAction={() => router.push('/(tabs)/forms')}
            />
            {quickForms.map((form: FormTemplate) => (
                <ListCard
                    key={form.id}
                    icon={<FileText size={20} color={colors.primary} />}
                    title={form.title}
                    borderColor={colors.primary}
                    onPress={() => router.push(`/form/${form.id}` as `/form/${string}`)}
                />
            ))}

            {/* Son Taslaklar */}
            {recentDrafts.length > 0 && (
                <>
                    <SectionHeader emoji="🕐" title="Son Taslaklar" />
                    {recentDrafts.map((draft) => (
                        <ListCard
                            key={draft.id}
                            icon={<Clock size={20} color={colors.warning} />}
                            title={draft.templateTitle}
                            subtitle={new Date(draft.updatedAt).toLocaleDateString('tr-TR')}
                            borderColor={colors.warning}
                            onPress={() =>
                                router.push({
                                    pathname: '/form/[templateId]',
                                    params: { templateId: draft.templateId, draftId: draft.id },
                                })
                            }
                        />
                    ))}
                </>
            )}

            {/* Acil Numaralar (P3-19) */}
            <SectionHeader emoji="🚨" title="Acil Numaralar" />
            <View style={styles.emergencyRow}>
                {[
                    { number: '112', label: 'Acil', color: '#D32F2F' },
                    { number: '155', label: 'Polis', color: '#1565C0' },
                    { number: '156', label: 'Jandarma', color: '#1B5E20' },
                ].map((item) => (
                    <TouchableOpacity
                        key={item.number}
                        style={[styles.emergencyButton, { backgroundColor: item.color }]}
                        onPress={() =>
                            Linking.openURL(`tel:${item.number}`).catch(() => {})
                        }
                        activeOpacity={0.7}
                    >
                        <Phone size={18} color="#FFFFFF" />
                        <Text style={[styles.emergencyNumber, { fontFamily: FontFamily.bold }]}>
                            {item.number}
                        </Text>
                        <Text style={[styles.emergencyLabel, { fontFamily: FontFamily.regular }]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: Spacing.lg,
    },
    fieldModeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        marginBottom: Spacing.lg,
        minHeight: MinTapTarget,
        gap: Spacing.md,
    },
    fieldModeText: {
        flex: 1,
    },
    fieldModeTitle: {
        fontSize: FontSize.subheading,
    },
    fieldModeSubtitle: {
        fontSize: FontSize.small,
        marginTop: 2,
    },
    emergencyRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    emergencyButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.md,
        minHeight: MinTapTarget,
        gap: Spacing.xs,
    },
    emergencyNumber: {
        color: '#FFFFFF',
        fontSize: FontSize.heading,
    },
    emergencyLabel: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: FontSize.small,
    },
});
