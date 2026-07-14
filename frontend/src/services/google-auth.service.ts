const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_SIGN_IN_TIMEOUT = 15000;

let googleScriptPromise: Promise<void> | null = null;

export const loadGoogleScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Google login is only available in the browser."),
    );
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      GOOGLE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Sign-In.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In."));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

export const requestGoogleCredential = async () => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
  }

  await loadGoogleScript();

  return new Promise<string>((resolve, reject) => {
    let isSettled = false;

    const timeoutId = window.setTimeout(() => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      reject(
        new Error(
          "Google sign-in did not complete. Check Google OAuth origin settings and try again.",
        ),
      );
    }, GOOGLE_SIGN_IN_TIMEOUT);

    const resolveOnce = (credential: string) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      window.clearTimeout(timeoutId);
      resolve(credential);
    };

    const rejectOnce = (error: Error) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      window.clearTimeout(timeoutId);
      reject(error);
    };

    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: ({ credential }) => {
        if (!credential) {
          rejectOnce(new Error("Google did not return an ID token."));
          return;
        }

        resolveOnce(credential);
      },
      error_callback: () => {
        rejectOnce(new Error("Google sign-in was cancelled."));
      },
    });

    if (!window.google?.accounts.id) {
      rejectOnce(new Error("Google Sign-In client failed to initialize."));
      return;
    }

    window.google.accounts.id.prompt();
  });
};

export type GoogleCredentialProfile = {
  email: string;
  name: string;
};

export const parseGoogleCredential = (
  credential: string,
): GoogleCredentialProfile => {
  const [, payload] = credential.split(".");

  if (!payload) {
    throw new Error("Google did not return a valid token.");
  }

  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
  const paddedPayload = normalizedPayload.padEnd(
    Math.ceil(normalizedPayload.length / 4) * 4,
    "=",
  );
  const decodedPayload = JSON.parse(window.atob(paddedPayload)) as {
    email?: string;
    name?: string;
  };

  if (!decodedPayload.email || !decodedPayload.name) {
    throw new Error("Google profile data is incomplete.");
  }

  return {
    email: decodedPayload.email,
    name: decodedPayload.name,
  };
};
