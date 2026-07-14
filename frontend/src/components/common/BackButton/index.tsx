"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "../icons";

type Props = {
  onClose?: () => void;
};

const BackButton: React.FC<Props> = ({ onClose }) => {
  const router = useRouter();

  const handleBack = () => {
    if (onClose) onClose();
    else router.back();
  };

  return (
    <div onClick={handleBack} className="cursor-pointer">
      <ArrowLeftIcon className="w-6 h-6" />
    </div>
  );
};

export default BackButton;
