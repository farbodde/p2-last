"use client";
import clsx from "clsx";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  initial: number;
  endComponent?: React.ReactNode;
  className?: string;
  onEnd?: () => void;
};

const normalizeSeconds = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.ceil(value)) : 0;

const Countdown: React.FC<Props> = ({
  initial,
  className,
  endComponent,
  onEnd,
}) => {
  const [time, setTime] = useState(() => normalizeSeconds(initial));
  const onEndRef = useRef(onEnd);
  const hasEndedRef = useRef(false);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    const initialSeconds = normalizeSeconds(initial);
    const deadline = Date.now() + initialSeconds * 1000;
    hasEndedRef.current = false;

    const interval = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000),
      );

      setTime(remaining);

      if (remaining === 0 && !hasEndedRef.current) {
        hasEndedRef.current = true;
        window.clearInterval(interval);
        onEndRef.current?.();
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [initial]);

  const timeText = useMemo(() => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    const paddedMinutes = String(minutes).padStart(2, "0");
    const paddedSeconds = String(seconds).padStart(2, "0");

    return hours > 0
      ? `${String(hours).padStart(2, "0")}:${paddedMinutes}:${paddedSeconds}`
      : `${paddedMinutes}:${paddedSeconds}`;
  }, [time]);

  if (time === 0 && endComponent) {
    return endComponent;
  }

  return <span className={clsx(className)}>{timeText}</span>;
};

export default memo(Countdown);
