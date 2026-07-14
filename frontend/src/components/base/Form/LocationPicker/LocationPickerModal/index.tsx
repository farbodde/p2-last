import React, { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Header from "@/components/layouts/Header";
import Button from "@/components/base/Button";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useCountriesQuery } from "@/hooks/queries/useCountriesQuery";

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
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const countriesQuery = useCountriesQuery({ enabled: isOpen });
  const countries = useMemo(
    () =>
      [...(countriesQuery.data ?? [])].sort((first, second) =>
        first.name.localeCompare(second.name),
      ),
    [countriesQuery.data],
  );
  const defaultCountry = useMemo(() => {
    const normalizedValue = defaultvalue.trim().toLowerCase();

    return countries.find(
      (country) =>
        country.code.toLowerCase() === normalizedValue ||
        country.name.toLowerCase() === normalizedValue,
    );
  }, [countries, defaultvalue]);
  const activeCode = selectedCode ?? defaultCountry?.code ?? null;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isOpen) {
      timeout = setTimeout(() => {
        setShow(isOpen);
      });
    } else {
      timeout = setTimeout(() => {
        setShow(isOpen);
      }, 150);
    }

    return () => clearTimeout(timeout);
  }, [isOpen]);

  const handleDone = useCallback(() => {
    const selectedCountry = countries.find(
      (country) => country.code === activeCode,
    );

    if (selectedCountry) {
      onChangeValue(selectedCountry.name);
    }
  }, [activeCode, countries, onChangeValue]);

  const handleClose = useCallback(() => {
    setSelectedCode(null);
    onClose();
  }, [onClose]);

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
      <Header title="Location" onClose={handleClose} />
      <section className="flex flex-col gap-4 px-4">
        <Autocomplete
          aria-label="Country"
          placeholder="Search country"
          selectedKey={activeCode}
          isLoading={countriesQuery.isLoading}
          isDisabled={countriesQuery.isError}
          inputProps={{
            classNames: {
              inputWrapper:
                "border border-white/20 rounded-lg bg-transparent transparent",
              input: "text-white!",
            },
          }}
          classNames={{
            popoverContent: "bg-tab",
          }}
          onSelectionChange={(key) =>
            setSelectedCode(key === null ? null : String(key))
          }
          size="lg"
        >
          {countries.map((country) => (
            <AutocompleteItem key={country.code} textValue={country.name}>
              {country.name}
            </AutocompleteItem>
          ))}
        </Autocomplete>

        {countriesQuery.isError ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-center">
            <span className="text-sm text-danger">
              {countriesQuery.error instanceof Error
                ? countriesQuery.error.message
                : "Failed to load countries. Please try again."}
            </span>
            <Button
              color="danger"
              variant="bordered"
              isLoading={countriesQuery.isRefetching}
              onPress={() => countriesQuery.refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : null}

        {!countriesQuery.isLoading &&
        !countriesQuery.isError &&
        countries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-white/50">
            No countries are available.
          </div>
        ) : null}
      </section>
      <section className="sticky z-20 p-4 backdrop-blur-[2px] bottom-0 left-0 w-full mt-auto bg-tab/90 flex">
        <Button
          fullWidth
          color="primary"
          isDisabled={!activeCode || countriesQuery.isLoading}
          onPress={handleDone}
        >
          Done
        </Button>
      </section>
    </section>
  );
};

export default LocationPickerModal;
