import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react-native';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import type { Step, InstructionStep, QuestionStep, TerminalStep } from '../../data/types';

interface DecisionTreeWalkerProps {
    steps: Step[];
    /** If true, shows a [TASLAK] expert-review banner at top */
    isDraft?: boolean;
}

/**
 * DecisionTreeWalker renders a mixed step list:
 * - InstructionStep → checkbox (checkable)
 * - QuestionStep → branch buttons (user picks a path)
 * - TerminalStep → outcome card
 *
 * The walker progresses linearly through instruction steps until it
 * encounters a QuestionStep, at which point the user must choose a
 * branch. The chosen branch's `next_order` jumps to that step.
 */
export default function DecisionTreeWalker({ steps, isDraft }: DecisionTreeWalkerProps) {
    const { colors } = useTheme();

    // Build a lookup by order for O(1) navigation
    const stepsByOrder = new Map<number, Step>();
    for (const s of steps) {
        stepsByOrder.set(s.order, s);
    }

    // Track the currently visible step's order. Start at the lowest order.
    const minOrder = Math.min(...steps.map((s) => s.order));
    const [currentOrder, setCurrentOrder] = useState(minOrder);
    const [checkedOrders, setCheckedOrders] = useState<Set<number>>(new Set());
    const [history, setHistory] = useState<number[]>([]);

    const currentStep = stepsByOrder.get(currentOrder);

    const goToNext = (nextOrder: number) => {
        setHistory((prev) => [...prev, currentOrder]);
        setCurrentOrder(nextOrder);
    };

    const goBack = () => {
        if (history.length > 0) {
            const prev = history[history.length - 1];
            setHistory((h) => h.slice(0, -1));
            setCurrentOrder(prev);
        }
    };

    const resetAll = () => {
        setCurrentOrder(minOrder);
        setCheckedOrders(new Set());
        setHistory([]);
    };

    const toggleCheck = (order: number) => {
        setCheckedOrders((prev) => {
            const next = new Set(prev);
            if (next.has(order)) {
                next.delete(order);
            } else {
                next.add(order);
            }
            return next;
        });
    };

    // Find the next order after the current instruction step
    const getNextInSequence = (afterOrder: number): number | null => {
        const sorted = steps.map((s) => s.order).sort((a, b) => a - b);
        const idx = sorted.indexOf(afterOrder);
        return idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;
    };

    if (!currentStep) {
        return (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: FontFamily.regular }]}>
                    Adım bulunamadı (order: {currentOrder})
                </Text>
            </View>
        );
    }

    const outcomeLabels: Record<string, string> = {
        close_file: 'Dosya Kapatılır',
        continue_investigation: 'Soruşturma Devam Eder',
        refer_to_prosecutor: 'Savcılığa Sevk',
    };

    const outcomeColors: Record<string, string> = {
        close_file: '#2E7D32',
        continue_investigation: '#1565C0',
        refer_to_prosecutor: '#E65100',
    };

    const renderStep = () => {
        switch (currentStep.type) {
            case 'instruction': {
                const s = currentStep as InstructionStep;
                const isChecked = checkedOrders.has(s.order);
                const nextOrder = getNextInSequence(s.order);
                return (
                    <View>
                        <TouchableOpacity
                            style={[
                                styles.instructionCard,
                                {
                                    backgroundColor: colors.surface,
                                    borderLeftColor: s.is_critical ? colors.accent : colors.primary,
                                    opacity: isChecked ? 0.7 : 1,
                                },
                            ]}
                            onPress={() => toggleCheck(s.order)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.stepHeader}>
                                <View style={[styles.orderBadge, { backgroundColor: s.is_critical ? colors.accent : colors.primary }]}>
                                    <Text style={[styles.orderText, { fontFamily: FontFamily.bold }]}>{s.order}</Text>
                                </View>
                                {s.is_critical && (
                                    <View style={styles.criticalBadge}>
                                        <AlertTriangle size={14} color={colors.accent} />
                                        <Text style={[styles.criticalText, { color: colors.accent, fontFamily: FontFamily.semibold }]}>
                                            KRİTİK
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text
                                style={[
                                    styles.stepText,
                                    {
                                        color: colors.textPrimary,
                                        fontFamily: FontFamily.regular,
                                        textDecorationLine: isChecked ? 'line-through' : 'none',
                                    },
                                ]}
                            >
                                {s.text}
                            </Text>
                        </TouchableOpacity>
                        {nextOrder !== null && (
                            <TouchableOpacity
                                style={[styles.nextButton, { backgroundColor: colors.primary }]}
                                onPress={() => goToNext(nextOrder)}
                            >
                                <Text style={[styles.nextButtonText, { fontFamily: FontFamily.semibold }]}>
                                    Sonraki Adım
                                </Text>
                                <ArrowRight size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                );
            }

            case 'question': {
                const s = currentStep as QuestionStep;
                return (
                    <View style={[styles.questionCard, { backgroundColor: colors.surface, borderLeftColor: '#FFA000' }]}>
                        <View style={styles.stepHeader}>
                            <View style={[styles.orderBadge, { backgroundColor: '#FFA000' }]}>
                                <Text style={[styles.orderText, { fontFamily: FontFamily.bold }]}>?</Text>
                            </View>
                            <Text style={[styles.questionLabel, { color: '#FFA000', fontFamily: FontFamily.semibold }]}>
                                KARAR NOKTASI
                            </Text>
                        </View>
                        <Text style={[styles.stepText, { color: colors.textPrimary, fontFamily: FontFamily.semibold }]}>
                            {s.text}
                        </Text>
                        <View style={styles.branchContainer}>
                            {s.branches.map((branch, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.branchButton, { backgroundColor: colors.primary }]}
                                    onPress={() => goToNext(branch.next_order)}
                                >
                                    <Text style={[styles.branchButtonText, { fontFamily: FontFamily.semibold }]}>
                                        {branch.label}
                                    </Text>
                                    <ArrowRight size={16} color="#FFFFFF" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );
            }

            case 'terminal': {
                const s = currentStep as TerminalStep;
                const outcomeColor = outcomeColors[s.outcome] || colors.primary;
                return (
                    <View style={[styles.terminalCard, { backgroundColor: colors.surface, borderLeftColor: outcomeColor }]}>
                        <View style={styles.stepHeader}>
                            <CheckCircle size={24} color={outcomeColor} />
                            <Text style={[styles.terminalLabel, { color: outcomeColor, fontFamily: FontFamily.bold }]}>
                                {outcomeLabels[s.outcome] || s.outcome}
                            </Text>
                        </View>
                        <Text style={[styles.stepText, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                            {s.text}
                        </Text>
                    </View>
                );
            }
        }
    };

    return (
        <View>
            {/* Expert review banner for draft content */}
            {isDraft && (
                <View style={styles.draftBanner}>
                    <AlertTriangle size={16} color="#B71C1C" />
                    <Text style={[styles.draftBannerText, { fontFamily: FontFamily.semibold }]}>
                        [TASLAK] Bu karar ağacı uzman incelemesine tabi değildir. İçerik doğrulanmalıdır.
                    </Text>
                </View>
            )}

            {/* Progress indicator */}
            <Text style={[styles.progressText, { color: colors.textSecondary, fontFamily: FontFamily.regular }]}>
                Adım {currentOrder} / {steps.length} • Tamamlanan: {checkedOrders.size}
            </Text>

            {/* Current step */}
            {renderStep()}

            {/* Navigation buttons */}
            <View style={styles.navRow}>
                {history.length > 0 && (
                    <TouchableOpacity
                        style={[styles.navButton, { borderColor: colors.border }]}
                        onPress={goBack}
                    >
                        <Text style={[styles.navButtonText, { color: colors.textSecondary, fontFamily: FontFamily.semibold }]}>
                            ← Geri
                        </Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.navButton, { borderColor: colors.accent }]}
                    onPress={resetAll}
                >
                    <RotateCcw size={16} color={colors.accent} />
                    <Text style={[styles.navButtonText, { color: colors.accent, fontFamily: FontFamily.semibold }]}>
                        Başa Dön
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    draftBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        padding: Spacing.md,
        borderRadius: BorderRadius.sm,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    draftBannerText: {
        flex: 1,
        color: '#B71C1C',
        fontSize: FontSize.small,
    },
    progressText: {
        fontSize: FontSize.small,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    instructionCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderLeftWidth: 4,
        marginBottom: Spacing.sm,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    questionCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderLeftWidth: 4,
        marginBottom: Spacing.sm,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    terminalCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderLeftWidth: 4,
        marginBottom: Spacing.sm,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        gap: Spacing.sm,
    },
    orderBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderText: {
        color: '#FFFFFF',
        fontSize: FontSize.small,
    },
    criticalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    criticalText: {
        fontSize: FontSize.small,
    },
    questionLabel: {
        fontSize: FontSize.small,
    },
    terminalLabel: {
        fontSize: FontSize.subheading,
    },
    stepText: {
        fontSize: FontSize.body,
        lineHeight: 22,
    },
    branchContainer: {
        marginTop: Spacing.md,
        gap: Spacing.sm,
    },
    branchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderRadius: BorderRadius.sm,
    },
    branchButtonText: {
        color: '#FFFFFF',
        fontSize: FontSize.body,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.sm,
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: FontSize.body,
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.lg,
        gap: Spacing.md,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        gap: Spacing.xs,
    },
    navButtonText: {
        fontSize: FontSize.body,
    },
    emptyCard: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: FontSize.body,
    },
});
