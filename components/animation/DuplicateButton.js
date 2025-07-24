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
          style={{ width: 18, height: 18 }}
        />
      ) : (
        <Image
          src="/assets/duplicateIcon.jpg"
          height={18}
          width={18}
          alt="Duplicate"
        />
      )}
    </button>
  );
}
