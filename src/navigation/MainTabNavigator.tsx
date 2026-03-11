import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAlerts } from '../contexts/AlertContext';
import { View, Text, StyleSheet } from 'react-native';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ScamDetectionScreen from '../screens/scam/ScamDetectionScreen';
import AssistantScreen from '../screens/assistant/AssistantScreen';
import GuardianScreen from '../screens/guardian/GuardianScreen';
import IdentityScreen from '../screens/identity/IdentityScreen';
import RiskScoreScreen from '../screens/risk/RiskScoreScreen';
import DeviceScreen from '../screens/device/DeviceScreen';
import JourneyScreen from '../screens/journey/JourneyScreen';
import DigitalTwinScreen from '../screens/digital-twin/DigitalTwinScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

export type MainTabParamList = {
  DashboardTab: undefined;
  ScamTab: undefined;
  AssistantTab: undefined;
  GuardianTab: undefined;
  MoreTab: undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  Identity: undefined;
  RiskScore: undefined;
  Device: undefined;
  Journey: undefined;
  DigitalTwin: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

function MoreMenuScreen({ navigation }: any) {
  const menuItems = [
    { key: 'Identity', label: 'Identity Protection', icon: 'finger-print-outline' as const, color: Colors.info },
    { key: 'RiskScore', label: 'Risk Score', icon: 'speedometer-outline' as const, color: Colors.warning },
    { key: 'Device', label: 'Device Security', icon: 'phone-portrait-outline' as const, color: Colors.primaryMid },
    { key: 'Journey', label: 'Ride Safety', icon: 'navigate-outline' as const, color: Colors.primary },
    { key: 'DigitalTwin', label: 'Digital Twin', icon: 'layers-outline' as const, color: Colors.infoDark },
    { key: 'Settings', label: 'Settings', icon: 'settings-outline' as const, color: Colors.textMid },
  ];

  return (
    <View style={styles.moreContainer}>
      <Text style={styles.moreTitle}>More Modules</Text>
      {menuItems.map((item) => (
        <React.Fragment key={item.key}>
          <View
            style={styles.moreItem}
            onTouchEnd={() => navigation.navigate(item.key)}
          >
            <View style={[styles.moreIconBox, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.moreLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

function MoreNavigator() {
  return (
    <MoreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.navbarBg },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} options={{ title: 'More' }} />
      <MoreStack.Screen name="Identity" component={IdentityScreen} options={{ title: 'Identity Protection' }} />
      <MoreStack.Screen name="RiskScore" component={RiskScoreScreen} options={{ title: 'Risk Score' }} />
      <MoreStack.Screen name="Device" component={DeviceScreen} options={{ title: 'Device Security' }} />
      <MoreStack.Screen name="Journey" component={JourneyScreen} options={{ title: 'Ride Safety' }} />
      <MoreStack.Screen name="DigitalTwin" component={DigitalTwinScreen} options={{ title: 'Digital Twin' }} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </MoreStack.Navigator>
  );
}

export default function MainTabNavigator() {
  const { activeCount, threatLevel } = useAlerts();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: Colors.navbarBg },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
          headerTitle: 'CyberGlimmora',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
              <View>
                <Ionicons name="notifications-outline" size={22} color={Colors.white} />
                {activeCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{activeCount}</Text>
                  </View>
                )}
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ScamTab"
        component={ScamDetectionScreen}
        options={{
          title: 'Scam Shield',
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark-outline" size={size} color={color} />,
          headerTitle: 'Scam Detection',
        }}
      />
      <Tab.Screen
        name="AssistantTab"
        component={AssistantScreen}
        options={{
          title: 'Assistant',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />,
          headerTitle: 'AI Assistant',
        }}
      />
      <Tab.Screen
        name="GuardianTab"
        component={GuardianScreen}
        options={{
          title: 'Guardian',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
          headerTitle: 'Child Guardian',
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreNavigator}
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal-outline" size={size} color={color} />,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  moreContainer: {
    flex: 1,
    backgroundColor: Colors.pageBg,
    padding: 16,
  },
  moreTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  moreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moreIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  moreLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
