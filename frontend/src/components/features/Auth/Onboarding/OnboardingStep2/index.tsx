import Image from "next/image";

const OnboardingStep2 = () => {
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
        <div className="flex items-center justify-center mb-10 py-10">
          <Image
            src="/images/logo.png"
            alt="battlefield"
            width={128}
            height={128}
            className="w-40  h-full object-cover object-center"
          />
        </div>

        <div className="flex-1 flex flex-col items-center">
          <div className="flex flex-1 w-full items-center justify-center relative">
            <div className="absolute z-10 -translate-y-1/2 translate-x-[45%] flex border max-w-1/2 w-40 border-gray-600 rounded-md bg-background">
              <span className="w-12 aspect-square p-1">
                <Image
                  src="/images/logo.png"
                  alt="battlefield"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain object-center"
                />
              </span>
              <span className="flex flex-col text-xs p-2 gap-0.5 justify-center border-l border-gray-600">
                <span className="text-white/80 font-medium">Valorant</span>
                <span className="text-red-500">Connected</span>
              </span>
            </div>
            <div className="absolute -translate-x-[45%] flex border w-40 max-w-1/2 border-gray-600 rounded-md bg-background">
              <span className="w-12 aspect-square p-1">
                <Image
                  src="/images/logo.png"
                  alt="battlefield"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain object-center"
                />
              </span>
              <span className="flex flex-col text-xs p-2 gap-0.5 justify-center border-l border-gray-600">
                <span className="text-white/80 font-medium">Fortnite</span>
                <span className="text-primary">Connected</span>
              </span>
            </div>
          </div>

          <div className="flex w-full flex-1 items-center justify-center relative">
            <div className="absolute z-10 -translate-y-1/2 translate-x-[45%] flex border w-40 max-w-1/2 border-gray-600 rounded-md bg-background">
              <span className="w-12 aspect-square p-1">
                <Image
                  src="/images/logo.png"
                  alt="battlefield"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain object-center"
                />
              </span>
              <span className="flex flex-col text-xs p-2 gap-0.5 justify-center border-l border-gray-600">
                <span className="text-white/80 font-medium">CS:GO</span>
                <span className="text-gray-400">Connected</span>
              </span>
            </div>
            <div className="absolute -translate-x-[45%] flex border w-40 max-w-1/2 border-gray-600 rounded-md bg-background">
              <span className="w-12 aspect-square p-1">
                <Image
                  src="/images/logo.png"
                  alt="battlefield"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain object-center"
                />
              </span>
              <span className="flex flex-col text-xs p-2 gap-0.5 justify-center border-l border-gray-600">
                <span className="text-white/80 font-medium">Warzone</span>
                <span className="text-warning-500">Connected</span>
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-2 mb-2 items-center mt-auto">
          <h1 className="text-2xl text-center">Track Your Games</h1>
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

export default OnboardingStep2;
