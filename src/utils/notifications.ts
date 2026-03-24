export type NotificationType = "info" | "success" | "warning" | "error";

export type AppNotification = {
  id: string;
  title: string;
  message?: string;
  type: NotificationType;
  timeoutMs?: number;
};

type NotifyDetail = Omit<AppNotification, "id">;

const NOTIFY_EVENT = "better-sma:notify";
const NOTIFICATION_RING_EVENT = "better-sma:notification-ring";

export function notify(notification: NotifyDetail) {
  window.dispatchEvent(
    new CustomEvent<NotifyDetail>(NOTIFY_EVENT, {
      detail: notification,
    }),
  );
}

export function playNotificationRing() {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) {
    window.dispatchEvent(new Event(NOTIFICATION_RING_EVENT));
    return;
  }

  const audioContext = new AudioContextClass();
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0.16;
  masterGain.connect(audioContext.destination);

  const tones = [
    { frequency: 880, start: 0 },
    { frequency: 1175, start: 0.12 },
  ];

  for (const tone of tones) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = tone.frequency;
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    gainNode.gain.value = 0;
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + tone.start);
    gainNode.gain.linearRampToValueAtTime(
      1,
      audioContext.currentTime + tone.start + 0.01,
    );
    gainNode.gain.linearRampToValueAtTime(
      0,
      audioContext.currentTime + tone.start + 0.18,
    );

    oscillator.start(audioContext.currentTime + tone.start);
    oscillator.stop(audioContext.currentTime + tone.start + 0.2);
  }
}

export function notifySuccess(title: string, message?: string) {
  notify({ type: "success", title, message });
}

export function notifyError(title: string, message?: string) {
  notify({ type: "error", title, message });
}

export function notifyInfo(title: string, message?: string) {
  notify({ type: "info", title, message });
}
