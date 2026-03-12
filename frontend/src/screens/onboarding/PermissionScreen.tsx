import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, FontSize, Spacing } from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PermissionScreenProps {
  onComplete: () => void;
}

const PERMISSION_KEY = '@cyberglimmora_permissions_asked';

export default function PermissionScreen({ onComplete }: PermissionScreenProps) {
  const [smsGranted, setSmsGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const requestSmsPermission = async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        ]);

        const allGranted =
          granted['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.RECEIVE_SMS'] === PermissionsAndroid.RESULTS.GRANTED;

        setSmsGranted(allGranted);

        if (!allGranted) {
          Alert.alert(
            'Limited Protection',
            'Without SMS access, CyberGlimmora cannot scan incoming messages for scams in real-time. You can enable this later in Settings.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // iOS doesn't support SMS reading
        setSmsGranted(false);
      }
    } catch (err) {
      console.error('Permission error:', err);
      setSmsGranted(false);
    }
    setLoading(false);
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem(PERMISSION_KEY, 'true');
    onComplete();
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(PERMISSION_KEY, 'true');
    onComplete();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark" size={48} color={Colors.white} />
        </View>
        <Text style={styles.title}>Welcome to CyberGlimmora</Text>
        <Text style={styles.subtitle}>
          To protect you from scams and threats, we need a few permissions
        </Text>
      </View>

      {/* Permission Cards */}
      <View style={styles.body}>
        {/* SMS Permission */}
        <View style={[styles.permissionCard, smsGranted === true && styles.permissionGranted]}>
          <View style={styles.permissionIcon}>
            <Ionicons
              name="chatbubble-ellipses"
              size={28}
              color={smsGranted === true ? Colors.safe : Colors.primary}
            />
          </View>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>SMS Access</Text>
            <Text style={styles.permissionDesc}>
              Scan incoming messages for phishing links, scam patterns, and fraud attempts
            </Text>
          </View>
          {smsGranted === true ? (
            <View style={styles.grantedBadge}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.safe} />
            </View>
          ) : smsGranted === false ? (
            <TouchableOpacity style={styles.retryBtn} onPress={requestSmsPermission}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.allowBtn}
              onPress={requestSmsPermission}
              disabled={loading}
            >
              <Text style={styles.allowText}>{loading ? 'Asking...' : 'Allow'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Cards (non-interactive, just informational) */}
        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Ionicons name="notifications" size={28} color={Colors.warning} />
          </View>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>Notifications</Text>
            <Text style={styles.permissionDesc}>
              Get instant alerts when threats are detected
            </Text>
          </View>
          <View style={styles.grantedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.safe} />
          </View>
        </View>

        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Ionicons name="wifi" size={28} color={Colors.info} />
          </View>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>Network Access</Text>
            <Text style={styles.permissionDesc}>
              Check URLs and links against threat databases
            </Text>
          </View>
          <View style={styles.grantedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.safe} />
          </View>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>

        <Text style={styles.privacyText}>
          Your data stays on your device. We never share your messages with anyone.
        </Text>
      </View>
    </View>
  );
}

export { PERMISSION_KEY };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  header: {
    backgroundColor: Colors.primaryDark,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Shadows.glow,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: '#A7F3D0',
    textAlign: 'center',
    lineHeight: 22,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 14,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.xl,
    padding: 16,
    ...Shadows.md,
  },
  permissionGranted: {
    borderColor: Colors.safe,
    borderWidth: 1.5,
  },
  permissionIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  permissionInfo: {
    flex: 1,
    marginRight: 10,
  },
  permissionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  permissionDesc: {
    fontSize: FontSize.sm,
    color: Colors.textMid,
    lineHeight: 18,
  },
  allowBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
  },
  allowText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
  },
  retryText: {
    color: Colors.warningDark,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  grantedBadge: {
    padding: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: BorderRadius.xl,
    width: '100%',
    gap: 8,
    ...Shadows.md,
  },
  continueText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  skipBtn: {
    marginTop: 14,
    paddingVertical: 8,
  },
  skipText: {
    color: Colors.textMid,
    fontSize: FontSize.base,
  },
  privacyText: {
    marginTop: 12,
    fontSize: FontSize.xs,
    color: Colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
