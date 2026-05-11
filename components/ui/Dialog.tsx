import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';

interface DialogButton {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}

interface DialogProps {
    visible: boolean;
    title: string;
    message?: string;
    buttons: DialogButton[];
    onClose: () => void;
}

export default function Dialog({ visible, title, message, buttons, onClose }: DialogProps) {
    const { colors } = useTheme();

    const getButtonColor = (variant?: string) => {
        switch (variant) {
            case 'danger': return colors.accent;
            case 'secondary': return colors.textSecondary;
            default: return colors.primary;
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.title, { color: colors.textPrimary, fontFamily: FontFamily.bold }]}>
                        {title}
                    </Text>
                    {message ? (
                        <Text style={[styles.message, { color: colors.textSecondary, fontFamily: FontFamily.regular }]}>
                            {message}
                        </Text>
                    ) : null}
                    <View style={styles.buttonRow}>
                        {buttons.map((btn, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[
                                    styles.button,
                                    btn.variant === 'primary' || (!btn.variant && i === 0)
                                        ? { backgroundColor: getButtonColor(btn.variant || 'primary') }
                                        : { borderWidth: 1, borderColor: getButtonColor(btn.variant) },
                                ]}
                                onPress={btn.onPress}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        {
                                            color: btn.variant === 'primary' || (!btn.variant && i === 0)
                                                ? '#FFFFFF'
                                                : getButtonColor(btn.variant),
                                            fontFamily: FontFamily.semibold,
                                        },
                                    ]}
                                >
                                    {btn.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    dialog: {
        width: '100%',
        maxWidth: 340,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xxl,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    title: {
        fontSize: FontSize.heading,
        marginBottom: Spacing.sm,
    },
    message: {
        fontSize: FontSize.body,
        lineHeight: 20,
        marginBottom: Spacing.xl,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: Spacing.sm,
    },
    button: {
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.sm,
        minWidth: 80,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: FontSize.body,
    },
});
