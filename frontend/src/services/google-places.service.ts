const GOOGLE_MAPS_SCRIPT_ID = "google-maps-javascript-api";

let googleMapsScriptPromise: Promise<void> | null = null;

const getGoogleMapsApiKey = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
  }

  return apiKey;
};

const getGoogleMapsWindow = () =>
  window as Window & {
    google?: {
      maps?: {
        importLibrary?: (name: string) => Promise<unknown>;
        places?: {
          AutocompleteSessionToken?: new () => unknown;
          AutocompleteSuggestion?: {
            fetchAutocompleteSuggestions: (request: {
              input: string;
              sessionToken?: unknown;
            }) => Promise<{
              suggestions?: Array<{
                placePrediction?: {
                  text?: {
                    toString: () => string;
                  };
                };
              }>;
            }>;
          };
        };
      };
    };
  };

export const loadGooglePlacesScript = async () => {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Google Places is only available in the browser."),
    );
  }

  const googleWindow = getGoogleMapsWindow();

  if (googleWindow.google?.maps?.importLibrary) {
    return Promise.resolve();
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  const apiKey = getGoogleMapsApiKey();

  googleMapsScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      GOOGLE_MAPS_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Maps Places.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Maps Places."));
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
};

export const createPlacesSessionToken = async () => {
  await loadGooglePlacesScript();

  const googleWindow = getGoogleMapsWindow();

  if (!googleWindow.google?.maps?.importLibrary) {
    throw new Error("Google Maps Places failed to initialize.");
  }

  await googleWindow.google.maps.importLibrary("places");

  const SessionToken = googleWindow.google.maps.places?.AutocompleteSessionToken;

  if (!SessionToken) {
    throw new Error("Google Places session token is unavailable.");
  }

  return new SessionToken();
};

export const searchGoogleLocations = async (
  input: string,
  sessionToken?: unknown,
) => {
  await loadGooglePlacesScript();

  const googleWindow = getGoogleMapsWindow();

  if (!googleWindow.google?.maps?.importLibrary) {
    throw new Error("Google Maps Places failed to initialize.");
  }

  await googleWindow.google.maps.importLibrary("places");

  const AutocompleteSuggestion =
    googleWindow.google.maps.places?.AutocompleteSuggestion;

  if (!AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
    throw new Error("Google Places autocomplete is unavailable.");
  }

  const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input,
    sessionToken,
  });

  return (response.suggestions ?? [])
    .map((suggestion) => suggestion.placePrediction?.text?.toString()?.trim())
    .filter((label): label is string => Boolean(label));
};
