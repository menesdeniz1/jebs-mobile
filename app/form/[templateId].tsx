import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Save, Eye, FileDown, Star } from 'lucide-react-native';
import FormField from '../../components/form/FormField';
import SectionHeader from '../../components/ui/SectionHeader';
import Dialog from '../../components/ui/Dialog';
import { showSuccess, showError, showInfo } from '../../components/ui/Toast';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { useDraftsStore, Draft } from '../../store/draftsStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { validateForm } from '../../lib/validation';
import { generatePDF, buildFormContentHTML, PDFData } from '../../lib/pdf';
import { getFormById } from '../../data/loader';
import type { FormTemplate, FormField as FormFieldType } from '../../data/types';

export default function FormFillingScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { templateId, draftId } = useLocalSearchParams<{ templateId: string; draftId?: string }>();
    const scrollRef = useRef<ScrollView>(null);

    const template = getFormById(templateId);
    const saveDraft = useDraftsStore((s) => s.save);
    const drafts = useDraftsStore((s) => s.drafts);

    // Favorites
    const isFavorite = useFavoritesStore((s) => s.isFavorite(templateId));
    const toggleFavorite = useFavoritesStore((s) => s.toggle);

    const [values, setValues] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [pendingBack, setPendingBack] = useState(false);

    // Load draft if draftId provided
    useEffect(() => {
        if (draftId) {
            const draft = drafts.find((d) => d.id === draftId);
            if (draft) setValues(draft.values);
        }
    }, [draftId]);

    if (!template) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textPrimary }}>Form bulunamadı</Text>
            </View>
        );
    }

    const handleToggleFavorite = () => {
        toggleFavorite('form_template', templateId, template.title);
        if (isFavorite) {
            showInfo('Favorilerden çıkarıldı');
        } else {
            showSuccess('Favorilere eklendi');
        }
    };

    const handleFieldChange = (fieldId: string, value: string) => {
        setValues((prev) => ({ ...prev, [fieldId]: value }));
        if (errors[fieldId]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[fieldId];
                return next;
            });
        }
    };

    const handleSaveDraft = () => {
        const draft: Draft = {
            id: draftId || Date.now().toString(),
            templateId,
            templateTitle: template.title,
            values,
            createdAt: draftId
                ? drafts.find((d) => d.id === draftId)?.createdAt || new Date().toISOString()
                : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        saveDraft(draft);
        showSuccess('Taslak kaydedildi');
        setShowSaveDialog(false);
        if (pendingBack) {
            setPendingBack(false);
            router.back();
        }
    };

    const handleValidateAndGenerate = async () => {
        const formErrors = validateForm(template.fields, values);
        setErrors(formErrors);
        if (Object.keys(formErrors).length > 0) {
            showError('Lütfen zorunlu alanları doldurun');
            scrollRef.current?.scrollTo({ y: 0, animated: true });
            return;
        }
        try {
            const html = buildFormContentHTML(template.fields, values);
            const pdfData: PDFData = {
                title: template.title,
                il: values.il || '',
                ilce: values.ilce || '',
                mahalleKoy: values.mahalle_koy || '',
                tarih: values.tarih || '',
                saat: values.saat || '',
                duzenleyenAdsoyad: values.duzenleyen_adsoyad || '',
                duzenleyenRutbe: values.duzenleyen_rutbe || '',
                duzenleyenSicil: values.duzenleyen_sicil || '',
                content: html,
            };
            const filePath = await generatePDF(pdfData);
            if (filePath) {
                showSuccess('PDF oluşturuldu');
                router.push({
                    pathname: '/form/preview',
                    params: { filePath, title: template.title },
                });
            } else {
                showError('PDF oluşturulamadı, tekrar deneyin');
            }
        } catch {
            showError('PDF oluşturulamadı, tekrar deneyin');
        }
    };

    const handleBackPress = () => {
        const hasValues = Object.values(values).some((v) => v && v.trim());
        if (hasValues) {
            setPendingBack(true);
            setShowSaveDialog(true);
        } else {
            router.back();
        }
    };

    // Group fields by their group value
    const fieldGroups: Record<string, FormFieldType[]> = {};
    const groupLabels: Record<string, string> = {
        location: 'Yer ve Zaman',
        officer: 'Düzenleyen Bilgileri',
        subject: 'İlgili Kişi Bilgileri',
        vehicle: 'Araç Bilgileri',
        vehicle1: '1. Araç Bilgileri',
        vehicle2: '2. Araç Bilgileri',
        details: 'İşlem Detayları',
        witnesses: 'Tanık Bilgileri',
        statement: 'İfade İçeriği',
        damage: 'Hasar ve Yaralanma',
    };

    for (const field of template.fields) {
        const group = field.group || 'details';
        if (!fieldGroups[group]) fieldGroups[group] = [];
        fieldGroups[group].push(field);
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: template.title,
                    headerLeft: () => (
                        <TouchableOpacity onPress={handleBackPress} style={styles.headerBtn}>
                            <Text style={{ color: colors.textOnPrimary, fontSize: 16 }}>← Geri</Text>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <View style={styles.headerRight}>
                            {/* Favorite toggle ⭐ */}
                            <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerBtn}>
                                <Star
                                    size={22}
                                    color={isFavorite ? '#FFD700' : '#FFFFFF'}
                                    fill={isFavorite ? '#FFD700' : 'transparent'}
                                />
                            </TouchableOpacity>
                            {/* Save draft */}
                            <TouchableOpacity onPress={() => setShowSaveDialog(true)} style={styles.headerBtn}>
                                <Save size={22} color={colors.textOnPrimary} />
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {Object.entries(fieldGroups).map(([groupKey, fields]) => (
                        <View
                            key={groupKey}
                            style={[styles.section, { backgroundColor: colors.surface }]}
                        >
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: FontFamily.bold }]}>
                                {groupLabels[groupKey] || groupKey}
                            </Text>
                            {fields.map((field: FormFieldType) => (
                                <FormField
                                    key={field.id}
                                    id={field.id}
                                    label={field.label}
                                    type={
                                        field.type === 'dropdown' &&
                                            field.options?.length === 2 &&
                                            field.options.includes('Evet')
                                            ? 'checkbox'
                                            : field.type
                                    }
                                    value={values[field.id] || ''}
                                    placeholder={field.placeholder}
                                    options={field.options}
                                    required={field.required}
                                    error={errors[field.id]}
                                    onChange={(v) => handleFieldChange(field.id, v)}
                                />
                            ))}
                        </View>
                    ))}
                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Bottom sticky bar */}
                <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.bottomButton, { borderColor: colors.primary, borderWidth: 1 }]}
                        onPress={() => {
                            const formErrors = validateForm(template.fields, values);
                            if (Object.keys(formErrors).length > 0) {
                                setErrors(formErrors);
                                showError('Lütfen zorunlu alanları doldurun');
                                scrollRef.current?.scrollTo({ y: 0, animated: true });
                            } else {
                                showInfo('Form geçerli, PDF oluşturabilirsiniz');
                            }
                        }}
                    >
                        <Eye size={18} color={colors.primary} />
                        <Text style={[styles.bottomButtonText, { color: colors.primary, fontFamily: FontFamily.semibold }]}>
                            ÖNİZLE
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.bottomButton, { backgroundColor: colors.primary }]}
                        onPress={handleValidateAndGenerate}
                    >
                        <FileDown size={18} color="#FFFFFF" />
                        <Text style={[styles.bottomButtonText, { color: '#FFFFFF', fontFamily: FontFamily.semibold }]}>
                            PDF OLUŞTUR
                        </Text>
                    </TouchableOpacity>
                </View>

                <Dialog
                    visible={showSaveDialog}
                    title="Taslak Kaydet"
                    message="Formu taslak olarak kaydetmek ister misiniz?"
                    buttons={[
                        { label: 'Evet, Kaydet', variant: 'primary', onPress: handleSaveDraft },
                        {
                            label: 'Hayır, Çık',
                            variant: 'secondary',
                            onPress: () => {
                                setShowSaveDialog(false);
                                if (pendingBack) {
                                    setPendingBack(false);
                                    router.back();
                                }
                            },
                        },
                        {
                            label: 'İptal',
                            variant: 'secondary',
                            onPress: () => {
                                setShowSaveDialog(false);
                                setPendingBack(false);
                            },
                        },
                    ]}
                    onClose={() => {
                        setShowSaveDialog(false);
                        setPendingBack(false);
                    }}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerBtn: { padding: 8 },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    scrollContent: { padding: Spacing.lg },
    section: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: FontSize.subheading,
        marginBottom: Spacing.lg,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: Spacing.md,
        borderTopWidth: 1,
        gap: Spacing.sm,
    },
    bottomButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.sm,
        gap: Spacing.xs,
    },
    bottomButtonText: {
        fontSize: FontSize.small,
    },
});
