import React from "react";
import { useForm } from "react-hook-form";
import Modal from "@/components/base/Modal";
import Button from "@/components/base/Button";
import Header from "@/components/layouts/Header";
import TextareaController from "@/components/base/Form/TextareaController";
import ImageUploaderController from "@/components/base/Form/ImageUploaderController";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const ReportFormModal: React.FC<Props> = ({ isOpen, onClose }) => {
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
        <Button fullWidth type="submit" form="reportForm" color="primary">
          Send
        </Button>
      }
    >
      <Header title="Report" onClose={onClose} />
      <form
        onSubmit={onSubmit}
        id="reportForm"
        className="flex flex-col gap-2 py-4"
      >
        <div className="px-4 flex flex-col gap-4">
          <span className="text-sm text-white/30 font-medium">
            Please describe your report in detail
          </span>
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

export default ReportFormModal;
