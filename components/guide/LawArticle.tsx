import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';

interface LawArticleProps {
    article: string;
    title: string;
    summary: string;
}

export default function LawArticle({ article, title, summary }: LawArticleProps) {
    const [expanded, setExpanded] = useState(false);
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
            >
                <View style={styles.headerContent}>
                    <Text style={[styles.article, { color: colors.primary, fontFamily: FontFamily.bold }]}>
                        {article}
                    </Text>
                    <Text style={[styles.title, { color: colors.textPrimary, fontFamily: FontFamily.semibold }]}>
                        {title}
                    </Text>
                </View>
                {expanded ? (
                    <ChevronUp size={20} color={colors.textSecondary} />
                ) : (
                    <ChevronDown size={20} color={colors.textSecondary} />
                )}
            </TouchableOpacity>
            {expanded && (
                <View style={[styles.body, { borderTopColor: colors.divider }]}>
                    <Text style={[styles.summary, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                        {summary}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        marginBottom: Spacing.sm,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    headerContent: {
        flex: 1,
    },
    article: {
        fontSize: FontSize.small,
        marginBottom: 2,
    },
    title: {
        fontSize: FontSize.body,
    },
    body: {
        padding: Spacing.lg,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
    },
    summary: {
        fontSize: FontSize.body,
        lineHeight: 20,
    },
});
