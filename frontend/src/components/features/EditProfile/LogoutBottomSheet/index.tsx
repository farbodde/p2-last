import React, { useCallback } from "react";
import BottomSheet from "@/components/base/BottomSheet";
import Button from "@/components/base/Button";
import { clearAuthSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const LogoutBottomSheet: React.FC<Props> = ({ isOpen, onClose }) => {
  const router = useRouter();

  const handleLogout = useCallback(() => {
    clearAuthSession();
    onClose();
    router.replace("/auth/signin");
  }, [onClose, router]);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-8 p-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-lg">Logout</h3>
          <p>Are you sure you want to logout?</p>
        </div>

        <div className="flex gap-4 items-center">
          <Button fullWidth color="danger" onPress={handleLogout}>
            Logout
          </Button>
          <Button
            fullWidth
            onPress={onClose}
            className="bg-[#252932] text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default LogoutBottomSheet;
