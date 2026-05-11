import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, FontFamily, FontSize, Spacing } from '../../constants/theme';

interface SectionHeaderProps {
    emoji?: string;
    title: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function SectionHeader({ emoji, title, actionLabel, onAction }: SectionHeaderProps) {
    const { colors } = useTheme();
    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: FontFamily.bold }]}>
                {emoji ? `${emoji} ` : ''}{title}
            </Text>
            {actionLabel && onAction ? (
                <TouchableOpacity onPress={onAction}>
                    <Text style={[styles.action, { color: colors.primary, fontFamily: FontFamily.semibold }]}>
                        {actionLabel} →
                    </Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        marginTop: Spacing.xl,
    },
    title: {
        fontSize: FontSize.heading,
    },
    action: {
        fontSize: FontSize.body,
    },
});
