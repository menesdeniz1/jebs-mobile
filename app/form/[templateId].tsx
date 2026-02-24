import { useState, useCallback, useMemo } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    TextInput, Platform, Alert, KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';
import forms from '../../data/forms.json';
import { useAppStore } from '../../lib/store';
import { generatePDF, sharePDF, buildFormContentHTML } from '../../lib/pdf';

const groupLabels: Record<string, string> = {
    location: '📍 Yer ve Zaman',
    officer: '👮 Düzenleyen Bilgileri',
    subject: '👤 İlgili Kişi Bilgileri',
    vehicle: '🚗 Araç Bilgileri',
    vehicle1: '🚗 1. Araç Bilgileri',
    vehicle2: '🚙 2. Araç Bilgileri',
    details: '📋 Olay/İşlem Detayları',
    witnesses: '👁️ Tanık Bilgileri',
    statement: '💬 İfade İçeriği',
};

export default function FormFillingScreen() {
    const { templateId } = useLocalSearchParams<{ templateId: string }>();
    const [values, setValues] = useState<Record<string, string>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [showDropdown, setShowDropdown] = useState<string | null>(null);

    const saveForm = useAppStore((s) => s.saveForm);
    const toggleFavorite = useAppStore((s) => s.toggleFavorite);
    const isFav = useAppStore((s) => s.isFavorite);

    const template = forms.find((f) => f.id === templateId);

    const groupedFields = useMemo(() => {
        if (!template) return {};
        const groups: Record<string, typeof template.fields> = {};
        for (const field of template.fields) {
            const group = field.group || 'details';
            if (!groups[group]) groups[group] = [];
            groups[group].push(field);
        }
        return groups;
    }, [template]);

    const updateValue = useCallback((fieldId: string, value: string) => {
        setValues((prev) => ({ ...prev, [fieldId]: value }));
    }, []);

    const handleSaveDraft = useCallback(() => {
        if (!template) return;
        const form = {
            id: Date.now().toString(),
            template_id: template.id,
            values,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_draft: true,
            pdf_path: null,
        };
        saveForm(form);
        Alert.alert('Başarılı', 'Taslak kaydedildi.');
    }, [template, values, saveForm]);

    const handleGeneratePDF = useCallback(async () => {
        if (!template) return;

        // Validate required fields
        const missing = template.fields
            .filter((f) => f.required && !values[f.id])
            .map((f) => f.label);

        if (missing.length > 0) {
            Alert.alert(
                'Eksik Alanlar',
                `Şu alanlar zorunludur:\n${missing.join('\n')}`
            );
            return;
        }

        setIsGenerating(true);
        try {
            const contentHTML = buildFormContentHTML(template.fields, values);
            const uri = await generatePDF({
                title: template.title,
                il: values.il || '',
                ilce: values.ilce || '',
                tarih: values.tarih || '',
                saat: values.saat || '',
                duzenleyen_adsoyad: values.duzenleyen_adsoyad || '',
                duzenleyen_rutbe: values.duzenleyen_rutbe || '',
                duzenleyen_sicil: values.duzenleyen_sicil || '',
                content: contentHTML,
            });

            if (uri) {
                // Save completed form
                const form = {
                    id: Date.now().toString(),
                    template_id: template.id,
                    values,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    is_draft: false,
                    pdf_path: uri,
                };
                saveForm(form);

                Alert.alert(
                    'PDF Oluşturuldu',
                    'Tutanak başarıyla oluşturuldu. Paylaşmak ister misiniz?',
                    [
                        { text: 'Kapat', style: 'cancel' },
                        {
                            text: 'Paylaş',
                            onPress: () => sharePDF(uri),
                        },
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Hata', 'PDF oluşturulurken bir hata oluştu.');
        } finally {
            setIsGenerating(false);
        }
    }, [template, values, saveForm]);

    if (!template) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Form şablonu bulunamadı</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: template.title,
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', gap: 12, marginRight: 8 }}>
                            <TouchableOpacity
                                onPress={handleSaveDraft}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="save-outline" size={24} color={Colors.textLight} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => toggleFavorite('form_template', template.id)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name={isFav(template.id) ? 'star' : 'star-outline'}
                                    size={24}
                                    color={isFav(template.id) ? '#FFD700' : Colors.textLight}
                                />
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.container}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {Object.entries(groupedFields).map(([group, fields]) => (
                        <View key={group} style={styles.groupSection}>
                            <Text style={styles.groupTitle}>{groupLabels[group] || group}</Text>
                            {fields.map((field) => (
                                <View key={field.id} style={styles.fieldContainer}>
                                    <Text style={styles.fieldLabel}>
                                        {field.label}
                                        {field.required && <Text style={styles.required}> *</Text>}
                                    </Text>

                                    {field.type === 'text' && (
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder={field.placeholder || field.label}
                                            placeholderTextColor={Colors.textSecondary + '80'}
                                            value={values[field.id] || ''}
                                            onChangeText={(text) => updateValue(field.id, text)}
                                        />
                                    )}

                                    {field.type === 'number' && (
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder={field.placeholder || field.label}
                                            placeholderTextColor={Colors.textSecondary + '80'}
                                            value={values[field.id] || ''}
                                            onChangeText={(text) => updateValue(field.id, text)}
                                            keyboardType="numeric"
                                        />
                                    )}

                                    {field.type === 'textarea' && (
                                        <TextInput
                                            style={[styles.textInput, styles.textArea]}
                                            placeholder={field.placeholder || field.label}
                                            placeholderTextColor={Colors.textSecondary + '80'}
                                            value={values[field.id] || ''}
                                            onChangeText={(text) => updateValue(field.id, text)}
                                            multiline
                                            numberOfLines={4}
                                            textAlignVertical="top"
                                        />
                                    )}

                                    {field.type === 'date' && (
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="GG/AA/YYYY"
                                            placeholderTextColor={Colors.textSecondary + '80'}
                                            value={values[field.id] || ''}
                                            onChangeText={(text) => updateValue(field.id, text)}
                                        />
                                    )}

                                    {field.type === 'time' && (
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="SS:DD"
                                            placeholderTextColor={Colors.textSecondary + '80'}
                                            value={values[field.id] || ''}
                                            onChangeText={(text) => updateValue(field.id, text)}
                                        />
                                    )}

                                    {field.type === 'dropdown' && (
                                        <View>
                                            <TouchableOpacity
                                                style={styles.dropdown}
                                                onPress={() => setShowDropdown(showDropdown === field.id ? null : field.id)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dropdownText,
                                                        !values[field.id] && styles.dropdownPlaceholder,
                                                    ]}
                                                >
                                                    {values[field.id] || 'Seçiniz...'}
                                                </Text>
                                                <Ionicons
                                                    name={showDropdown === field.id ? 'chevron-up' : 'chevron-down'}
                                                    size={20}
                                                    color={Colors.textSecondary}
                                                />
                                            </TouchableOpacity>
                                            {showDropdown === field.id && (
                                                <View style={styles.dropdownOptions}>
                                                    {field.options.map((option) => (
                                                        <TouchableOpacity
                                                            key={option}
                                                            style={[
                                                                styles.dropdownOption,
                                                                values[field.id] === option && styles.dropdownOptionActive,
                                                            ]}
                                                            onPress={() => {
                                                                updateValue(field.id, option);
                                                                setShowDropdown(null);
                                                            }}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.dropdownOptionText,
                                                                    values[field.id] === option && styles.dropdownOptionTextActive,
                                                                ]}
                                                            >
                                                                {option}
                                                            </Text>
                                                            {values[field.id] === option && (
                                                                <Ionicons name="checkmark" size={18} color={Colors.primary} />
                                                            )}
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    ))}

                    {/* Action Buttons */}
                    <View style={styles.actionSection}>
                        <TouchableOpacity
                            style={[styles.primaryButton, isGenerating && styles.buttonDisabled]}
                            onPress={handleGeneratePDF}
                            disabled={isGenerating}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="document" size={20} color={Colors.textLight} />
                            <Text style={styles.primaryButtonText}>
                                {isGenerating ? 'Oluşturuluyor...' : '📄 PDF OLUŞTUR ve KAYDET'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleSaveDraft}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="save" size={20} color={Colors.primary} />
                            <Text style={styles.secondaryButtonText}>💾 Taslak Olarak Kaydet</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
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
    groupSection: {
        backgroundColor: Colors.surface,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.lg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
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
    groupTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.text,
        marginBottom: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    fieldContainer: {
        marginBottom: Spacing.md,
    },
    fieldLabel: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    required: {
        color: Colors.accent,
    },
    textInput: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.sm,
        padding: Spacing.md,
        fontSize: FontSize.md,
        color: Colors.text,
    },
    textArea: {
        minHeight: 100,
        paddingTop: Spacing.md,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.sm,
        padding: Spacing.md,
    },
    dropdownText: {
        fontSize: FontSize.md,
        color: Colors.text,
    },
    dropdownPlaceholder: {
        color: Colors.textSecondary + '80',
    },
    dropdownOptions: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.sm,
        marginTop: Spacing.xs,
        maxHeight: 200,
        overflow: 'scroll' as any,
    },
    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    dropdownOptionActive: {
        backgroundColor: Colors.primary + '10',
    },
    dropdownOptionText: {
        fontSize: FontSize.md,
        color: Colors.text,
    },
    dropdownOptionTextActive: {
        color: Colors.primary,
        fontWeight: FontWeight.semibold,
    },
    actionSection: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
        ...Platform.select({
            ios: {
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: { elevation: 4 },
            web: { boxShadow: `0 4px 8px ${Colors.primary}50` as any },
        }),
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    primaryButtonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.textLight,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        borderColor: Colors.primary,
        gap: Spacing.sm,
    },
    secondaryButtonText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
    },
});
