import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ScrollView, Platform } from 'react-native';
import { Phone, AlertTriangle, Shield, Heart, HelpCircle } from 'lucide-react-native';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius, MinTapTarget } from '../../constants/theme';

interface ContactItem {
    name: string;
    number: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

export default function EmergencyContactsSheet() {
    const { colors } = useTheme();

    const contacts: ContactItem[] = [
        {
            name: 'Acil Yardım',
            number: '112',
            description: 'Ambulans, İtfaiye, Polis',
            icon: <AlertTriangle size={24} color="#D32F2F" />,
            color: '#D32F2F',
        },
        {
            name: 'Jandarma İmdat',
            number: '156',
            description: 'Jandarma Genel Komutanlığı',
            icon: <Shield size={24} color="#1B5E20" />,
            color: '#1B5E20',
        },
        {
            name: 'Polis İmdat',
            number: '155',
            description: 'Emniyet Genel Müdürlüğü',
            icon: <Shield size={24} color="#1565C0" />,
            color: '#1565C0',
        },
        {
            name: 'Sağlık Danışma',
            number: '182',
            description: 'Sağlık Bakanlığı ALO 182',
            icon: <Heart size={24} color="#C62828" />,
            color: '#C62828',
        },
        {
            name: 'AMATEM',
            number: '191',
            description: 'Alkol ve Madde Bağımlılığı Tedavi',
            icon: <HelpCircle size={24} color="#4527A0" />,
            color: '#4527A0',
        },
        {
            name: 'Kadın Destek',
            number: '183',
            description: 'Aile ve Sosyal Hizmetler ALO 183',
            icon: <Heart size={24} color="#AD1457" />,
            color: '#AD1457',
        },
        {
            name: 'Çocuk Destek',
            number: '183',
            description: 'Çocuk istismarı ve ihmali ihbar',
            icon: <Heart size={24} color="#E65100" />,
            color: '#E65100',
        },
    ];

    const handleCall = (number: string) => {
        const url = Platform.OS === 'web' ? `tel:${number}` : `tel:${number}`;
        Linking.openURL(url).catch(() => {
            // Silently fail on web / simulator
        });
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
        >
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <AlertTriangle size={28} color="#D32F2F" />
                <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: FontFamily.bold }]}>
                    Acil İletişim Numaraları
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary, fontFamily: FontFamily.regular }]}>
                    Numaraya dokunarak doğrudan arayabilirsiniz
                </Text>
            </View>

            {contacts.map((contact, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.contactCard,
                        {
                            backgroundColor: colors.surface,
                            borderLeftColor: contact.color,
                        },
                    ]}
                    onPress={() => handleCall(contact.number)}
                    activeOpacity={0.7}
                >
                    <View style={styles.contactIcon}>{contact.icon}</View>
                    <View style={styles.contactInfo}>
                        <Text style={[styles.contactName, { color: colors.textPrimary, fontFamily: FontFamily.bold }]}>
                            {contact.name}
                        </Text>
                        <Text style={[styles.contactDesc, { color: colors.textSecondary, fontFamily: FontFamily.regular }]}>
                            {contact.description}
                        </Text>
                    </View>
                    <View style={[styles.numberBadge, { backgroundColor: contact.color }]}>
                        <Phone size={14} color="#FFFFFF" />
                        <Text style={[styles.numberText, { fontFamily: FontFamily.bold }]}>
                            {contact.number}
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: Spacing.lg },
    header: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    headerTitle: {
        fontSize: FontSize.heading,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: FontSize.body,
        textAlign: 'center',
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderLeftWidth: 4,
        marginBottom: Spacing.sm,
        minHeight: MinTapTarget,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    contactIcon: {
        marginRight: Spacing.md,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: FontSize.subheading,
    },
    contactDesc: {
        fontSize: FontSize.small,
        marginTop: 2,
    },
    numberBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
    },
    numberText: {
        color: '#FFFFFF',
        fontSize: FontSize.subheading,
    },
});
