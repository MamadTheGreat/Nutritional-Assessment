import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import firebaseConfig from "@/../firebase-applet-config.json";
import { setDriveAccessToken } from "@/lib/driveStore";

let currentUser = null;
let accessToken = null;
const listeners = new Set();
let googleScriptPromise;

if (typeof window !== "undefined") {
  window.addEventListener("google-token-expired", () => {
    accessToken = null;
    currentUser = null;
    announce();
  });
}

function announce() {
  for (const listener of listeners) listener(getGoogleUser());
}

export function subscribeToGoogleSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getGoogleUser() {
  return currentUser;
}

export function getGoogleAccessToken() {
  return accessToken;
}

export function expireGoogleSession() {
  accessToken = null;
  currentUser = null;
  setDriveAccessToken(null);
  announce();
}

function getFirebaseAuth() {
  if (typeof window === "undefined" || !firebaseConfig?.apiKey) return null;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

function loadGoogleIdentity() {
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google);
  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => (window.google?.accounts?.oauth2 ? resolve(window.google) : reject(new Error("ورود گوگل بارگذاری نشد.")));
      script.onerror = () => reject(new Error("دریافت سرویس ورود گوگل ناموفق بود."));
      document.head.appendChild(script);
    });
  }
  return googleScriptPromise;
}

export async function signInWithGoogle({ rememberAccount = false } = {}) {
  // Try Firebase Auth first
  const firebaseAuth = getFirebaseAuth();
  if (firebaseAuth) {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/drive.file");
      provider.addScope("email");
      provider.addScope("profile");
      provider.addScope("openid");
      if (rememberAccount) {
        provider.setCustomParameters({ prompt: "consent" });
      } else {
        provider.setCustomParameters({ prompt: "select_account" });
      }

      const result = await signInWithPopup(firebaseAuth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (!token) {
        throw new Error("توکن دسترسی Google Drive دریافت نشد.");
      }

      const user = result.user;
      accessToken = token;
      currentUser = {
        id: user.uid,
        email: user.email,
        full_name: user.displayName || user.email,
        picture: user.photoURL,
      };
      setDriveAccessToken(token);
      announce();
      return currentUser;
    } catch (fbError) {
      if (fbError.code === "auth/popup-closed-by-user") {
        throw new Error("پنجرهٔ ورود با گوگل پیش از تکمیل بسته شد.");
      }
      if (fbError.code === "auth/cancelled-popup-request") {
        throw new Error("درخواست ورود متوقف شد.");
      }
      if (fbError.message && fbError.message.includes("Google Drive")) {
        throw fbError;
      }
      console.warn("Firebase Auth popup failed, checking GIS fallback:", fbError);
    }
  }

  // Fallback to Google Identity Services (GIS)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || firebaseConfig?.oAuthClientId;
  if (!clientId) throw new Error("شناسهٔ Google OAuth هنوز تنظیم نشده است.");
  const google = await loadGoogleIdentity();
  const token = await new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile https://www.googleapis.com/auth/drive.file",
      callback: (response) => {
        if (response.error || !response.access_token) reject(new Error(response.error_description || "ورود به گوگل ناموفق بود."));
        else resolve(response.access_token);
      },
      error_callback: (error) => reject(new Error(error?.message || "پنجرهٔ ورود گوگل باز نشد.")),
    });
    client.requestAccessToken(
      rememberAccount ? { prompt: "" } : { prompt: "select_account" },
    );
  });

  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("اطلاعات حساب گوگل دریافت نشد.");
  const profile = await response.json();

  accessToken = token;
  currentUser = {
    id: profile.sub,
    email: profile.email,
    full_name: profile.name || profile.email,
    picture: profile.picture,
  };
  setDriveAccessToken(token);
  announce();
  return currentUser;
}

export function signOutFromGoogle() {
  if (accessToken && window.google?.accounts?.oauth2) {
    try {
      window.google.accounts.oauth2.revoke(accessToken, () => {});
    } catch (err) {
      void err;
    }
  }
  const firebaseAuth = getFirebaseAuth();
  if (firebaseAuth) {
    firebaseSignOut(firebaseAuth).catch(() => {});
  }
  expireGoogleSession();
}
