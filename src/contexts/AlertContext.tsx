import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ScamAlert } from '../types';

interface AlertContextType {
  alerts: ScamAlert[];
  activeCount: number;
  threatLevel: 'critical' | 'elevated' | 'normal';
  isLoading: boolean;
  markAsRead: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
}

const AlertContext = createContext<AlertContextType>({
  alerts: [],
  activeCount: 0,
  threatLevel: 'normal',
  isLoading: true,
  markAsRead: () => {},
  dismissAlert: () => {},
});

const MOCK_ALERTS: ScamAlert[] = [
  {
    id: 'alert_001',
    title: 'SBI OTP Fraud Detected',
    description: 'A message claiming to be from SBI is requesting your OTP. This is a known phishing pattern.',
    severity: 'high',
    type: 'bank_sms',
    time: new Date(Date.now() - 1800000).toISOString(),
    source: 'SMS Scanner',
    action: 'Block sender and report to SBI',
    isRead: false,
  },
  {
    id: 'alert_002',
    title: 'Suspicious UPI Collect Request',
    description: 'A collect request from an unknown merchant "REWARD_CASHBACK" was detected on your UPI.',
    severity: 'high',
    type: 'upi',
    time: new Date(Date.now() - 3600000).toISOString(),
    source: 'UPI Monitor',
    action: 'Decline the collect request immediately',
    isRead: false,
  },
  {
    id: 'alert_003',
    title: 'KYC Phishing Link',
    description: 'An email with a fake Paytm KYC update link was intercepted.',
    severity: 'medium',
    type: 'kyc',
    time: new Date(Date.now() - 7200000).toISOString(),
    source: 'Email Scanner',
    action: 'Delete the email and update KYC only through official app',
    isRead: false,
  },
  {
    id: 'alert_004',
    title: 'Courier Delivery Scam',
    description: 'A fake India Post tracking SMS with a malicious link was blocked.',
    severity: 'medium',
    type: 'courier',
    time: new Date(Date.now() - 14400000).toISOString(),
    source: 'SMS Scanner',
    action: 'Track parcels only on official India Post website',
    isRead: true,
  },
  {
    id: 'alert_005',
    title: 'Crypto Investment Scam',
    description: 'A WhatsApp message promising 10x returns on crypto was flagged as a known investment scam.',
    severity: 'low',
    type: 'crypto',
    time: new Date(Date.now() - 28800000).toISOString(),
    source: 'WhatsApp Scanner',
    action: 'Block the contact and report',
    isRead: true,
  },
  {
    id: 'alert_006',
    title: 'Promotional Email - Safe',
    description: 'An email from Amazon about seasonal sale was verified as legitimate.',
    severity: 'safe',
    type: 'other',
    time: new Date(Date.now() - 43200000).toISOString(),
    source: 'Email Scanner',
    action: 'No action needed',
    isRead: true,
  },
];

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setAlerts(MOCK_ALERTS);
      setIsLoading(false);
    }, 500);
  }, []);

  const activeCount = alerts.filter((a) => !a.isRead).length;

  const threatLevel: 'critical' | 'elevated' | 'normal' = (() => {
    const unread = alerts.filter((a) => !a.isRead);
    const highCount = unread.filter((a) => a.severity === 'high').length;
    if (highCount >= 2) return 'critical';
    if (highCount >= 1 || unread.length >= 3) return 'elevated';
    return 'normal';
  })();

  function markAsRead(alertId: string) {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)));
  }

  function dismissAlert(alertId: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }

  return (
    <AlertContext.Provider value={{ alerts, activeCount, threatLevel, isLoading, markAsRead, dismissAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  return useContext(AlertContext);
}
