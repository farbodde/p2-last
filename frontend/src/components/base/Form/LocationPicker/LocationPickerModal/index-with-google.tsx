import React, { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Header from "@/components/layouts/Header";
import Button from "@/components/base/Button";
import Input from "../../Input";
import {
  searchGoogleLocations,
  createPlacesSessionToken,
} from "@/services/google-places.service";

type Props = {
  value?: string;
  isOpen: boolean;
  onClose: () => void;
  onChangeValue: (val: string) => void;
};

const LocationPickerModal: React.FC<Props> = ({
  value: defaultvalue = "",
  isOpen,
  onClose,
  onChangeValue,
}) => {
  const [show, setShow] = useState<boolean>(false);
  const [value, setValue] = useState<string>(defaultvalue);
  const [searchQuery, setSearchQuery] = useState<string>(defaultvalue);
  const [results, setResults] = useState<string[]>([]);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [sessionToken, setSessionToken] = useState<unknown>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setShow(isOpen);
      });
    } else {
      setTimeout(() => {
        setShow(isOpen);
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    setValue(defaultvalue);
    setSearchQuery(defaultvalue);
  }, [defaultvalue, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setResults([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    let isMounted = true;

    createPlacesSessionToken()
      .then((token) => {
        if (isMounted) {
          setSessionToken(token);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setSearchError(
            error instanceof Error
              ? error.message
              : "Failed to initialize location search.",
          );
        }
      });

    return () => {
      isMounted = false;
      setSessionToken(null);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const normalizedQuery = searchQuery.trim();

    if (normalizedQuery.length < 2) {
      setResults(value ? [value] : []);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");

      try {
        const suggestions = await searchGoogleLocations(
          normalizedQuery,
          sessionToken ?? undefined,
        );

        setResults(suggestions.length > 0 ? suggestions : [normalizedQuery]);
      } catch (error) {
        setSearchError(
          error instanceof Error
            ? error.message
            : "Failed to search locations.",
        );
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, searchQuery, sessionToken, value]);

  const handleDone = useCallback(() => {
    onChangeValue(searchQuery.trim() || value);
  }, [searchQuery, value, onChangeValue]);

  const items = useMemo(() => {
    const uniqueItems = new Set<string>();

    if (value) {
      uniqueItems.add(value);
    }

    results.forEach((item) => {
      if (item) {
        uniqueItems.add(item);
      }
    });

    return Array.from(uniqueItems);
  }, [results, value]);

  if (!isOpen && !show) return null;

  return (
    <section
      className={clsx(
        "fixed top-0 width-screen bg-background z-50 flex flex-col overflow-auto scroll-smooth gap-4 left-1/2 h-full delay-75 transition -translate-x-1/2",
        {
          "opacity-100 translate-y-0": show,
          "translate-y-1/2 opacity-0": !show || !isOpen,
        },
      )}
    >
      <Header title="Location" onClose={onClose} />
      <section className="flex flex-col gap-4 px-4 pb-4">
        <Input
          type="search"
          value={searchQuery}
          onChangeText={setSearchQuery}
          label="Search location"
        />

        {searchError ? (
          <p className="text-sm text-danger">{searchError}</p>
        ) : null}

        {isSearching ? (
          <p className="text-sm text-white/60">Searching locations...</p>
        ) : null}

        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <button
              key={item}
              type="button"
              className={clsx(
                "rounded-xl border px-4 py-3 text-left transition",
                {
                  "border-primary bg-primary/10 text-white": item === value,
                  "border-white/10 bg-white/5 text-white/75": item !== value,
                },
              )}
              onClick={() => {
                setValue(item);
                setSearchQuery(item);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      <section className="sticky z-20 p-4 backdrop-blur-[2px] bottom-0 left-0 w-full mt-auto bg-tab/90 flex">
        <Button
          fullWidth
          color="primary"
          onPress={handleDone}
          isDisabled={!searchQuery.trim() && !value}
        >
          Done
        </Button>
      </section>
    </section>
  );
};

export default LocationPickerModal;
