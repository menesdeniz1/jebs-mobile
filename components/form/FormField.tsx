import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius } from '../../constants/theme';

interface FormFieldProps {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'date' | 'time' | 'dropdown' | 'checkbox' | 'number';
    value: string;
    placeholder?: string;
    options?: string[];
    required?: boolean;
    error?: string;
    onChange: (value: string) => void;
}

export default function FormField({
    id,
    label,
    type,
    value,
    placeholder,
    options,
    required,
    error,
    onChange,
}: FormFieldProps) {
    const { colors } = useTheme();
    const [showDropdown, setShowDropdown] = React.useState(false);

    const inputStyle = [
        styles.input,
        {
            backgroundColor: colors.surface,
            color: colors.textPrimary,
            borderColor: error ? colors.accent : colors.border,
            fontFamily: FontFamily.regular,
        },
    ];

    // Auto-uppercase for plate fields
    const handleChange = (text: string) => {
        if (id === 'plaka' || id.includes('plaka')) {
            onChange(text.toUpperCase());
        } else {
            onChange(text);
        }
    };

    const renderField = () => {
        switch (type) {
            case 'textarea':
                return (
                    <TextInput
                        style={[...inputStyle, styles.textarea]}
                        value={value}
                        onChangeText={handleChange}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={id.includes('ifade') ? 8 : 4}
                        textAlignVertical="top"
                    />
                );

            case 'date':
                return (
                    <TextInput
                        style={inputStyle}
                        value={value}
                        onChangeText={onChange}
                        placeholder="GG.AA.YYYY"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        maxLength={10}
                    />
                );

            case 'time':
                return (
                    <TextInput
                        style={inputStyle}
                        value={value}
                        onChangeText={onChange}
                        placeholder="SS:DD"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        maxLength={5}
                    />
                );

            case 'dropdown':
                return (
                    <View>
                        <TouchableOpacity
                            style={[inputStyle, styles.dropdown]}
                            onPress={() => setShowDropdown(!showDropdown)}
                        >
                            <Text
                                style={[
                                    styles.dropdownText,
                                    {
                                        color: value ? colors.textPrimary : colors.textSecondary,
                                        fontFamily: FontFamily.regular,
                                    },
                                ]}
                            >
                                {value || placeholder || 'Seçiniz...'}
                            </Text>
                            <ChevronDown size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                        {showDropdown && options && (
                            <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                {options.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.dropdownItem,
                                            { borderBottomColor: colors.divider },
                                            value === option && { backgroundColor: colors.primary + '15' },
                                        ]}
                                        onPress={() => {
                                            onChange(option);
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.dropdownItemText,
                                                {
                                                    color: value === option ? colors.primary : colors.textPrimary,
                                                    fontFamily: value === option ? FontFamily.semibold : FontFamily.regular,
                                                },
                                            ]}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                );

            case 'checkbox':
                return (
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => onChange(value === 'Evet' ? 'Hayır' : 'Evet')}
                    >
                        <View
                            style={[
                                styles.checkboxBox,
                                {
                                    borderColor: value === 'Evet' ? colors.primary : colors.border,
                                    backgroundColor: value === 'Evet' ? colors.primary : 'transparent',
                                },
                            ]}
                        >
                            {value === 'Evet' && (
                                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                            )}
                        </View>
                        <Text style={[styles.checkboxLabel, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );

            case 'number':
                return (
                    <TextInput
                        style={inputStyle}
                        value={value}
                        onChangeText={onChange}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        autoCapitalize="none"
                    />
                );

            default:
                return (
                    <TextInput
                        style={inputStyle}
                        value={value}
                        onChangeText={handleChange}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textSecondary}
                        keyboardType={
                            id.includes('tc') || id.includes('sicil') || id.includes('kimlik')
                                ? 'numeric'
                                : 'default'
                        }
                        maxLength={id.includes('tc') || id.includes('kimlik') ? 11 : undefined}
                        autoCapitalize={id === 'plaka' || id.includes('plaka') ? 'characters' : 'sentences'}
                    />
                );
        }
    };

    return (
        <View style={styles.container}>
            {type !== 'checkbox' && (
                <Text style={[styles.label, { color: colors.textPrimary, fontFamily: FontFamily.semibold }]}>
                    {label}
                    {required && <Text style={{ color: colors.accent }}> *</Text>}
                </Text>
            )}
            {renderField()}
            {error ? (
                <Text style={[styles.error, { color: colors.accent, fontFamily: FontFamily.regular }]}>
                    {error}
                </Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSize.body,
        marginBottom: Spacing.xs + 2,
    },
    input: {
        borderWidth: 1,
        borderRadius: BorderRadius.sm,
        padding: Spacing.md,
        fontSize: FontSize.body,
    },
    textarea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownText: {
        fontSize: FontSize.body,
        flex: 1,
    },
    dropdownList: {
        borderWidth: 1,
        borderRadius: BorderRadius.sm,
        marginTop: 4,
        maxHeight: 200,
    },
    dropdownItem: {
        padding: Spacing.md,
        borderBottomWidth: 1,
    },
    dropdownItemText: {
        fontSize: FontSize.body,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    checkboxBox: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    checkboxLabel: {
        fontSize: FontSize.body,
        flex: 1,
    },
    error: {
        fontSize: FontSize.small,
        marginTop: 4,
    },
});
