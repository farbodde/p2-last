import Button from "@/components/base/Button";
import { ArrowLeftIcon } from "@/components/common/icons";
import { useRouter } from "next/navigation";

type Props = {
  isSubmitting?: boolean;
};

const EditProfileHeader = ({ isSubmitting = false }: Props) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex p-4 sticky top-0 left-0 z-20 w-full bg-tab/80 items-center justify-between">
      <Button
        variant="light"
        radius="full"
        size="sm"
        className="min-w-0 p-0 aspect-square text-white"
        onPress={handleBack}
      >
        <ArrowLeftIcon />
      </Button>
      <div>
        <h1 className="text-lg font-semibold">Edit Profile</h1>
      </div>
      <div>
        <Button
        variant="light"
        radius="full"
        size="sm"
        type="submit"
        className="min-w-0 p-2 font-semibold text-sm text-primary"
        form="profileForm"
        isLoading={isSubmitting}
      >
          Done
        </Button>
      </div>
    </div>
  );
};

export default EditProfileHeader;
