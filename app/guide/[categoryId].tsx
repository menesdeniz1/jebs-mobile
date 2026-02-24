import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';
import categories from '../../data/categories.json';
import events from '../../data/events.json';

export default function CategoryDetailScreen() {
    const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
    const router = useRouter();

    const category = categories.find((c) => c.id === categoryId);
    const categoryEvents = events
        .filter((e) => e.category_id === categoryId)
        .sort((a, b) => a.order - b.order);

    if (!category) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Kategori bulunamadı</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: category.title }} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Category Header */}
                <View style={[styles.headerBanner, { backgroundColor: category.color }]}>
                    <Text style={styles.headerTitle}>{category.title}</Text>
                    <Text style={styles.headerDesc}>{category.description}</Text>
                    <Text style={styles.headerCount}>{categoryEvents.length} olay türü</Text>
                </View>

                {/* Events List */}
                <View style={styles.listContainer}>
                    {categoryEvents.map((event, index) => (
                        <TouchableOpacity
                            key={event.id}
                            style={styles.eventCard}
                            onPress={() => router.push(`/guide/event/${event.id}`)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.eventNumber}>
                                <Text style={styles.eventNumberText}>{index + 1}</Text>
                            </View>
                            <View style={styles.eventInfo}>
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <Text style={styles.eventDefinition} numberOfLines={2}>
                                    {event.definition}
                                </Text>
                                <View style={styles.eventMeta}>
                                    <View style={styles.metaBadge}>
                                        <Ionicons name="list" size={12} color={Colors.primary} />
                                        <Text style={styles.metaText}>{event.steps.length} adım</Text>
                                    </View>
                                    <View style={styles.metaBadge}>
                                        <Ionicons name="document-text" size={12} color={Colors.primary} />
                                        <Text style={styles.metaText}>{event.related_forms.length} form</Text>
                                    </View>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={22} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
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
    headerBanner: {
        padding: Spacing.xxl,
        paddingTop: Spacing.xxxl,
        paddingBottom: Spacing.xxxl,
    },
    headerTitle: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        color: Colors.textLight,
        marginBottom: Spacing.xs,
    },
    headerDesc: {
        fontSize: FontSize.sm,
        color: 'rgba(255,255,255,0.85)',
        marginBottom: Spacing.sm,
    },
    headerCount: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: FontWeight.semibold,
    },
    listContainer: {
        padding: Spacing.lg,
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
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
    eventNumber: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    eventNumberText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.text,
        marginBottom: 4,
    },
    eventDefinition: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        lineHeight: 18,
        marginBottom: Spacing.sm,
    },
    eventMeta: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    metaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: FontWeight.medium,
    },
});
