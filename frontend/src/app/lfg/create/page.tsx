"use client";
import LFGBetterMatchingForm from "@/components/features/LFG/LFGBetterMatchingForm";
import LFGForm from "@/components/features/LFG/LFGForm";
import { useState } from "react";
import type { LFGFormData } from "@/@types/lfg.type";

const CreateLFGPage = () => {
  const [step, setStep] = useState(1);
  const [lfgData, setLfgData] = useState<LFGFormData | null>(null);

  const handleLFGFormDone = (data: LFGFormData) => {
    setLfgData(data);
    setStep(2);
  };

  return step === 1 ? (
    <LFGForm initialData={lfgData} onDone={handleLFGFormDone} />
  ) : (
    <LFGBetterMatchingForm
      lfgData={lfgData}
      onClose={() => setStep(1)}
    />
  );
};

export default CreateLFGPage;
