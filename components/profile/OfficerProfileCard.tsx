import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { User, Save, Trash2 } from 'lucide-react-native';
import { useTheme, FontFamily, FontSize, Spacing, BorderRadius, MinTapTarget } from '../../constants/theme';
import { useOfficerProfileStore } from '../../store/officerProfileStore';
import { showSuccess, showInfo } from '../ui/Toast';

const RANK_OPTIONS = [
  'Er', 'Onbaşı', 'Çavuş', 'Uzman Çavuş',
  'Astsubay', 'Teğmen', 'Üsteğmen', 'Yüzbaşı',
  'Binbaşı', 'Yarbay', 'Albay',
];

export default function OfficerProfileCard() {
  const { colors } = useTheme();
  const profile = useOfficerProfileStore((s) => s.profile);
  const update = useOfficerProfileStore((s) => s.update);
  const clear = useOfficerProfileStore((s) => s.clear);
  const hasProfile = useOfficerProfileStore((s) => s.hasProfile);

  const [showRanks, setShowRanks] = React.useState(false);

  const handleClear = () => {
    clear();
    showInfo('Profil temizlendi');
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <User size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: FontFamily.bold }]}>
          Personel Profili
        </Text>
        {hasProfile() && (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={18} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: FontFamily.regular }]}>
        Bilgilerinizi girin — tutanaklarda otomatik doldurulacaktır
      </Text>

      {/* Ad Soyad */}
      <TextInput
        style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border, fontFamily: FontFamily.regular }]}
        value={profile.name}
        onChangeText={(v) => update({ name: v })}
        placeholder="Ad Soyad"
        placeholderTextColor={colors.textSecondary}
      />

      {/* Rütbe */}
      <TouchableOpacity
        style={[styles.input, styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}
        onPress={() => setShowRanks(!showRanks)}
      >
        <Text style={[{ color: profile.rank ? colors.textPrimary : colors.textSecondary, fontFamily: FontFamily.regular, fontSize: FontSize.body }]}>
          {profile.rank || 'Rütbe Seçiniz'}
        </Text>
      </TouchableOpacity>
      {showRanks && (
        <View style={[styles.rankList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {RANK_OPTIONS.map((rank) => (
            <TouchableOpacity
              key={rank}
              style={[styles.rankItem, { borderBottomColor: colors.divider }]}
              onPress={() => { update({ rank }); setShowRanks(false); }}
            >
              <Text style={[{ color: profile.rank === rank ? colors.primary : colors.textPrimary, fontFamily: profile.rank === rank ? FontFamily.semibold : FontFamily.regular, fontSize: FontSize.body }]}>
                {rank}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Sicil No */}
      <TextInput
        style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border, fontFamily: FontFamily.regular }]}
        value={profile.sicilNo}
        onChangeText={(v) => update({ sicilNo: v })}
        placeholder="Sicil No"
        placeholderTextColor={colors.textSecondary}
        keyboardType="numeric"
      />

      {/* Birim */}
      <TextInput
        style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border, fontFamily: FontFamily.regular }]}
        value={profile.unit}
        onChangeText={(v) => update({ unit: v })}
        placeholder="Birim (örn: Çankaya İlçe J.K.)"
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: FontSize.subheading,
  },
  hint: {
    fontSize: FontSize.small,
    marginBottom: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.body,
    marginBottom: Spacing.sm,
    minHeight: MinTapTarget,
    justifyContent: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankList: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    maxHeight: 200,
  },
  rankItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
});
