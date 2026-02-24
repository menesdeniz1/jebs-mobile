import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '../lib/store';
import { Colors } from '../constants/theme';

export default function RootLayout() {
    const loadPersistedData = useAppStore((s) => s.loadPersistedData);

    useEffect(() => {
        loadPersistedData();
    }, []);

    return (
        <>
            <StatusBar style="light" backgroundColor={Colors.primary} />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: Colors.primary },
                    headerTintColor: Colors.textLight,
                    headerTitleStyle: { fontWeight: '600', fontSize: 17 },
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: Colors.background },
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
                    name="search"
                    options={{
                        title: 'Arama',
                        presentation: 'modal',
                    }}
                />
            </Stack>
        </>
    );
}
