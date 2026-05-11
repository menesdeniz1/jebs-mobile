import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';

interface ListCardProps {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    borderColor?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
}

export default function ListCard({
    icon,
    title,
    subtitle,
    borderColor,
    onPress,
    rightElement,
}: ListCardProps) {
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: colors.surface,
                    borderLeftColor: borderColor || colors.primary,
                    shadowColor: colors.cardShadow,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <View style={styles.content}>
                <Text
                    style={[
                        styles.title,
                        { color: colors.textPrimary, fontFamily: FontFamily.semibold },
                    ]}
                    numberOfLines={2}
                >
                    {title}
                </Text>
                {subtitle ? (
                    <Text
                        style={[
                            styles.subtitle,
                            { color: colors.textSecondary, fontFamily: FontFamily.regular },
                        ]}
                        numberOfLines={1}
                    >
                        {subtitle}
                    </Text>
                ) : null}
            </View>
            {rightElement || (
                <ChevronRight size={20} color={colors.textSecondary} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderLeftWidth: 4,
        marginBottom: Spacing.sm,
        elevation: 1,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    iconContainer: {
        marginRight: Spacing.md,
    },
    content: {
        flex: 1,
        marginRight: Spacing.sm,
    },
    title: {
        fontSize: FontSize.subheading,
    },
    subtitle: {
        fontSize: FontSize.small,
        marginTop: 2,
    },
});
