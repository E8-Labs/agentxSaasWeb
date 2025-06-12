'use client';
import { useState } from "react";
import Lottie from "lottie-react";
import Image from "next/image";

export default function DuplicateButton({
    handleDuplicate,
    loading = false,
}) {

  return (
    <button className="relative w-[24px] h-[24px]" onClick={handleDuplicate}>
      {loading ? (
        <Lottie
          animationData={require("../../public/assets/animation/duplicateAnimation.json")}
          loop
          style={{ width: 24, height: 24 }}
        />
      ) : (
        <Image
          src="/assets/duplicateIcon.jpg"
          height={24}
          width={24}
          alt="Duplicate"
        />
      )}
    </button>
  );
}
