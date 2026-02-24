import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';
import categories from '../../data/categories.json';
import events from '../../data/events.json';

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    asayis: 'shield-checkmark',
    teror: 'alert-circle',
    tem: 'eye',
    kacakcilik: 'cube',
};

export default function GuideScreen() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.headerInfo}>
                <Ionicons name="book-outline" size={20} color={Colors.primary} />
                <Text style={styles.headerInfoText}>
                    Olay türünü seçerek detaylı prosedüre ulaşın
                </Text>
            </View>

            {categories.map((cat) => {
                const catEvents = events.filter((e) => e.category_id === cat.id);
                return (
                    <View key={cat.id} style={styles.categorySection}>
                        <TouchableOpacity
                            style={[styles.categoryHeader, { borderLeftColor: cat.color }]}
                            onPress={() => router.push(`/guide/${cat.id}`)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.catIconBg, { backgroundColor: cat.color + '15' }]}>
                                <Ionicons
                                    name={categoryIcons[cat.id] || 'folder'}
                                    size={24}
                                    color={cat.color}
                                />
                            </View>
                            <View style={styles.catInfo}>
                                <Text style={styles.catTitle}>{cat.title}</Text>
                                <Text style={styles.catDesc}>{cat.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={22} color={Colors.textSecondary} />
                        </TouchableOpacity>

                        {catEvents.map((event) => (
                            <TouchableOpacity
                                key={event.id}
                                style={styles.eventItem}
                                onPress={() => router.push(`/guide/event/${event.id}`)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.eventDot} />
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <View style={styles.eventMeta}>
                                    <Text style={styles.eventStepCount}>{event.steps.length} adım</Text>
                                    <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            })}

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '08',
        margin: Spacing.lg,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    headerInfoText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: FontWeight.medium,
    },
    categorySection: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderLeftWidth: 4,
        marginBottom: Spacing.xs,
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
    catIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    catInfo: {
        flex: 1,
    },
    catTitle: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
        color: Colors.text,
    },
    catDesc: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    eventItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        paddingLeft: Spacing.xl,
        marginLeft: Spacing.xl,
        borderRadius: BorderRadius.sm,
        marginTop: Spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    eventDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginRight: Spacing.md,
    },
    eventTitle: {
        flex: 1,
        fontSize: FontSize.md,
        color: Colors.text,
        fontWeight: FontWeight.medium,
    },
    eventMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    eventStepCount: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },
});
