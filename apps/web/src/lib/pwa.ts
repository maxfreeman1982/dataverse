/**
 * PWA utility functions for service worker registration and app installation
 */

let deferredPrompt: any = null;
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      serviceWorkerRegistration = registration;

      console.log('[PWA] Service Worker registered:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New service worker available');
              // Notify user about update
              showUpdateNotification();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('[PWA] Service Workers not supported');
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const success = await registration.unregister();
      console.log('[PWA] Service Worker unregistered:', success);
      return success;
    } catch (error) {
      console.error('[PWA] Service Worker unregistration failed:', error);
      return false;
    }
  }
  return false;
}

/**
 * Update service worker
 */
export async function updateServiceWorker(): Promise<void> {
  if (serviceWorkerRegistration) {
    try {
      await serviceWorkerRegistration.update();
      console.log('[PWA] Service Worker updated');
    } catch (error) {
      console.error('[PWA] Service Worker update failed:', error);
    }
  }
}

/**
 * Skip waiting and activate new service worker
 */
export function skipWaitingAndActivate(): void {
  if (serviceWorkerRegistration?.waiting) {
    serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
}

/**
 * Show update notification to user
 */
function showUpdateNotification(): void {
  // You can implement this with your notification system
  console.log('[PWA] New version available. Please refresh.');

  // Example: Show banner or toast
  const shouldUpdate = confirm(
    'Une nouvelle version est disponible. Voulez-vous mettre à jour maintenant ?'
  );

  if (shouldUpdate) {
    skipWaitingAndActivate();
  }
}

/**
 * Listen for beforeinstallprompt event
 */
export function setupInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('[PWA] Install prompt ready');

    // Show custom install button
    showInstallButton();
  });

  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredPrompt = null;
    hideInstallButton();
  });
}

/**
 * Show install button
 */
function showInstallButton(): void {
  const installButton = document.getElementById('pwa-install-button');
  if (installButton) {
    installButton.style.display = 'block';
  }

  // Dispatch custom event for React components
  window.dispatchEvent(new CustomEvent('pwa-install-available'));
}

/**
 * Hide install button
 */
function hideInstallButton(): void {
  const installButton = document.getElementById('pwa-install-button');
  if (installButton) {
    installButton.style.display = 'none';
  }

  // Dispatch custom event for React components
  window.dispatchEvent(new CustomEvent('pwa-install-completed'));
}

/**
 * Prompt user to install app
 */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    console.warn('[PWA] Install prompt not available');
    return false;
  }

  try {
    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User ${outcome} the install prompt`);

    // Clear the deferred prompt
    deferredPrompt = null;

    return outcome === 'accepted';
  } catch (error) {
    console.error('[PWA] Install prompt failed:', error);
    return false;
  }
}

/**
 * Check if app is installed
 */
export function isAppInstalled(): boolean {
  // Check if running in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // Check iOS Safari
  if ((navigator as any).standalone) {
    return true;
  }

  return false;
}

/**
 * Check if app can be installed
 */
export function canInstall(): boolean {
  return deferredPrompt !== null;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if ('Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      console.log('[PWA] Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('[PWA] Notification permission request failed:', error);
      return 'denied';
    }
  }
  return 'denied';
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!serviceWorkerRegistration) {
    console.error('[PWA] Service Worker not registered');
    return null;
  }

  try {
    // Request notification permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('[PWA] Notification permission not granted');
      return null;
    }

    // Get public VAPID key from environment
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

    // Subscribe to push notifications
    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log('[PWA] Push subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('[PWA] Push subscription failed:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!serviceWorkerRegistration) {
    return false;
  }

  try {
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (subscription) {
      const success = await subscription.unsubscribe();
      console.log('[PWA] Push unsubscribed:', success);
      return success;
    }
    return false;
  } catch (error) {
    console.error('[PWA] Push unsubscription failed:', error);
    return false;
  }
}

/**
 * Check online status
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function setupOnlineStatusListener(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  const handleOnline = () => {
    console.log('[PWA] Online');
    onOnline();
  };

  const handleOffline = () => {
    console.log('[PWA] Offline');
    onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      console.log('[PWA] All caches cleared');
    } catch (error) {
      console.error('[PWA] Cache clear failed:', error);
    }
  }
}

/**
 * Get cache size
 */
export async function getCacheSize(): Promise<number> {
  if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch (error) {
      console.error('[PWA] Failed to get cache size:', error);
      return 0;
    }
  }
  return 0;
}

/**
 * Convert VAPID key for push subscription
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Share content using Web Share API
 */
export async function shareContent(data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  if ('share' in navigator) {
    try {
      await navigator.share(data);
      console.log('[PWA] Content shared successfully');
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('[PWA] Share failed:', error);
      }
      return false;
    }
  }
  return false;
}

/**
 * Check if Web Share API is available
 */
export function canShare(): boolean {
  return 'share' in navigator;
}
