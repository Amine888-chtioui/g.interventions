import axiosInstance from './axiosInstance';

const API_BASE = 'http://localhost:8080';

export const getNotifications = () => axiosInstance.get('/api/notifications');

export const markNotificationRead = (id) => axiosInstance.put(`/api/notifications/${id}/lue`);

export const markAllNotificationsRead = () => axiosInstance.put('/api/notifications/lues');

export const deleteAllNotifications = () => axiosInstance.delete('/api/notifications');

/**
 * Ouvre un flux SSE authentifié (fetch + lecture manuelle) vers /api/notifications/stream.
 * EventSource natif ne permet pas d'envoyer l'en-tête Authorization, on lit donc le flux à la main.
 * Se reconnecte automatiquement en cas de coupure. Retourne une fonction pour se désabonner.
 */
export function subscribeToNotifications(onNotification) {
  let cancelled = false;
  let abortController = null;
  let retryTimer = null;

  async function connect() {
    const token = localStorage.getItem('token');
    if (!token || cancelled) return;

    abortController = new AbortController();

    try {
      const response = await fetch(`${API_BASE}/api/notifications/stream`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Connexion au flux de notifications impossible');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!cancelled) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sepIndex;
        while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + 2);
          const dataLine = rawEvent.split('\n').find((line) => line.startsWith('data:'));
          if (dataLine) {
            try {
              onNotification(JSON.parse(dataLine.slice(5).trim()));
            } catch {
              // évènement non-JSON (heartbeat), on ignore
            }
          }
        }
      }
    } catch {
      // connexion perdue : on retentera ci-dessous si toujours abonné
    }

    if (!cancelled) {
      retryTimer = setTimeout(connect, 4000);
    }
  }

  connect();

  return function unsubscribe() {
    cancelled = true;
    if (retryTimer) clearTimeout(retryTimer);
    if (abortController) abortController.abort();
  };
}
