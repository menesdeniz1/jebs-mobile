import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, Clock } from 'lucide-react-native';
import ListCard from '../../components/ui/ListCard';
import SectionHeader from '../../components/ui/SectionHeader';
import { useTheme, Spacing } from '../../constants/theme';
import { useDraftsStore } from '../../store/draftsStore';
import { getForms } from '../../data/loader';
import type { FormTemplate } from '../../data/types';

const forms = getForms();

export default function FormsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    // Select raw array for stable reference
    const drafts = useDraftsStore((s) => s.drafts);
    const sortedDrafts = useMemo(
        () => [...drafts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
        [drafts]
    );

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
        >
            {forms.map((form: FormTemplate) => (
                <ListCard
                    key={form.id}
                    icon={<FileText size={20} color={colors.primary} />}
                    title={form.title}
                    borderColor={colors.primary}
                    onPress={() => router.push(`/form/${form.id}` as `/form/${string}`)}
                />
            ))}

            {sortedDrafts.length > 0 && (
                <>
                    <SectionHeader emoji="💾" title="Kaydedilmiş Taslaklar" />
                    {sortedDrafts.map((draft) => (
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
    container: { flex: 1 },
    content: { padding: Spacing.lg },
});
