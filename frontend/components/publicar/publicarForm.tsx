"use client";

import { useState } from "react";

import ProgressBar from "./progressBar";

import InfoBasica from "./sections/infoBasica";
import UbicacionMapa from "./sections/ubicacionMapa";
import CaracteristicasTerreno from "./sections/CaracteristicasTerreno";
import InfoLegal from "./sections/infoLegal";
import ImagenesTerreno from "./sections/imagenesTerreno";
import Confirmacion from "./sections/confirmacion";

export default function PublicarForm() {

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    tipo: "",
    negociable: false,

    estado_region: "",
    municipio: "",
    colonia: "",
    direccion: "",
    codigo_postal: "",

    topografia: "",
    forma: "",
    uso_suelo: "",

    tipo_propiedad: "",

    poligono: null,
    imagenes: []
  });

  const next = () => setStep(step + 1);
  const back = () => setStep(step - 1);

  return (

    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-8">

      <ProgressBar step={step} />

      {step === 1 && <InfoBasica formData={formData} setFormData={setFormData} />}

      {step === 2 && <UbicacionMapa formData={formData} setFormData={setFormData} />}

      {step === 3 && <CaracteristicasTerreno formData={formData} setFormData={setFormData} />}

      {step === 4 && <InfoLegal formData={formData} setFormData={setFormData} />}

      {step === 5 && <ImagenesTerreno formData={formData} setFormData={setFormData} />}

      {step === 6 && <Confirmacion formData={formData} />}

      <div className="flex justify-between mt-10">

        {step > 1 && (
          <button
            onClick={back}
            className="px-6 py-2 bg-gray-200 rounded-lg"
          >
            Atrás
          </button>
        )}

        {step < 6 && (
          <button
            onClick={next}
            className="px-6 py-2 bg-[#828d4b] text-white rounded-lg"
          >
            Siguiente
          </button>
        )}

      </div>

    </div>

  );
}