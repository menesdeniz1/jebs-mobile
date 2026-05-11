import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    useFonts,
    NotoSans_400Regular,
    NotoSans_600SemiBold,
    NotoSans_700Bold,
} from '@expo-google-fonts/noto-sans';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../components/ui/Toast';
import { useFavoritesStore } from '../store/favoritesStore';
import { useDraftsStore } from '../store/draftsStore';
import { useSearchStore } from '../store/searchStore';
import { useTheme } from '../constants/theme';
import { cleanupPDFTempFiles } from '../lib/cleanup';
import DisclaimerGate from './disclaimer';

export default function RootLayout() {
    const { colors, isDark } = useTheme();
    const loadFavorites = useFavoritesStore((s) => s.load);
    const loadDrafts = useDraftsStore((s) => s.load);
    const loadSearch = useSearchStore((s) => s.load);

    const [fontsLoaded] = useFonts({
        'NotoSans-Regular': NotoSans_400Regular,
        'NotoSans-SemiBold': NotoSans_600SemiBold,
        'NotoSans-Bold': NotoSans_700Bold,
    });

    useEffect(() => {
        loadFavorites();
        loadDrafts();
        loadSearch();
        cleanupPDFTempFiles();
    }, []);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <DisclaimerGate>
            <StatusBar style={isDark ? 'light' : 'light'} backgroundColor={colors.primary} />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: colors.primary },
                    headerTintColor: colors.textOnPrimary,
                    headerTitleStyle: { fontWeight: '600', fontSize: 17 },
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="guide/[categoryId]"
                    options={{ title: 'Kategori' }}
                />
                <Stack.Screen
                    name="guide/event/[eventId]"
                    options={{ title: 'Olay Detayı' }}
                />
                <Stack.Screen
                    name="form/[templateId]"
                    options={{ title: 'Form Doldur' }}
                />
                <Stack.Screen
                    name="form/preview"
                    options={{ title: 'PDF Önizleme', presentation: 'modal' }}
                />
            </Stack>
            <Toast config={toastConfig} />
        </DisclaimerGate>
    );
}
