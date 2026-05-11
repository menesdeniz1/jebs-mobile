import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { FileText, X } from 'lucide-react-native';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';

interface FormSheetProps {
    visible: boolean;
    formTitle: string;
    formDescription?: string;
    onFill: () => void;
    onClose: () => void;
}

export default function FormSheet({ visible, formTitle, formDescription, onFill, onClose }: FormSheetProps) {
    const { colors } = useTheme();

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
                    <View style={styles.handle} />
                    <View style={styles.header}>
                        <FileText size={24} color={colors.primary} />
                        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: FontFamily.bold }]}>
                            {formTitle}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    {formDescription ? (
                        <Text style={[styles.description, { color: colors.textSecondary, fontFamily: FontFamily.regular }]}>
                            {formDescription}
                        </Text>
                    ) : null}
                    <TouchableOpacity
                        style={[styles.fillButton, { backgroundColor: colors.primary }]}
                        onPress={onFill}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.fillButtonText, { fontFamily: FontFamily.bold }]}>
                            Formu Doldur
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.xxl,
        paddingBottom: Spacing.xxxl + 10,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CCC',
        alignSelf: 'center',
        marginBottom: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSize.heading,
        flex: 1,
    },
    description: {
        fontSize: FontSize.body,
        lineHeight: 20,
        marginBottom: Spacing.xl,
    },
    fillButton: {
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    fillButtonText: {
        color: '#FFFFFF',
        fontSize: FontSize.subheading,
    },
});
