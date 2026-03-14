import { create } from "zustand";
import {
  getWithAuth,
  putWithAuth,
  deleteWithAuth,
} from "@/service/httpService";

interface Notification {
  _id: string;
  type:
    | "appointment_booked"
    | "appointment_confirmed"
    | "appointment_cancelled"
    | "appointment_completed"
    | "new_prescription";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  appointmentId?: string;
  relatedUserName?: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getWithAuth<{
        notifications: Notification[];
        unreadCount: number;
      }>("/notification");

      if (response.success) {
        set({
          notifications: response.data.notifications || [],
          unreadCount: response.data.unreadCount || 0,
          loading: false,
        });
      } else {
        set({ error: response.message, loading: false });
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch notifications",
        loading: false,
      });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const response = await putWithAuth(
        `/notification/${notificationId}/read`,
        {},
      );

      if (response.success) {
        const notifications = get().notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif,
        );

        const unreadCount = notifications.filter((n) => !n.isRead).length;

        set({ notifications, unreadCount });
      }
    } catch (error: any) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await putWithAuth("/notification/mark-all-read", {});

      if (response.success) {
        const notifications = get().notifications.map((notif) => ({
          ...notif,
          isRead: true,
        }));

        set({ notifications, unreadCount: 0 });
      }
    } catch (error: any) {
      console.error("Failed to mark all notifications as read:", error);
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      const response = await deleteWithAuth(`/notification/${notificationId}`);
      if (response.success) {
        const notifications = get().notifications.filter(
          (n) => n._id !== notificationId,
        );
        set({ notifications });
      }
    } catch (error: any) {
      console.error("Failed to delete notification:", error);
    }
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
