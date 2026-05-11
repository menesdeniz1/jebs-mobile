import { Tabs } from 'expo-router';
import { Home, BookOpen, FileText, Star, Search } from 'lucide-react-native';
import { useTheme, FontFamily } from '../../constants/theme';

export default function TabLayout() {
    const { colors } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: colors.textOnPrimary,
                headerTitleStyle: { fontWeight: '700', fontSize: 17 },
                headerShadowVisible: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Ana Sayfa',
                    headerTitle: 'Jandarma Kolluk Kılavuzu',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="guide"
                options={{
                    title: 'Rehber',
                    headerTitle: 'Olay Rehberi',
                    tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="forms"
                options={{
                    title: 'Tutanaklar',
                    headerTitle: 'Tutanak ve Formlar',
                    tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: 'Favoriler',
                    headerTitle: 'Favorilerim',
                    tabBarIcon: ({ color, size }) => <Star size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Arama',
                    headerTitle: 'Arama',
                    tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
