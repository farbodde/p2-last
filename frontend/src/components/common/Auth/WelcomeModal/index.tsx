/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useCallback, useEffect, useState } from "react";
import Button from "@/components/base/Button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import Link from "next/link";

const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      classNames={{ closeButton: "text-2xl text-white/60" }}
    >
      <ModalContent className="bg-background w-[90%]">
        <ModalHeader>
          <div className="w-full p-4">
            <div className="flex w-14 h-14 mx-auto items-center justify-center bg-black/40 rounded-full"></div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4 px-4">
            <h2 className="text-xl text-center">
              Maximize matches with a completed profile
            </h2>
            <p className="text-white/60 text-center">
              Complete your profile for better connections! More info = a better
              Player2 experience.
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="p-4">
          <Button
            fullWidth
            as={Link}
            href="/profile/edit"
            color="primary"
            className="font-semibold"
            onPress={handleClose}
          >
            Complete Profile
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WelcomeModal;
