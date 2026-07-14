import React, { useCallback } from "react";
import Modal from "@/components/base/Modal";
import Button from "@/components/base/Button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const BlockConfirmation: React.FC<Props> = ({ isOpen, onClose }) => {
  const handleBlock = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      hideCloseButton
      isOpen={isOpen}
      onClose={onClose}
      footerComponent={
        <div className="flex w-full items-center gap-2">
          <Button
            fullWidth
            size="lg"
            radius="md"
            variant="bordered"
            className="font-semibold text-white/80 border border-white/20"
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            size="lg"
            radius="md"
            color="primary"
            className="font-semibold text-white/80"
            onPress={handleBlock}
          >
            OK
          </Button>
        </div>
      }
    >
      <h3 className="text-lg text-center text-white/70">Block this user?</h3>
    </Modal>
  );
};

export default BlockConfirmation;
