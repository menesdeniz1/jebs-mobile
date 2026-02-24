import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';
import forms from '../../data/forms.json';
import { useAppStore } from '../../lib/store';

const categoryLabels: Record<string, string> = {
    search: 'Arama Tutanakları',
    investigation: 'İnceleme Tutanakları',
    apprehension: 'Yakalama/Koruma Tutanakları',
    seizure: 'El Koyma/Teslim Tutanakları',
    statement: 'İfade Tutanakları',
};

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    search: 'search',
    investigation: 'clipboard',
    apprehension: 'hand-left',
    seizure: 'lock-closed',
    statement: 'chatbubble-ellipses',
};

const categoryColors: Record<string, string> = {
    search: '#1565C0',
    investigation: '#4527A0',
    apprehension: '#C62828',
    seizure: '#E65100',
    statement: '#2E7D32',
};

export default function FormsScreen() {
    const router = useRouter();
    const savedForms = useAppStore((s) => s.savedForms);

    // Group forms by category
    const grouped = forms.reduce(
        (acc, form) => {
            if (!acc[form.category]) acc[form.category] = [];
            acc[form.category].push(form);
            return acc;
        },
        {} as Record<string, typeof forms>
    );

    const draftCount = savedForms.filter((f) => f.is_draft).length;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Draft indicator */}
            {draftCount > 0 && (
                <View style={styles.draftBanner}>
                    <Ionicons name="create" size={18} color={Colors.warning} />
                    <Text style={styles.draftText}>
                        {draftCount} adet taslak formunuz var
                    </Text>
                </View>
            )}

            <View style={styles.headerInfo}>
                <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
                <Text style={styles.headerInfoText}>
                    Formu seçin, doldurun ve PDF olarak kaydedin
                </Text>
            </View>

            {Object.entries(grouped).map(([category, categoryForms]) => (
                <View key={category} style={styles.categorySection}>
                    <View style={styles.categoryTitleRow}>
                        <View style={[styles.categoryDot, { backgroundColor: categoryColors[category] }]} />
                        <Text style={styles.categoryTitle}>{categoryLabels[category] || category}</Text>
                    </View>

                    {categoryForms.map((form) => {
                        const drafts = savedForms.filter(
                            (s) => s.template_id === form.id && s.is_draft
                        );
                        return (
                            <TouchableOpacity
                                key={form.id}
                                style={styles.formCard}
                                onPress={() => router.push(`/form/${form.id}`)}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.formIconBg,
                                        { backgroundColor: (categoryColors[category] || Colors.primary) + '12' },
                                    ]}
                                >
                                    <Ionicons
                                        name={categoryIcons[category] || 'document-text'}
                                        size={22}
                                        color={categoryColors[category] || Colors.primary}
                                    />
                                </View>
                                <View style={styles.formInfo}>
                                    <Text style={styles.formTitle}>{form.title}</Text>
                                    <Text style={styles.formFieldCount}>
                                        {form.fields.length} alan
                                        {drafts.length > 0 ? ` • ${drafts.length} taslak` : ''}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    draftBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.warning + '15',
        margin: Spacing.lg,
        marginBottom: 0,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    draftText: {
        fontSize: FontSize.sm,
        color: Colors.warning,
        fontWeight: FontWeight.semibold,
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
        marginBottom: Spacing.xl,
    },
    categoryTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    categoryDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: Spacing.sm,
    },
    categoryTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text,
    },
    formCard: {
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
});
