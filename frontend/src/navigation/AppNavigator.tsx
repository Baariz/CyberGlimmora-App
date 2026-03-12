import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../screens/auth/LoginScreen';
import PermissionScreen, { PERMISSION_KEY } from '../screens/onboarding/PermissionScreen';
import MainTabNavigator from './MainTabNavigator';

export type RootStackParamList = {
  Permissions: undefined;
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [permissionsAsked, setPermissionsAsked] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(PERMISSION_KEY).then((value) => {
      setPermissionsAsked(value === 'true');
    });
  }, []);

  if (isLoading || permissionsAsked === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.pageBg }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!permissionsAsked ? (
          <Stack.Screen name="Permissions">
            {() => <PermissionScreen onComplete={() => setPermissionsAsked(true)} />}
          </Stack.Screen>
        ) : isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
