"use client";
import Link from "next/link";
import Button from "@/components/base/Button";
import { AddIcon } from "../icons";

const LFGFloatButton = () => {
  return (
    <Button
      as={Link}
      href="/lfg/create"
      size="lg"
      color="primary"
      radius="full"
      className="fixed bottom-16 min-w-0 z-20 right-4 screen:right-[calc(50%-18rem+16px)] w-12! h-12! p-0"
    >
      <AddIcon className="text-white! w-6 h-6" />
    </Button>
  );
};

export default LFGFloatButton;
