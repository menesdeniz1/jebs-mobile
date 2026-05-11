import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import ListCard from '../../components/ui/ListCard';
import { useTheme, Spacing } from '../../constants/theme';
import { getCategoryById, getEventsByCategory } from '../../data/loader';
import type { Event } from '../../data/types';

export default function CategoryScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { categoryId } = useLocalSearchParams<{ categoryId: string }>();

    const category = getCategoryById(categoryId);
    const categoryEvents = getEventsByCategory(categoryId);

    return (
        <>
            <Stack.Screen options={{ title: category?.title || 'Kategori' }} />
            <ScrollView
                style={[styles.container, { backgroundColor: colors.background }]}
                contentContainerStyle={styles.content}
            >
                {categoryEvents.map((event: Event) => (
                    <ListCard
                        key={event.id}
                        icon={<BookOpen size={20} color={colors.primary} />}
                        title={event.title}
                        borderColor={colors.primary}
                        onPress={() => router.push(`/guide/event/${event.id}`)}
                    />
                ))}
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: Spacing.lg },
});
