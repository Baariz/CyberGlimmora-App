// Auth Types
export type UserRole = 'individual' | 'family';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  plan: 'basic' | 'family';
  joinedDate: string;
  devicesCount: number;
  familyMembers: number;
  twoFactorEnabled: boolean;
  lastLogin: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RolePermissions {
  canAccessScamDetection: boolean;
  canAccessIdentity: boolean;
  canAccessAssistant: boolean;
  canAccessRiskScore: boolean;
  canAccessDevice: boolean;
  canAccessGuardian: boolean;
  canAccessJourney: boolean;
  canAccessSettings: boolean;
}

// User Types
export type SubscriptionPlan = 'basic' | 'family';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  plan: SubscriptionPlan;
  joinedDate: string;
  devicesCount: number;
  familyMembers: number;
  twoFactorEnabled: boolean;
  lastLogin: string;
}

export interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  category: 'security' | 'scam' | 'identity' | 'guardian' | 'device';
}

export interface ConnectedAccount {
  id: string;
  provider: string;
  email: string;
  connected: boolean;
  lastSync: string;
  icon: string;
}

export interface SecuritySetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  type: 'toggle' | 'action';
}

// Scam Types
export type ScamSeverity = 'high' | 'medium' | 'low' | 'safe';
export type ScamType = 'upi' | 'kyc' | 'aadhaar' | 'bank_sms' | 'courier' | 'job' | 'crypto' | 'phishing' | 'lottery' | 'investment' | 'romance' | 'other';

export interface ScamAlert {
  id: string;
  title: string;
  description: string;
  severity: ScamSeverity;
  type: ScamType;
  time: string;
  source: string;
  action: string;
  isRead: boolean;
}

export interface ScamAnalysisResult {
  riskLevel: ScamSeverity;
  confidence: number;
  explanation: string;
  scamType: ScamType;
  recommendations: string[];
  indicators: string[];
}

export interface ScamResponse {
  id: string;
  query: string;
  result: ScamAnalysisResult;
}

export interface CommunityScam {
  id: string;
  title: string;
  description: string;
  type: ScamType;
  region: string;
  reportedBy: string;
  reportedAt: string;
  verifiedCount: number;
  severity: ScamSeverity;
}

export interface IndiaScam {
  id: string;
  title: string;
  description: string;
  type: ScamType;
  example: string;
  howToIdentify: string[];
  whatToDo: string[];
  severity: ScamSeverity;
  reportCount: number;
}

export interface ScamQuizQuestion {
  id: string;
  message: string;
  sender: string;
  isScam: boolean;
  explanation: string;
  scamType?: ScamType;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Device Types
export type DeviceHealthStatus = 'secure' | 'at_risk' | 'compromised';
export type PermissionRisk = 'safe' | 'caution' | 'dangerous';
export type NetworkRisk = 'secure' | 'moderate' | 'unsafe';
export type MessageSource = 'sms' | 'gmail' | 'whatsapp' | 'telegram';

export interface DeviceStatus {
  id: string;
  deviceName: string;
  osVersion: string;
  lastScan: string;
  healthStatus: DeviceHealthStatus;
  healthScore: number;
  malwareDetected: number;
  suspiciousApps: number;
  osUpToDate: boolean;
  screenLockEnabled: boolean;
  encryptionEnabled: boolean;
  rootDetected: boolean;
}

export interface AppPermission {
  id: string;
  appName: string;
  appIcon: string;
  permissions: string[];
  riskLevel: PermissionRisk;
  lastAccessed: string;
  recommendation: string;
  isRevoked: boolean;
}

export interface NetworkStatus {
  id: string;
  networkName: string;
  type: 'wifi' | 'cellular' | 'vpn';
  riskLevel: NetworkRisk;
  encryption: string;
  issues: string[];
  recommendation: string;
  connectedSince: string;
}

export interface PrivacyAccessLog {
  id: string;
  appName: string;
  accessType: 'camera' | 'microphone' | 'location';
  timestamp: string;
  duration: string;
  suspicious: boolean;
}

export interface ScamMessage {
  id: string;
  source: MessageSource;
  sender: string;
  subject?: string;
  preview: string;
  detectedAt: string;
  severity: 'high' | 'medium' | 'low';
  scamType: string;
  confidence: number;
  isRead: boolean;
}

// Identity Types
export type ExposureLevel = 'critical' | 'high' | 'medium' | 'low' | 'safe';

export interface IdentityTwin {
  userId: string;
  exposureLevel: ExposureLevel;
  exposureScore: number;
  monitoredEmails: string[];
  monitoredPhones: string[];
  monitoredUsernames: string[];
  lastScanDate: string;
  totalBreaches: number;
  dataPointsExposed: number;
  impersonationAlerts: number;
}

export interface BreachRecord {
  id: string;
  serviceName: string;
  breachDate: string;
  discoveredDate: string;
  dataExposed: string[];
  severity: ExposureLevel;
  affectedAccounts: number;
  recoverySteps: string[];
  isResolved: boolean;
}

export interface ExposureDataPoint {
  month: string;
  breaches: number;
  dataPoints: number;
}

export interface RecoveryStep {
  id: string;
  title: string;
  description: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  completed: boolean;
  relatedBreach: string;
}

// Risk Types
export type RiskLevel = 'high' | 'medium' | 'low' | 'safe';

export interface RiskScore {
  overall: number;
  maxScore: number;
  level: RiskLevel;
  lastUpdated: string;
  factors: RiskFactor[];
  history: RiskHistoryEntry[];
}

export interface RiskFactor {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  impact: 'high' | 'medium' | 'low';
  description: string;
  action: string;
  category: string;
}

export interface RiskHistoryEntry {
  date: string;
  score: number;
}

export interface ImprovementAction {
  id: string;
  title: string;
  description: string;
  impact: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  category: string;
}

// Guardian Types
export type ZoneType = 'safe' | 'danger';
export type ChildAlertType = 'cyberbullying' | 'predator' | 'scam' | 'content' | 'breach' | 'location' | 'device';

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  deviceName: string;
  batteryLevel: number;
  isOnline: boolean;
  lastSeen: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  screenTimeToday: number;
  alertCount: number;
}

export interface SafeZone {
  id: string;
  name: string;
  type: ZoneType;
  center: { lat: number; lng: number };
  radius: number;
  address: string;
  isActive: boolean;
  childIds: string[];
}

export interface ChildAlert {
  id: string;
  childId: string;
  childName: string;
  type: ChildAlertType;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  isRead: boolean;
  action: string;
}

export interface DeviceTheftStatus {
  simLockEnabled: boolean;
  remoteLockEnabled: boolean;
  remoteWipeEnabled: boolean;
  thiefSelfieEnabled: boolean;
  lastThiefSelfie: string | null;
  encryptionActive: boolean;
}

export interface ScreenTimeEntry {
  app: string;
  category: string;
  minutes: number;
  icon: string;
}

export interface DailyScreenTime {
  day: string;
  totalMinutes: number;
  apps: ScreenTimeEntry[];
}

// Journey Types
export type JourneyStatus = 'active' | 'completed' | 'sos' | 'deviated';

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  avatar: string;
  isEmergency: boolean;
  notifyOnJourney: boolean;
}

export interface JourneyData {
  id: string;
  userId: string;
  status: JourneyStatus;
  origin: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  currentPosition: { lat: number; lng: number };
  routeCoordinates: Array<{ lat: number; lng: number }>;
  startTime: string;
  estimatedArrival: string;
  endTime: string | null;
  trustedContactIds: string[];
  alerts: JourneyAlert[];
}

export interface JourneyAlert {
  id: string;
  type: 'route_deviation' | 'long_stop' | 'speed_anomaly' | 'sos' | 'arrival';
  message: string;
  timestamp: string;
  location: { lat: number; lng: number };
  acknowledged: boolean;
}

export interface JourneyHistory {
  id: string;
  origin: string;
  destination: string;
  date: string;
  duration: string;
  status: JourneyStatus;
  distance: string;
}

export interface SOSConfig {
  enabled: boolean;
  silentMode: boolean;
  autoEscalate: boolean;
  escalationMinutes: number;
  messageTemplate: string;
  includeLocation: boolean;
  includeDeviceInfo: boolean;
}

// Digital Twin Types
export type DeviceType = 'mobile' | 'laptop' | 'tablet';
export type ThreatCategory = 'device' | 'identity' | 'financial' | 'behavior';

export interface TwinStatus {
  syncedAt: string;
  healthScore: number;
  activePredictions: number;
  simulationVersion: string;
  devicesMonitored: number;
}

export interface ThreatTrend {
  day: number;
  probability: number;
}

export interface SimulatedImpact {
  dataAtRisk: string[];
  accountsExposed: number;
  financialLoss: { min: number; max: number };
}

export interface ThreatDetail {
  probability: number;
  prediction: string;
  timeToImpact: string;
  impact: SimulatedImpact;
  prevention: string[];
  trend: ThreatTrend[];
}

export interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  risk: RiskLevel;
}

export interface DeviceTwin {
  id: string;
  type: DeviceType;
  name: string;
  os: string;
  overallRisk: RiskLevel;
  lastScan: string;
  threats: Record<ThreatCategory, ThreatDetail>;
  hotspots: Hotspot[];
}

export interface TwinPrediction {
  id: string;
  deviceId: string;
  category: ThreatCategory;
  title: string;
  probability: number;
  timeToImpact: string;
  confidence: number;
  riskLevel: RiskLevel;
  explanation: string;
  moduleLink: string;
}

export interface TimelineMarker {
  day: number;
  deviceId: string;
  category: ThreatCategory;
  label: string;
  riskLevel: RiskLevel;
}

// AI Assistant Types
export interface AIResponse {
  message: string;
  isEmergency: boolean;
  suggestedActions?: string[];
}
