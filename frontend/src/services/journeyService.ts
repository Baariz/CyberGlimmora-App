import type { TrustedContact, JourneyData, JourneyHistory, SOSConfig } from '../types';

export async function getTrustedContacts(): Promise<TrustedContact[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 'tc_1', name: 'Priya Mehta', phone: '+91 98765 43211', email: 'priya.mehta@gmail.com', relationship: 'Spouse', avatar: '', isEmergency: true, notifyOnJourney: true },
    { id: 'tc_2', name: 'Raj Mehta', phone: '+91 98765 43212', email: 'raj.mehta@gmail.com', relationship: 'Brother', avatar: '', isEmergency: true, notifyOnJourney: true },
    { id: 'tc_3', name: 'Sneha Patel', phone: '+91 98765 43213', email: 'sneha.p@gmail.com', relationship: 'Friend', avatar: '', isEmergency: false, notifyOnJourney: true },
    { id: 'tc_4', name: 'Vikram Singh', phone: '+91 98765 43214', email: 'vikram.s@gmail.com', relationship: 'Colleague', avatar: '', isEmergency: false, notifyOnJourney: false },
  ];
}

export async function getActiveJourney(): Promise<JourneyData | null> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return {
    id: 'j_001', userId: 'usr_001', status: 'active',
    origin: { lat: 19.082, lng: 72.871, address: 'Lake Homes, Powai' },
    destination: { lat: 19.017, lng: 72.856, address: 'BKC Business Hub, Bandra' },
    currentPosition: { lat: 19.058, lng: 72.863 },
    routeCoordinates: [
      { lat: 19.082, lng: 72.871 }, { lat: 19.070, lng: 72.868 },
      { lat: 19.058, lng: 72.863 }, { lat: 19.040, lng: 72.858 },
      { lat: 19.017, lng: 72.856 },
    ],
    startTime: new Date(Date.now() - 1200000).toISOString(),
    estimatedArrival: new Date(Date.now() + 1800000).toISOString(),
    endTime: null,
    trustedContactIds: ['tc_1', 'tc_2'],
    alerts: [],
  };
}

export async function getJourneyHistory(): Promise<JourneyHistory[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 'jh_1', origin: 'Powai', destination: 'BKC', date: new Date(Date.now() - 86400000).toISOString(), duration: '45 min', status: 'completed', distance: '12.3 km' },
    { id: 'jh_2', origin: 'Powai', destination: 'Andheri Station', date: new Date(Date.now() - 172800000).toISOString(), duration: '22 min', status: 'completed', distance: '5.8 km' },
    { id: 'jh_3', origin: 'BKC', destination: 'Powai', date: new Date(Date.now() - 259200000).toISOString(), duration: '50 min', status: 'completed', distance: '13.1 km' },
    { id: 'jh_4', origin: 'Powai', destination: 'Airport T2', date: new Date(Date.now() - 604800000).toISOString(), duration: '35 min', status: 'completed', distance: '8.5 km' },
    { id: 'jh_5', origin: 'Powai', destination: 'Juhu Beach', date: new Date(Date.now() - 864000000).toISOString(), duration: '40 min', status: 'deviated', distance: '14.2 km' },
  ];
}

export async function getSOSConfig(): Promise<SOSConfig> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    enabled: true,
    silentMode: false,
    autoEscalate: true,
    escalationMinutes: 5,
    messageTemplate: 'I need help! This is an emergency. My live location is being shared.',
    includeLocation: true,
    includeDeviceInfo: true,
  };
}
