import Image from "next/image";

const OnboardingStep1 = () => {
  return (
    <section className="relative flex flex-col flex-1">
      <div className="absolute w-full h-full opacity-30">
        <Image
          src="/images/games/battlefield.png"
          alt="battlefield"
          width={512}
          height={512}
          className="w-full h-full object-cover object-center mask-[linear-gradient(to_bottom,rgba(0,0,0,1),rgba(0,0,0,0))]"
        />
      </div>
      <div className="relative flex flex-col flex-1 z-10">
        <div className="flex items-center justify-center py-10">
          <Image
            src="/images/logo.png"
            alt="battlefield"
            width={128}
            height={128}
            className="w-40  h-full object-cover object-center"
          />
        </div>

        <div className="p-4 flex flex-col gap-2 mb-2 items-center mt-auto">
          <h1 className="text-2xl text-center">Say Who You Are</h1>
          <p className="text-sm text-center text-white/60">
            Dox will sync in-game data across all of your gaming devices. Your
            data is always encrypted and protected. We do not see, collect or
            save your login credentials
          </p>
        </div>
      </div>
    </section>
  );
};

export default OnboardingStep1;
