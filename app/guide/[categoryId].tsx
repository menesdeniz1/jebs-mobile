import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import ListCard from '../../components/ui/ListCard';
import { useTheme, Spacing } from '../../constants/theme';
import categories from '../../data/categories.json';
import events from '../../data/events.json';

export default function CategoryScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { categoryId } = useLocalSearchParams<{ categoryId: string }>();

    const category = categories.find((c: any) => c.id === categoryId);
    const categoryEvents = (events as any[])
        .filter((e: any) => e.category_id === categoryId)
        .sort((a: any, b: any) => a.order - b.order);

    return (
        <>
            <Stack.Screen options={{ title: category?.title || 'Kategori' }} />
            <ScrollView
                style={[styles.container, { backgroundColor: colors.background }]}
                contentContainerStyle={styles.content}
            >
                {categoryEvents.map((event: any) => (
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
