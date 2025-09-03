
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
  title?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration: number;
  persistent: boolean;
  createdAt: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class NotificationManager {
  private static instance: NotificationManager;
  private notifications: Map<string, Notification> = new Map();
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyListeners(): void {
    const notifications = Array.from(this.notifications.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    this.listeners.forEach(listener => listener(notifications));
  }

  show(
    type: NotificationType,
    message: string,
    options: NotificationOptions = {}
  ): string {
    const id = this.generateId();
    const notification: Notification = {
      id,
      type,
      message,
      title: options.title,
      duration: options.duration || (type === 'error' ? 0 : 5000), // Errors persist by default
      persistent: options.persistent || type === 'error',
      createdAt: new Date(),
      action: options.action,
    };

    this.notifications.set(id, notification);
    this.notifyListeners();

    // Auto-remove notification after duration (if not persistent)
    if (!notification.persistent && notification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, notification.duration);
    }

    return id;
  }

  success(message: string, options?: NotificationOptions): string {
    return this.show('success', message, options);
  }

  error(message: string, options?: NotificationOptions): string {
    return this.show('error', message, { ...options, persistent: true });
  }

  warning(message: string, options?: NotificationOptions): string {
    return this.show('warning', message, options);
  }

  info(message: string, options?: NotificationOptions): string {
    return this.show('info', message, options);
  }

  remove(id: string): void {
    if (this.notifications.delete(id)) {
      this.notifyListeners();
    }
  }

  clear(): void {
    this.notifications.clear();
    this.notifyListeners();
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately call with current notifications
    const notifications = Array.from(this.notifications.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    listener(notifications);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  getAll(): Notification[] {
    return Array.from(this.notifications.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const notificationService = NotificationManager.getInstance();
