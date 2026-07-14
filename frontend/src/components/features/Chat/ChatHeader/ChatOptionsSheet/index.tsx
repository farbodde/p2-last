import React, { useCallback, useState } from "react";
import Button from "@/components/base/Button";
import BlockConfirmation from "../../BlockConfirmation";
import ReportFormModal from "../../../ReportFormModal";
import Link from "next/link";

type Props = {
  onClose: () => void;
};

const ChatOptionsSheet: React.FC<Props> = ({ onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [blockConfirmation, setBlockConfirmation] = useState(false);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return (
    <>
      <section className="flex flex-col gap-4 p-4">
        <Button
          fullWidth
          className="bg-[#252932] text-white"
          onPress={() => setReportModal(true)}
        >
          Report User
        </Button>
        <Button
          fullWidth
          className="bg-[#252932] text-white"
          onPress={() => setBlockConfirmation(true)}
        >
          Block User
        </Button>
        <Button
          fullWidth
          onPress={handleToggleMute}
          className="bg-[#252932] text-white"
        >
          {isMuted ? "Unmute" : "Mute"} Chat
        </Button>
        <Button
          fullWidth
          as={Link}
          href="/gamer/2"
          className="bg-[#252932] text-white"
        >
          View LFG Post
        </Button>
        <Button
          fullWidth
          variant="light"
          onPress={onClose}
          className="text-white"
        >
          Cancel
        </Button>
      </section>

      <ReportFormModal
        isOpen={reportModal}
        onClose={() => setReportModal(false)}
      />

      <BlockConfirmation
        isOpen={blockConfirmation}
        onClose={() => setBlockConfirmation(false)}
      />
    </>
  );
};

export default ChatOptionsSheet;
