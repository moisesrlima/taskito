// Browser Notification API wrapper with fallback handling

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return Notification.permission || 'default';
  }
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export function sendBrowserNotification(
  title: string,
  options: {
    body?: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    data?: unknown;
    onClick?: () => void;
  } = {}
): Notification | null {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(title, {
      body: options.body,
      icon: options.icon || 'https://api.iconify.design/lucide:alarm-clock.svg?color=%23f59e0b',
      tag: options.tag || 'taskito-reminder',
      requireInteraction: options.requireInteraction ?? true, // Keep notification on screen until user dismisses/clicks
      badge: options.icon,
      data: options.data,
    });

    if (options.onClick) {
      notification.onclick = () => {
        window.focus();
        options.onClick?.();
        notification.close();
      };
    }

    return notification;
  } catch (e) {
    console.warn('Could not trigger Notification API:', e);
    return null;
  }
}
