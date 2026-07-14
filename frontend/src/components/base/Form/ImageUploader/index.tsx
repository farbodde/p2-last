import React from "react";
import Image from "next/image";
import Button from "../../Button";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { AddIcon, CloseCircleIcon } from "@/components/common/icons";

export type UploadFileItem = {
  id: string | number;
  fileUrl: string;
  file?: File;
};

export type ImageUploaderProps = {
  classNames?: { wrapper?: string };
  value?: UploadFileItem[];
  onChange?: (files: UploadFileItem[]) => void;
  maxFiles?: number;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  classNames,
  onChange,
  maxFiles,
}) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files) {
      const fileItems = e.target.files;
      let id = new Date().getTime();
      const newFiles: UploadFileItem[] = [...(value || [])];
      const availableSlots =
        maxFiles === undefined
          ? fileItems.length
          : Math.max(maxFiles - newFiles.length, 0);

      for (const file of Array.from(fileItems).slice(0, availableSlots)) {
        id--;

        const fileUrl = URL.createObjectURL(file);
        newFiles.push({
          id,
          file,
          fileUrl,
        });
      }

      if (onChange) onChange(newFiles);
      setTimeout(() => {
        e.target.value = "";
      });
    }
  };

  const handleFileRemove = (fileId: string | number) => {
    const newFiles: UploadFileItem[] = [...(value || [])];
    const index = newFiles.findIndex((f) => f.id === fileId);
    if (index !== -1) {
      newFiles.splice(index, 1);

      if (onChange) onChange(newFiles);
    }
  };

  return (
    <section className="w-full overflow-auto scrollbar-hide scroll-smooth">
      <div
        className={twMerge(
          clsx("flex items-center gap-3 pt-1.5 w-fit", classNames?.wrapper),
        )}
      >
        {maxFiles === undefined || (value?.length ?? 0) < maxFiles ? (
          <label
            htmlFor="image"
            className="flex items-center justify-center h-16 aspect-square rounded-lg bg-[#252932] text-2xl text-white/50"
          >
            <AddIcon className="w-6 h-6" />
            <input
              multiple
              className="hidden"
              type="file"
              name="image"
              accept="image/png,image/jpg,image/jpeg"
              id="image"
              onChange={handleChange}
            />
          </label>
        ) : null}
        {(value || []).map((file) => (
          <div key={file.id} className="h-16 aspect-square relative">
            <Button
              variant="light"
              color="danger"
              size="sm"
              radius="full"
              className="absolute -right-1.5 -top-1.5 z-20 min-w-0 p-0 w-4 h-4 flex items-center justify-center"
              onPress={handleFileRemove.bind(null, file.id)}
            >
              <CloseCircleIcon />
            </Button>

            <Image
              src={file.fileUrl}
              alt={file.file?.name || ""}
              width={128}
              height={128}
              className="w-full h-full object-cover object-center rounded-lg overflow-hidden"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImageUploader;
