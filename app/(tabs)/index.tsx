import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FolderOpen, FileText, Clock } from 'lucide-react-native';
import ListCard from '../../components/ui/ListCard';
import SectionHeader from '../../components/ui/SectionHeader';
import { useTheme, Spacing } from '../../constants/theme';
import { useDraftsStore } from '../../store/draftsStore';
import { getCategories, getForms } from '../../data/loader';
import type { Category, FormTemplate } from '../../data/types';

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

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
        >
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
});
