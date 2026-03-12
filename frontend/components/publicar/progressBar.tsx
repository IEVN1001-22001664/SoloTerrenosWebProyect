"use client";

interface Props {
  step: number;
}

export default function ProgressBar({ step }: Props) {

  const steps = [
    "Información",
    "Ubicación",
    "Características",
    "Legal",
    "Imágenes",
    "Confirmar"
  ];

  return (

    <div className="mb-10">

      <div className="flex justify-between text-sm mb-2">

        {steps.map((label, index) => (

          <span
            key={index}
            className={
              step >= index + 1
                ? "text-[#22341c] font-semibold"
                : "text-gray-400"
            }
          >
            {label}
          </span>

        ))}

      </div>

      <div className="w-full bg-gray-200 h-2 rounded">

        <div
          className="bg-[#828d4b] h-2 rounded transition-all"
          style={{ width: `${(step / steps.length) * 100}%` }}
        />

      </div>

    </div>

  );
}