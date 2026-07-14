"use client";
import { useState } from "react";
import Button from "@/components/base/Button";
import FeedbackFormModal from "../FeedbackFormModal";

const FeedbackButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Button fullWidth color="primary" onPress={() => setIsModalOpen(true)}>
        Feedback
      </Button>
      <FeedbackFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default FeedbackButton;
