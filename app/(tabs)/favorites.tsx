import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';
import { useAppStore } from '../../lib/store';
import events from '../../data/events.json';
import forms from '../../data/forms.json';

export default function FavoritesScreen() {
    const router = useRouter();
    const favorites = useAppStore((s) => s.favorites);
    const toggleFavorite = useAppStore((s) => s.toggleFavorite);

    const eventFavorites = favorites
        .filter((f) => f.type === 'event_type')
        .map((f) => ({
            ...f,
            item: events.find((e) => e.id === f.reference_id),
        }))
        .filter((f) => f.item);

    const formFavorites = favorites
        .filter((f) => f.type === 'form_template')
        .map((f) => ({
            ...f,
            item: forms.find((fr) => fr.id === f.reference_id),
        }))
        .filter((f) => f.item);

    if (favorites.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBg}>
                    <Ionicons name="star-outline" size={48} color={Colors.textSecondary} />
                </View>
                <Text style={styles.emptyTitle}>Henüz favori eklemediniz</Text>
                <Text style={styles.emptySubtitle}>
                    Olay rehberi veya formlarda ⭐ ikona basarak{'\n'}favorilerinize ekleyebilirsiniz
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {eventFavorites.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📋 Olay Rehberleri</Text>
                    {eventFavorites.map((fav) => (
                        <TouchableOpacity
                            key={fav.id}
                            style={styles.favCard}
                            onPress={() => router.push(`/guide/event/${fav.reference_id}`)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.favIconBg}>
                                <Ionicons name="book" size={22} color={Colors.primary} />
                            </View>
                            <View style={styles.favInfo}>
                                <Text style={styles.favTitle}>{fav.item!.title}</Text>
                                <Text style={styles.favDate}>
                                    {new Date(fav.added_at).toLocaleDateString('tr-TR')}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => toggleFavorite('event_type', fav.reference_id)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="star" size={22} color={Colors.warning} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {formFavorites.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📝 Form Şablonları</Text>
                    {formFavorites.map((fav) => (
                        <TouchableOpacity
                            key={fav.id}
                            style={styles.favCard}
                            onPress={() => router.push(`/form/${fav.reference_id}`)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.favIconBg, { backgroundColor: Colors.info + '12' }]}>
                                <Ionicons name="document-text" size={22} color={Colors.info} />
                            </View>
                            <View style={styles.favInfo}>
                                <Text style={styles.favTitle}>{fav.item!.title}</Text>
                                <Text style={styles.favDate}>
                                    {new Date(fav.added_at).toLocaleDateString('tr-TR')}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => toggleFavorite('form_template', fav.reference_id)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="star" size={22} color={Colors.warning} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xxxl,
    },
    emptyIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    section: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    favCard: {
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
    favIconBg: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: Colors.primary + '12',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    favInfo: {
        flex: 1,
    },
    favTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: Colors.text,
    },
    favDate: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },
});
