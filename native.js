// Thin bridge to Capacitor plugins. Works without a bundler: inside the iOS app the
// Capacitor runtime injects window.Capacitor; in a normal browser every call falls back
// to a web behaviour or quietly does nothing, so the PWA keeps working unchanged.

const cap = window.Capacitor;

export const isNativeApp = Boolean(cap?.isNativePlatform?.());

function plugin(name) {
  if (!isNativeApp) return null;
  return cap.Plugins?.[name] || cap.registerPlugin?.(name) || null;
}

async function safe(fn, fallback = undefined) {
  try {
    return await fn();
  } catch (error) {
    console.warn("[native]", error);
    return fallback;
  }
}

// ---------------------------------------------------------------- haptics
export const haptics = {
  tap() {
    const h = plugin("Haptics");
    if (h) return safe(() => h.impact({ style: "LIGHT" }));
    navigator.vibrate?.(8);
  },
  press() {
    const h = plugin("Haptics");
    if (h) return safe(() => h.impact({ style: "MEDIUM" }));
    navigator.vibrate?.(14);
  },
  select() {
    const h = plugin("Haptics");
    if (h) return safe(() => h.selectionChanged());
  },
  success() {
    const h = plugin("Haptics");
    if (h) return safe(() => h.notification({ type: "SUCCESS" }));
    navigator.vibrate?.([10, 40, 10]);
  },
  warning() {
    const h = plugin("Haptics");
    if (h) return safe(() => h.notification({ type: "WARNING" }));
  },
  /** A burst of small ticks, like a thermal printer feeding paper. */
  async printer(lines = 14, interval = 38) {
    const h = plugin("Haptics");
    if (!h) return;
    for (let i = 0; i < lines; i += 1) {
      safe(() => h.impact({ style: "LIGHT" }));
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  },
};

// ---------------------------------------------------------------- storage
// WKWebView localStorage can be cleared by iOS under storage pressure, so the app keeps a
// mirror of every key in native Preferences (UserDefaults) and restores it on launch.
export const MIRRORED_KEYS = [
  "smoke-free-progress", "smkfree-theme", "smkfree-custom-color",
  "smkfree-goal", "smkfree-reminders", "smkfree-cravings", "smkfree-plan",
  "smkfree-hint-receipt", "smkfree-diary", "smkfree-dev-type", "smkfree-board", "smkfree-checkins", "smkfree-week-seen",
];

export async function restoreMirroredStorage() {
  const prefs = plugin("Preferences");
  if (!prefs) return;
  for (const key of MIRRORED_KEYS) {
    if (localStorage.getItem(key) !== null) continue;
    const { value } = await safe(() => prefs.get({ key }), { value: null });
    if (value !== null && value !== undefined) localStorage.setItem(key, value);
  }
}

export function mirrorStorage(key) {
  const prefs = plugin("Preferences");
  if (!prefs) return;
  const value = localStorage.getItem(key);
  safe(() => (value === null ? prefs.remove({ key }) : prefs.set({ key, value })));
}

export function mirrorAllStorage() {
  MIRRORED_KEYS.forEach(mirrorStorage);
}

// ---------------------------------------------------------------- sharing
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Opens the native iOS share sheet with the receipt image. Returns false on web. */
export async function shareImageNative(blob, { title, text, filename }) {
  const fs = plugin("Filesystem");
  const share = plugin("Share");
  if (!fs || !share) return false;

  const data = await blobToBase64(blob);
  const { uri } = await fs.writeFile({ path: filename, data, directory: "CACHE" });
  try {
    await share.share({ title, text, files: [uri], dialogTitle: title });
  } catch (error) {
    // The user closing the sheet is not an error worth surfacing.
    if (/cancel/i.test(String(error?.message || error))) {
      const abort = new Error("Share canceled");
      abort.name = "AbortError";
      throw abort;
    }
    throw error;
  }
  return true;
}

// ---------------------------------------------------------------- notifications
export const notificationsSupported = isNativeApp;

export async function notificationPermission() {
  const ln = plugin("LocalNotifications");
  if (!ln) return "unsupported";
  const { display } = await safe(() => ln.checkPermissions(), { display: "denied" });
  return display;
}

export async function requestNotificationPermission() {
  const ln = plugin("LocalNotifications");
  if (!ln) return "unsupported";
  const { display } = await safe(() => ln.requestPermissions(), { display: "denied" });
  return display;
}

/** Replaces every pending notification with the given plan. */
export async function replaceScheduledNotifications(plan) {
  const ln = plugin("LocalNotifications");
  if (!ln) return 0;
  if ((await notificationPermission()) !== "granted") return 0;

  const pending = await safe(() => ln.getPending(), { notifications: [] });
  if (pending.notifications?.length) {
    await safe(() => ln.cancel({ notifications: pending.notifications.map(({ id }) => ({ id })) }));
  }
  if (!plan.length) return 0;

  await safe(() => ln.schedule({
    notifications: plan.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      schedule: { at: item.at, allowWhileIdle: true },
    })),
  }));
  return plan.length;
}

/** Schedules one extra notification and leaves the others alone (developer test). */
export async function scheduleTestNotification(item) {
  const ln = plugin("LocalNotifications");
  if (!ln) return false;
  if ((await requestNotificationPermission()) !== "granted") return false;
  const result = await safe(() => ln.schedule({
    notifications: [{ id: item.id, title: item.title, body: item.body, schedule: { at: item.at, allowWhileIdle: true } }],
  }), false);
  return result !== false;
}

// ---------------------------------------------------------------- app lifecycle
export async function appInfo() {
  const app = plugin("App");
  const info = app ? await safe(() => app.getInfo(), null) : null;
  return info ? { version: info.version, build: info.build } : { version: "Web", build: "" };
}

export function onAppResume(callback) {
  const app = plugin("App");
  if (app) safe(() => app.addListener("resume", callback));
}

export function onNotificationTap(callback) {
  const ln = plugin("LocalNotifications");
  if (ln) safe(() => ln.addListener("localNotificationActionPerformed", callback));
}

export async function configureChrome() {
  if (!isNativeApp) return;
  document.documentElement.classList.add("is-native");
  const statusBar = plugin("StatusBar");
  if (statusBar) await safe(() => statusBar.setStyle({ style: "LIGHT" }));
}
