import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { HeaderActions } from '@/components/HeaderActions';
import { useTheme } from '@/hooks/use-theme';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: theme === 'dark' ? '#94a3b8' : '#64748b',
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
        },
        headerStyle: {
          backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
        },
        headerTintColor: theme === 'dark' ? '#e2e8f0' : '#1e293b',
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontSize: 10 },
        headerRight: () => <HeaderActions />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: 'Receitas',
          tabBarIcon: ({ color }) => <Ionicons name="wallet" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Despesas',
          tabBarIcon: ({ color }) => <Ionicons name="cash" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="investments"
        options={{
          title: 'Investir',
          tabBarIcon: ({ color }) => <Ionicons name="trending-up" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Pagamentos',
          tabBarIcon: ({ color }) => <Ionicons name="card" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
