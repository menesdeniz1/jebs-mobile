import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckSquare, Square } from 'lucide-react-native';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';

interface Step {
    order: number;
    text: string;
    is_critical: boolean;
}

interface StepChecklistProps {
    steps: Step[];
    checkedState: boolean[];
    onToggle: (index: number) => void;
    onReset: () => void;
}

export default function StepChecklist({ steps, checkedState, onToggle, onReset }: StepChecklistProps) {
    const { colors } = useTheme();

    return (
        <View>
            {steps.map((step, index) => {
                const isChecked = checkedState[index] || false;
                return (
                    <TouchableOpacity
                        key={step.order}
                        style={[
                            styles.step,
                            {
                                backgroundColor: colors.surface,
                                borderLeftColor: step.is_critical ? colors.accent : colors.border,
                                opacity: isChecked ? 0.6 : 1,
                            },
                        ]}
                        onPress={() => onToggle(index)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.checkbox}>
                            {isChecked ? (
                                <CheckSquare size={22} color={colors.success} />
                            ) : (
                                <Square size={22} color={colors.textSecondary} />
                            )}
                        </View>
                        <Text
                            style={[
                                styles.number,
                                { color: step.is_critical ? colors.accent : colors.primary, fontFamily: FontFamily.bold },
                            ]}
                        >
                            {step.order}.
                        </Text>
                        <Text
                            style={[
                                styles.text,
                                {
                                    color: colors.textPrimary,
                                    fontFamily: FontFamily.regular,
                                    textDecorationLine: isChecked ? 'line-through' : 'none',
                                },
                            ]}
                        >
                            {step.text}
                        </Text>
                    </TouchableOpacity>
                );
            })}
            <TouchableOpacity
                style={[styles.resetButton, { borderColor: colors.accent }]}
                onPress={onReset}
            >
                <Text style={[styles.resetText, { color: colors.accent, fontFamily: FontFamily.semibold }]}>
                    Tümünü Sıfırla
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    step: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: Spacing.md,
        borderRadius: BorderRadius.sm,
        borderLeftWidth: 4,
        marginBottom: Spacing.sm,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    checkbox: {
        marginRight: Spacing.sm,
        marginTop: 1,
    },
    number: {
        fontSize: FontSize.subheading,
        marginRight: Spacing.sm,
        minWidth: 24,
    },
    text: {
        fontSize: FontSize.body,
        flex: 1,
        lineHeight: 20,
    },
    resetButton: {
        marginTop: Spacing.lg,
        padding: Spacing.md,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        alignItems: 'center',
    },
    resetText: {
        fontSize: FontSize.body,
    },
});
