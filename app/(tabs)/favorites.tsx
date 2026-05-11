import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Star, Trash2, BookOpen, FileText, Scale } from 'lucide-react-native';
import ListCard from '../../components/ui/ListCard';
import SectionHeader from '../../components/ui/SectionHeader';
import Dialog from '../../components/ui/Dialog';
import { showInfo } from '../../components/ui/Toast';
import { useTheme, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { useFavoritesStore, FavoriteType } from '../../store/favoritesStore';

const typeLabels: Record<FavoriteType, string> = {
    event_type: 'Olay Türleri',
    form_template: 'Tutanaklar',
    draft: 'Taslaklar',
    law_article: 'Kanun Maddeleri',
};

const typeIcons: Record<FavoriteType, React.ReactNode> = {
    event_type: <BookOpen size={20} color="#1565C0" />,
    form_template: <FileText size={20} color="#1B5E20" />,
    draft: <FileText size={20} color="#F57C00" />,
    law_article: <Scale size={20} color="#4527A0" />,
};

export default function FavoritesScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const favorites = useFavoritesStore((s) => s.favorites);
    const remove = useFavoritesStore((s) => s.remove);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const grouped = favorites.reduce(
        (acc, fav) => {
            if (!acc[fav.type]) acc[fav.type] = [];
            acc[fav.type].push(fav);
            return acc;
        },
        {} as Record<string, typeof favorites>
    );

    const navigateToFavorite = (fav: (typeof favorites)[0]) => {
        switch (fav.type) {
            case 'event_type':
                router.push({ pathname: '/guide/event/[eventId]', params: { eventId: fav.referenceId } });
                break;
            case 'form_template':
                router.push({ pathname: '/form/[templateId]', params: { templateId: fav.referenceId } });
                break;
            case 'draft':
                router.push({ pathname: '/form/[templateId]', params: { templateId: fav.referenceId, draftId: fav.referenceId } });
                break;
            case 'law_article':
                // Navigate to event containing law article
                router.push({ pathname: '/guide/event/[eventId]', params: { eventId: fav.referenceId } });
                break;
        }
    };

    if (favorites.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
                <Star size={60} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: FontFamily.regular }]}>
                    Henüz favori eklenmedi
                </Text>
                <Text style={[styles.emptyHint, { color: colors.textSecondary, fontFamily: FontFamily.regular }]}>
                    Olay türleri ve tutanakları favorilerinize ekleyebilirsiniz
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
        >
            {(Object.keys(grouped) as FavoriteType[]).map((type) => (
                <View key={type}>
                    <SectionHeader title={typeLabels[type]} />
                    {grouped[type].map((fav) => (
                        <ListCard
                            key={fav.id}
                            icon={typeIcons[fav.type]}
                            title={fav.title}
                            borderColor={colors.primary}
                            onPress={() => navigateToFavorite(fav)}
                            rightElement={
                                <TouchableOpacity
                                    onPress={() => setDeleteTarget(fav.referenceId)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Trash2 size={18} color={colors.accent} />
                                </TouchableOpacity>
                            }
                        />
                    ))}
                </View>
            ))}
            <View style={{ height: 30 }} />

            <Dialog
                visible={deleteTarget !== null}
                title="Favorilerden Kaldır"
                message="Bu öğeyi favorilerden kaldırmak istediğinizden emin misiniz?"
                buttons={[
                    {
                        label: 'Evet, Kaldır',
                        variant: 'danger',
                        onPress: () => {
                            if (deleteTarget) {
                                remove(deleteTarget);
                                showInfo('Favorilerden çıkarıldı');
                            }
                            setDeleteTarget(null);
                        },
                    },
                    {
                        label: 'İptal',
                        variant: 'secondary',
                        onPress: () => setDeleteTarget(null),
                    },
                ]}
                onClose={() => setDeleteTarget(null)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: Spacing.lg },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxxl,
    },
    emptyText: {
        fontSize: FontSize.heading,
        marginTop: Spacing.xl,
    },
    emptyHint: {
        fontSize: FontSize.body,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
});
