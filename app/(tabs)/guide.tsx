import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FolderOpen } from 'lucide-react-native';
import ListCard from '../../components/ui/ListCard';
import { useTheme, Spacing } from '../../constants/theme';
import categories from '../../data/categories.json';

const categoryColors: Record<string, string> = {
    asayis: '#1565C0',
    teror: '#C62828',
    tem: '#4527A0',
    kacakcilik: '#E65100',
};

export default function GuideScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
        >
            {categories.map((cat: any) => (
                <ListCard
                    key={cat.id}
                    icon={<FolderOpen size={22} color={categoryColors[cat.id] || colors.primary} />}
                    title={cat.title}
                    subtitle={cat.description}
                    borderColor={categoryColors[cat.id] || colors.primary}
                    onPress={() => router.push(`/guide/${cat.id}`)}
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: Spacing.lg },
});
