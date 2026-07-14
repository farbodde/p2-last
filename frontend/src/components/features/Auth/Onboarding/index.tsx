"use client";
import { useRef, useState } from "react";
import OnboardingStep1 from "./OnboardingStep1";
import OnboardingStep2 from "./OnboardingStep2";
import Button from "@/components/base/Button";
import clsx from "clsx";
import Link from "next/link";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollToStep = (nextStep: number) => {
    const carousel = carouselRef.current;

    if (!carousel) {
      setStep(nextStep);
      return;
    }

    carousel.scrollTo({
      left: carousel.clientWidth * (nextStep - 1),
      behavior: "smooth",
    });
    setStep(nextStep);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex-1 relative flex flex-col overflow-hidden">
        <div
          ref={carouselRef}
          onScroll={(event) => {
            const carousel = event.currentTarget;

            if (carousel.clientWidth) {
              setStep(
                Math.round(carousel.scrollLeft / carousel.clientWidth) + 1,
              );
            }
          }}
          className="flex flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex min-w-full snap-center">
            <OnboardingStep1 />
          </div>
          <div className="flex min-w-full snap-center">
            <OnboardingStep2 />
          </div>
        </div>
        <div className="flex items-center justify-center w-full z-30 gap-1.5 absolute bottom-0 -translate-y-1/2">
          <button
            type="button"
            aria-label="Show onboarding step 1"
            aria-current={step === 1}
            className={clsx(
              "h-2 w-2 cursor-pointer rounded-full border-0 p-0",
              {
                "bg-primary": step === 1,
                "bg-white/60": step === 2,
              },
            )}
            onClick={() => scrollToStep(1)}
          />
          <button
            type="button"
            aria-label="Show onboarding step 2"
            aria-current={step === 2}
            className={clsx(
              "h-2 w-2 cursor-pointer rounded-full border-0 p-0",
              {
                "bg-primary": step === 2,
                "bg-white/60": step === 1,
              },
            )}
            onClick={() => scrollToStep(2)}
          />
        </div>
      </section>
      <section className="flex flex-col gap-4 p-8">
        <Button
          as={Link}
          href="/auth/signup"
          className="bg-[#252932] text-white"
        >
          Sign Up
        </Button>
        <Button as={Link} href="/auth/signin" color="primary">
          Sign In
        </Button>
      </section>
    </div>
  );
};

export default Onboarding;
