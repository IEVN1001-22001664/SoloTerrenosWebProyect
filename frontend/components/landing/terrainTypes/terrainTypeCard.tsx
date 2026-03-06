"use client";

import { motion } from "framer-motion";

interface Props {
  title: string;
  description: string;
  count: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

export default function TerrainTypeCard({
  title,
  description,
  count,
  icon: Icon
}: Props) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="
        group
        bg-white
        rounded-2xl
        p-8
        text-center
        border
        border-gray-200
        hover:border-[#5C7C3A]
        hover:shadow-lg
        transition
        cursor-pointer
      "
    >
      {/* Icono */}

      <div className="
        w-14 h-14
        mx-auto
        mb-5
        flex
        items-center
        justify-center
        rounded-xl
        bg-[#EDF2EC]
        text-[#5C7C3A]
        group-hover:bg-[#5C7C3A]
        group-hover:text-white
        transition
      ">
        <Icon size={24}/>
      </div>

      {/* Title */}

      <h3 className="text-lg font-semibold text-[#1F3D2B]">
        {title}
      </h3>

      {/* Description */}

      <p className="text-sm text-gray-500 mt-2">
        {description}
      </p>

      {/* Badge */}

      <div className="mt-4">
        <span className="
          text-xs
          font-medium
          px-3
          py-1
          rounded-full
          bg-[#EDF2EC]
          text-[#5C7C3A]
        ">
          {count}
        </span>
      </div>

    </motion.div>
  );
}