// Offline / Local mode stubs for googleAuth
export function getGoogleUser() {
  return { id: "local-user", full_name: "کارشناس تغذیه", email: "حالت محلی" };
}

export function getGoogleAccessToken() {
  return null;
}

export function subscribeToGoogleSession(listener) {
  listener(getGoogleUser());
  return () => {};
}

export function expireGoogleSession() {}

export function signInWithGoogle() {
  return Promise.resolve(getGoogleUser());
}

export function signOutFromGoogle() {}
