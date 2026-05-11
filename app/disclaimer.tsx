import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius } from '../constants/theme';

const DISCLAIMER_KEY = '@gendarme:disclaimer_accepted:v1';

interface DisclaimerGateProps {
  children: React.ReactNode;
}

export const disclaimerText = `Bu uygulama resmi değildir, Jandarma Genel Komutanlığı tarafından onaylanmamıştır.

Bu uygulama bağımsız olarak geliştirilmiş olup, herhangi bir resmi kurum veya kuruluş ile bağlantısı bulunmamaktadır. Uygulama içeriği yalnızca bilgilendirme amaçlıdır.

Önemli Uyarılar:
• İçerikler yürürlükteki mevzuata göre doğrulanmalıdır
• Uygulama hukuki danışmanlık yerine geçmez
• Oluşturulan PDF belgeler taslak niteliğindedir ve resmi kayıt değildir
• Tüm veriler yalnızca cihazınızda saklanır, hiçbir sunucuya gönderilmez
• Kişisel verileriniz cihazınız dışına çıkmaz

Bu uygulamayı kullanarak yukarıdaki koşulları kabul etmiş sayılırsınız.`;

export default function DisclaimerGate({ children }: DisclaimerGateProps) {
  const { colors } = useTheme();
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(DISCLAIMER_KEY).then((val) => {
      setAccepted(val === 'true');
    }).catch(() => {
      setAccepted(false);
    });
  }, []);

  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
      setAccepted(true);
    } catch {
      // Even if storage fails, let the user proceed this session
      setAccepted(true);
    }
  };

  // Loading state
  if (accepted === null) {
    return null;
  }

  // Already accepted — render children
  if (accepted) {
    return <>{children}</>;
  }

  // Show disclaimer modal
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.icon]}>⚠️</Text>
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: FontFamily.bold }]}>
          Yasal Uyarı
        </Text>
      </View>

      <ScrollView
        style={[styles.scrollArea, { backgroundColor: colors.surface, borderColor: colors.border }]}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.disclaimerText, { color: colors.textPrimary, fontFamily: FontFamily.regular }]}>
          {disclaimerText}
        </Text>
      </ScrollView>

      <TouchableOpacity
        style={[styles.acceptButton, { backgroundColor: colors.primary }]}
        onPress={handleAccept}
        activeOpacity={0.8}
      >
        <Text style={[styles.acceptButtonText, { fontFamily: FontFamily.bold }]}>
          Anladım, devam et
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
    maxHeight: '60%' as unknown as number,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  disclaimerText: {
    fontSize: FontSize.body,
    lineHeight: 24,
  },
  acceptButton: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.subheading,
  },
});
