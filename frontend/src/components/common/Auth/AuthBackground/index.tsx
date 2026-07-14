import clsx from "clsx";
import Image from "next/image";
import React, { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  className?: string;
};

const AuthBackground: React.FC<Props> = ({ children, className }) => {
  return (
    <section className="relative">
      <div className="absolute w-full aspect-square opacity-30">
        <Image
          src="/images/games/battlefield.png"
          alt="battlefield"
          width={512}
          height={512}
          className="w-full h-full object-cover object-center mask-[linear-gradient(to_bottom,rgba(0,0,0,1),rgba(0,0,0,0))]"
        />
      </div>
      <div className={clsx("relative z-10", className)}>{children}</div>
    </section>
  );
};

export default AuthBackground;
