"use client";
import React from "react";
import { useForm } from "react-hook-form";
import Modal from "@/components/base/Modal";
import Button from "@/components/base/Button";
import Header from "@/components/layouts/Header";
import TextareaController from "@/components/base/Form/TextareaController";
import ImageUploaderController from "@/components/base/Form/ImageUploaderController";
import SelectController from "@/components/base/Form/SelectController";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const options = [
  {
    value: "bugs",
    label: "Bugs",
  },
  {
    value: "complaint",
    label: "Complaint",
  },
  {
    value: "suggestions",
    label: "Suggestions and ideas",
  },
  {
    value: "technical_issue",
    label: "Technical difficulties",
  },
];

const FeedbackFormModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { control, handleSubmit } = useForm();

  const onSubmit = handleSubmit(() => {});

  return (
    <Modal
      fullScreen
      hideCloseButton
      hideCancelButton
      isOpen={isOpen}
      onClose={onClose}
      footerComponent={
        <Button fullWidth type="submit" form="feedbackForm" color="primary">
          Send
        </Button>
      }
    >
      <Header title="Feedback" onClose={onClose} />
      <form
        onSubmit={onSubmit}
        id="feedbackForm"
        className="flex flex-col gap-2 py-4"
      >
        <div className="px-4 flex flex-col gap-4">
          <SelectController
            control={control}
            options={options}
            name="type"
            // label="Type"
            rules={{
              required: "Description field is required",
            }}
          />
          <TextareaController
            control={control}
            name="description"
            label="Description"
            rows={6}
            rules={{
              required: "Description field is required",
              minLength: {
                value: 10,
                message:
                  "Minimume length count should be more than 10 characters for description",
              },
            }}
          />

          <span className="text-sm text-white/30 font-medium">Screenshots</span>
        </div>

        <ImageUploaderController
          control={control}
          name="files"
          classNames={{ wrapper: "px-4" }}
        />
      </form>
    </Modal>
  );
};

export default FeedbackFormModal;
