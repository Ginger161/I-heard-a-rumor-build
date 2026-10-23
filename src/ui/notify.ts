import { useSyncExternalStore } from 'react';
import { ONESIGNAL_APP_ID } from '../config';
import { getSettings, updateSettings } from './settings';

// REMINDERS. A real "remind everyone to play" needs a push service, because a web page cannot wake a phone by itself.
// This uses OneSignal (free tier, web push, works for installed apps on Android, desktop and iPhone 16.4+). Until you add
// your OneSignal App ID (docs/LAUNCH.md), the game shows "coming soon" and loads nothing from outside. Players opt in
// themselves; the third-party script is only loaded after they do.
//
// The game also tells OneSignal a few facts (daily streak, whether today's case is done, last day played) so you can
// send smart messages from the OneSignal dashboard: "Your 6-day streak ends tonight".
type OneSignalApi = {
  init: (o: Record<string, unknown>) => Promise<void>;
  Notifications: { requestPermission: () => Promise<void>; permission: boolean };
  User: { PushSubscription: { optIn: () => Promise<void>; optOut: () => Promise<void>; optedIn: boolean }; addTags: (t: Record<string, string>) => void };
};
declare global { interface Window { OneSignalDeferred?: Array<(os: OneSignalApi) => void | Promise<void>> } }

export type ReminderStatus = 'unsupported' | 'soon' | 'off' | 'blocked' | 'on';

const supported = (): boolean => typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
export const remindersConfigured = (): boolean => !!ONESIGNAL_APP_ID;

export const reminderStatus = (): ReminderStatus => {
  if (!supported()) return 'unsupported';
  if (!remindersConfigured()) return 'soon';
  if (Notification.permission === 'denied') return 'blocked';
  return getSettings().reminders && Notification.permission === 'granted' ? 'on' : 'off';
};

let loading: Promise<void> | null = null;
const loadSdk = (): Promise<void> => {
  if (loading) return loading;
  loading = new Promise<void>(resolve => {
    window.OneSignalDeferred = window.OneSignalDeferred ?? [];
    window.OneSignalDeferred.push(async os => {
      try {
        await os.init({
          appId: ONESIGNAL_APP_ID, serviceWorkerPath: 'push/OneSignalSDKWorker.js', serviceWorkerParam: { scope: '/push/' },
          allowLocalhostAsSecureOrigin: true, notifyButton: { enable: false }
        });
      } catch { /* the SDK failed to start: reminders stay off */ }
      resolve();
    });
    const s = document.createElement('script');
    s.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    s.defer = true;
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
  return loading;
};

const withSdk = (fn: (os: OneSignalApi) => void | Promise<void>): Promise<void> =>
  new Promise(resolve => { window.OneSignalDeferred = window.OneSignalDeferred ?? []; window.OneSignalDeferred.push(async os => { try { await fn(os); } catch { /* ignore */ } resolve(); }); });

// Called at start-up: if the player already opted in, reconnect so tags can sync.
export const initReminders = async (): Promise<void> => {
  if (!supported() || !remindersConfigured() || !getSettings().reminders) return;
  await loadSdk();
};

export const enableReminders = async (): Promise<ReminderStatus> => {
  if (!supported() || !remindersConfigured()) return reminderStatus();
  await loadSdk();
  await withSdk(async os => { await os.Notifications.requestPermission(); await os.User.PushSubscription.optIn(); });
  const granted = Notification.permission === 'granted';
  updateSettings({ reminders: granted });
  return reminderStatus();
};

export const disableReminders = async (): Promise<void> => {
  updateSettings({ reminders: false });
  if (supported() && remindersConfigured()) { await loadSdk(); await withSdk(async os => { await os.User.PushSubscription.optOut(); }); }
};

// Facts for smart messages. Only sent when the player opted in.
export const syncReminderTags = (tags: Record<string, string>) => {
  if (!getSettings().reminders || !remindersConfigured() || !supported()) return;
  void withSdk(os => { os.User.addTags(tags); });
};

// Badge on the installed app's icon: a dot while today's Daily Case is waiting.
export const setAppBadge = (n: number) => {
  try {
    const nav = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
    if (n > 0) void nav.setAppBadge?.(n); else void nav.clearAppBadge?.();
  } catch { /* badges unsupported */ }
};

// React binding (the status can change when settings change)
export const useReminderStatus = (): ReminderStatus => {
  const sub = (l: () => void) => { window.addEventListener('rumor-reminders', l); return () => window.removeEventListener('rumor-reminders', l); };
  return useSyncExternalStore(sub, reminderStatus, () => 'off');
};
export const notifyRemindersChanged = () => { try { window.dispatchEvent(new Event('rumor-reminders')); } catch { /* no window */ } };
