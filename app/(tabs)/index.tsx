import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';
import categories from '../../data/categories.json';
import forms from '../../data/forms.json';
import { useAppStore } from '../../lib/store';
import events from '../../data/events.json';

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    asayis: 'shield-checkmark',
    teror: 'alert-circle',
    tem: 'eye',
    kacakcilik: 'cube',
};

const formIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    search: 'search',
    investigation: 'clipboard',
    apprehension: 'hand-left',
    seizure: 'lock-closed',
    statement: 'chatbubble-ellipses',
};

const quickForms = forms.slice(0, 4);

export default function HomeScreen() {
    const router = useRouter();
    const favorites = useAppStore((s) => s.favorites);

    const recentFavorites = favorites.slice(0, 3);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Search Bar */}
            <TouchableOpacity
                style={styles.searchBar}
                onPress={() => router.push('/search')}
                activeOpacity={0.8}
            >
                <Ionicons name="search" size={20} color={Colors.textSecondary} />
                <Text style={styles.searchPlaceholder}>Olay, form veya kanun maddesi ara...</Text>
            </TouchableOpacity>

            {/* Hero Banner */}
            <View style={styles.heroBanner}>
                <View style={styles.heroIconContainer}>
                    <Text style={styles.heroIcon}>⚔️</Text>
                </View>
                <Text style={styles.heroTitle}>Jandarma Saha Rehberi</Text>
                <Text style={styles.heroSubtitle}>Sahada ihtiyacınız olan tüm bilgiler elinizin altında</Text>
            </View>

            {/* Category Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📋 Olay Rehberi</Text>
                <View style={styles.categoryGrid}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.categoryCard, { borderLeftColor: cat.color }]}
                            onPress={() => router.push(`/guide/${cat.id}`)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.categoryIconBg, { backgroundColor: cat.color + '15' }]}>
                                <Ionicons
                                    name={categoryIcons[cat.id] || 'folder'}
                                    size={28}
                                    color={cat.color}
                                />
                            </View>
                            <Text style={styles.categoryTitle}>{cat.title}</Text>
                            <Text style={styles.categoryCount}>
                                {events.filter((e) => e.category_id === cat.id).length} olay türü
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Quick Forms Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>📝 Hızlı Erişim Formları</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/forms')}>
                        <Text style={styles.seeAll}>Tümünü Gör →</Text>
                    </TouchableOpacity>
                </View>
                {quickForms.map((form) => (
                    <TouchableOpacity
                        key={form.id}
                        style={styles.formItem}
                        onPress={() => router.push(`/form/${form.id}`)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.formIconBg}>
                            <Ionicons
                                name={formIcons[form.category] || 'document-text'}
                                size={22}
                                color={Colors.primary}
                            />
                        </View>
                        <View style={styles.formInfo}>
                            <Text style={styles.formTitle}>{form.title}</Text>
                            <Text style={styles.formFieldCount}>{form.fields.length} alan</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Favorites Preview */}
            {recentFavorites.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>⭐ Favoriler</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/favorites')}>
                            <Text style={styles.seeAll}>Tümünü Gör →</Text>
                        </TouchableOpacity>
                    </View>
                    {recentFavorites.map((fav) => {
                        const item =
                            fav.type === 'event_type'
                                ? events.find((e) => e.id === fav.reference_id)
                                : forms.find((f) => f.id === fav.reference_id);
                        if (!item) return null;
                        return (
                            <TouchableOpacity
                                key={fav.id}
                                style={styles.formItem}
                                onPress={() =>
                                    fav.type === 'event_type'
                                        ? router.push(`/guide/event/${fav.reference_id}`)
                                        : router.push(`/form/${fav.reference_id}`)
                                }
                                activeOpacity={0.7}
                            >
                                <View style={[styles.formIconBg, { backgroundColor: Colors.warning + '15' }]}>
                                    <Ionicons
                                        name={fav.type === 'event_type' ? 'book' : 'document-text'}
                                        size={22}
                                        color={Colors.warning}
                                    />
                                </View>
                                <View style={styles.formInfo}>
                                    <Text style={styles.formTitle}>{item.title}</Text>
                                    <Text style={styles.formFieldCount}>
                                        {fav.type === 'event_type' ? 'Olay Rehberi' : 'Form Şablonu'}
                                    </Text>
                                </View>
                                <Ionicons name="star" size={18} color={Colors.warning} />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* Info Banner */}
            <View style={styles.infoBanner}>
                <Ionicons name="information-circle" size={20} color={Colors.info} />
                <Text style={styles.infoText}>
                    Bu uygulama çevrimdışı çalışır. İnternet bağlantısı gerekmez.
                </Text>
            </View>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        margin: Spacing.lg,
        marginBottom: Spacing.md,
        padding: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: { elevation: 3 },
            web: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' as any },
        }),
    },
    searchPlaceholder: {
        marginLeft: Spacing.sm,
        color: Colors.textSecondary,
        fontSize: FontSize.md,
        flex: 1,
    },
    heroBanner: {
        backgroundColor: Colors.primary,
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xxl,
        alignItems: 'center',
        marginBottom: Spacing.lg,
        ...Platform.select({
            ios: {
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: { elevation: 6 },
            web: { boxShadow: `0 4px 12px ${Colors.primary}50` as any },
        }),
    },
    heroIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    heroIcon: {
        fontSize: 28,
    },
    heroTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        color: Colors.textLight,
        marginBottom: Spacing.xs,
    },
    heroSubtitle: {
        fontSize: FontSize.sm,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    seeAll: {
        color: Colors.primary,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        marginBottom: Spacing.md,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    categoryCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        width: '47%',
        borderLeftWidth: 4,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: { elevation: 2 },
            web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' as any },
        }),
    },
    categoryIconBg: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    categoryTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.text,
        marginBottom: 2,
    },
    categoryCount: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
    formItem: {
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
    formIconBg: {
        width: 42,
        height: 42,
        borderRadius: 10,
        backgroundColor: Colors.primary + '12',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    formInfo: {
        flex: 1,
    },
    formTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: Colors.text,
    },
    formFieldCount: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.info + '12',
        marginHorizontal: Spacing.lg,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.info,
        fontWeight: FontWeight.medium,
    },
});
