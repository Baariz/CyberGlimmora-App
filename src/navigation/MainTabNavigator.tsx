import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAlerts } from '../contexts/AlertContext';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  DashboardTab: { active: 'grid', inactive: 'grid-outline' },
  ScamTab: { active: 'shield-checkmark', inactive: 'shield-checkmark-outline' },
  AssistantTab: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  GuardianTab: { active: 'people', inactive: 'people-outline' },
  MoreTab: { active: 'ellipsis-horizontal-circle', inactive: 'ellipsis-horizontal-outline' },
};

const TAB_LABELS: Record<string, string> = {
  DashboardTab: 'Dashboard',
  ScamTab: 'Scam Shield',
  AssistantTab: 'Assistant',
  GuardianTab: 'Guardian',
  MoreTab: 'More',
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.floatingBar, { bottom: bottomOffset }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const icons = TAB_ICONS[route.name] || { active: 'ellipse', inactive: 'ellipse-outline' };
        const label = TAB_LABELS[route.name] || route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabItem}
          >
            <View style={[styles.tabIconWrap, isFocused && styles.tabIconWrapActive]}>
              <Ionicons
                name={isFocused ? icons.active : icons.inactive}
                size={22}
                color={isFocused ? Colors.primary : Colors.textLight}
              />
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

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
  const { activeCount } = useAlerts();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
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
        options={{ title: 'Scam Shield', headerTitle: 'Scam Detection' }}
      />
      <Tab.Screen
        name="AssistantTab"
        component={AssistantScreen}
        options={{ title: 'Assistant', headerTitle: 'AI Assistant' }}
      />
      <Tab.Screen
        name="GuardianTab"
        component={GuardianScreen}
        options={{ title: 'Guardian', headerTitle: 'Child Guardian' }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreNavigator}
        options={{ title: 'More', headerShown: false }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  floatingBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 4,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border + '40',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIconWrap: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: Colors.primary + '15',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textLight,
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.primary,
  },
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
    paddingBottom: 100,
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
