import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Download, Share2, CheckCircle } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { showSuccess, showError, showInfo } from '../../components/ui/Toast';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { sharePDF } from '../../lib/pdf';

export default function PDFPreviewScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { filePath, title } = useLocalSearchParams<{ filePath: string; title: string }>();
    const [savedPath, setSavedPath] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!filePath) {
            showError('PDF dosyası bulunamadı');
            return;
        }

        // Web platform — expo-file-system doesn't support document directory
        if (Platform.OS === 'web') {
            showInfo('Web sürümünde Paylaş butonunu kullanın');
            return;
        }

        setSaving(true);
        try {
            // Create a persistent directory for saved PDFs
            const saveDir = `${FileSystem.documentDirectory}pdfs/`;
            const dirInfo = await FileSystem.getInfoAsync(saveDir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(saveDir, { intermediates: true });
            }

            // Generate a filename from title + timestamp
            const safeTitle = (title || 'tutanak')
                .replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ0-9\s]/g, '')
                .replace(/\s+/g, '_')
                .substring(0, 40);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
            const filename = `${safeTitle}_${timestamp}.pdf`;
            const destPath = `${saveDir}${filename}`;

            await FileSystem.copyAsync({ from: filePath, to: destPath });

            // Verify the file was actually written
            const savedInfo = await FileSystem.getInfoAsync(destPath);
            if (!savedInfo.exists) {
                throw new Error('File copy verification failed');
            }

            setSavedPath(destPath);
            showSuccess('PDF cihaza kaydedildi');
        } catch (error) {
            console.error('PDF save failed:', error);
            showError('PDF kaydedilemedi, lütfen tekrar deneyin');
        } finally {
            setSaving(false);
        }
    };

    const handleShare = async () => {
        // Prefer the saved copy if available, else use temp file
        const shareUri = savedPath || filePath;
        if (shareUri) {
            try {
                await sharePDF(shareUri);
            } catch {
                showError('Paylaşım başarısız oldu');
            }
        }
    };

    return (
        <>
            <Stack.Screen options={{ title: title || 'PDF Önizleme' }} />
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.previewArea}>
                    <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.previewTitle, { color: colors.primary, fontFamily: FontFamily.bold }]}>
                            ✅ PDF Başarıyla Oluşturuldu
                        </Text>
                        <Text style={[styles.previewText, { color: colors.textSecondary, fontFamily: FontFamily.regular }]}>
                            {title}
                        </Text>
                        {savedPath && (
                            <View style={styles.savedBadge}>
                                <CheckCircle size={16} color="#2E7D32" />
                                <Text style={[styles.savedText, { fontFamily: FontFamily.semibold }]}>
                                    Cihaza kaydedildi
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: savedPath ? '#2E7D32' : colors.primary },
                            saving && { opacity: 0.6 },
                        ]}
                        onPress={handleSave}
                        disabled={saving || !!savedPath}
                    >
                        {savedPath ? (
                            <CheckCircle size={20} color="#FFFFFF" />
                        ) : (
                            <Download size={20} color="#FFFFFF" />
                        )}
                        <Text style={[styles.buttonText, { fontFamily: FontFamily.bold }]}>
                            {saving ? 'Kaydediliyor...' : savedPath ? 'Kaydedildi ✓' : 'Cihaza Kaydet'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primaryLight }]}
                        onPress={handleShare}
                    >
                        <Share2 size={20} color="#FFFFFF" />
                        <Text style={[styles.buttonText, { fontFamily: FontFamily.bold }]}>
                            Paylaş
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    previewArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    previewCard: {
        padding: Spacing.xxl,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    previewTitle: {
        fontSize: FontSize.heading,
        marginBottom: Spacing.md,
    },
    previewText: {
        fontSize: FontSize.subheading,
        marginBottom: Spacing.sm,
    },
    savedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.md,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        backgroundColor: '#E8F5E9',
        borderRadius: BorderRadius.sm,
        gap: Spacing.xs,
    },
    savedText: {
        color: '#2E7D32',
        fontSize: FontSize.small,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: Spacing.lg,
        borderTopWidth: 1,
        gap: Spacing.md,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: FontSize.subheading,
    },
});
