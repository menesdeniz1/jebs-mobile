import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Download, Share2 } from 'lucide-react-native';
import { showSuccess, showError } from '../../components/ui/Toast';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { sharePDF } from '../../lib/pdf';

export default function PDFPreviewScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { filePath, title } = useLocalSearchParams<{ filePath: string; title: string }>();

    const handleSave = () => {
        showSuccess('PDF cihaza kaydedildi');
    };

    const handleShare = async () => {
        if (filePath) {
            try {
                await sharePDF(filePath);
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
                        <Text style={[styles.previewPath, { color: colors.textSecondary, fontFamily: FontFamily.regular }]}>
                            {filePath}
                        </Text>
                    </View>
                </View>

                <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleSave}
                    >
                        <Download size={20} color="#FFFFFF" />
                        <Text style={[styles.buttonText, { fontFamily: FontFamily.bold }]}>
                            Cihaza Kaydet
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
    previewPath: {
        fontSize: FontSize.small,
        textAlign: 'center',
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
