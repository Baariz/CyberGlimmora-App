export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'high':
    case 'critical':
    case 'danger':
    case 'compromised':
      return '#EF4444';
    case 'medium':
    case 'warning':
    case 'at_risk':
    case 'caution':
      return '#F59E0B';
    case 'low':
    case 'info':
    case 'moderate':
      return '#3B82F6';
    case 'safe':
    case 'secure':
      return '#22C55E';
    default:
      return '#6B7280';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#22C55E';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Low Risk';
  if (score >= 60) return 'Moderate';
  if (score >= 40) return 'At Risk';
  return 'High Risk';
}
