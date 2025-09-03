
import { useState, useEffect } from 'react';
import { notificationService } from '../services/notification.service';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  return {
    notifications,
    showSuccess: notificationService.success.bind(notificationService),
    showError: notificationService.error.bind(notificationService),
    showWarning: notificationService.warning.bind(notificationService),
    showInfo: notificationService.info.bind(notificationService),
    remove: notificationService.remove.bind(notificationService),
    clear: notificationService.clear.bind(notificationService),
  };
};
