"use client";

import { useEffect, useRef } from "react";
import { NumericFormat } from "react-number-format";

interface Props {
  formData: any;
  setFormData: (data: any) => void;
}

function numeroATexto(numero: number): string {
  const unidades = [
    "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"
  ];

  const decenasEspeciales = [
    "diez", "once", "doce", "trece", "catorce", "quince",
    "dieciséis", "diecisiete", "dieciocho", "diecinueve"
  ];

  const decenas = [
    "", "", "veinte", "treinta", "cuarenta", "cincuenta",
    "sesenta", "setenta", "ochenta", "noventa"
  ];

  const centenas = [
    "", "ciento", "doscientos", "trescientos", "cuatrocientos",
    "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"
  ];

  function convertirMenorDeMil(n: number): string {
    if (n === 0) return "";
    if (n === 100) return "cien";

    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    let texto = "";

    if (c > 0) texto += centenas[c] + " ";

    const resto = n % 100;

    if (resto >= 10 && resto < 20) {
      texto += decenasEspeciales[resto - 10];
      return texto.trim();
    }

    if (resto >= 20 && resto < 30) {
      if (resto === 20) return (texto + "veinte").trim();
      return (texto + "veinti" + unidades[u]).trim();
    }

    if (d > 0) {
      texto += decenas[d];
      if (u > 0) texto += " y ";
    }

    if (u > 0) texto += unidades[u];

    return texto.trim();
  }

  if (!numero || numero === 0) return "Cero pesos";

  const millones = Math.floor(numero / 1000000);
  const miles = Math.floor((numero % 1000000) / 1000);
  const cientos = numero % 1000;

  let resultado = "";

  if (millones > 0) {
    resultado += millones === 1
      ? "un millón "
      : `${convertirMenorDeMil(millones)} millones `;
  }

  if (miles > 0) {
    resultado += miles === 1
      ? "mil "
      : `${convertirMenorDeMil(miles)} mil `;
  }

  if (cientos > 0) {
    resultado += convertirMenorDeMil(cientos);
  }

  resultado = resultado.trim();

  return resultado.charAt(0).toUpperCase() + resultado.slice(1) + " pesos";
}

export default function InfoBasica({ formData, setFormData }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    const maxHeight = 220;

    if (textarea.scrollHeight > maxHeight) {
      textarea.style.height = maxHeight + "px";
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.height = textarea.scrollHeight + "px";
      textarea.style.overflowY = "hidden";
    }
  };

  useEffect(() => {
    autoResize();
  }, [formData.descripcion]);

  const precioNumero = Number(formData.precio || 0);
  const precioEnTexto = precioNumero > 0 ? numeroATexto(precioNumero) : "";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#22341c]">
        Información básica
      </h2>

      <input
        type="text"
        placeholder="Título del terreno"
        value={formData.titulo}
        onChange={(e) =>
          setFormData({ ...formData, titulo: e.target.value })
        }
        className="w-full border border-[#817d58]/40 rounded-xl p-3"
      />

      <textarea
        ref={textareaRef}
        placeholder="Describe el terreno, acceso, servicios cercanos, ventajas de la ubicación..."
        value={formData.descripcion}
        onChange={(e) => {
          setFormData({ ...formData, descripcion: e.target.value });
        }}
        rows={4}
        className="w-full border border-[#817d58]/40 rounded-xl p-3 resize-none transition-all"
      />

      <div className="space-y-2">
        <NumericFormat
          value={formData.precio}
          thousandSeparator=","
          decimalSeparator="."
          prefix="$"
          decimalScale={2}
          fixedDecimalScale
          allowNegative={false}
          placeholder="$0.00"
          className="w-full border border-[#817d58]/40 rounded-xl p-3"
          onValueChange={(values) => {
            setFormData({
              ...formData,
              precio: values.value
            });
          }}
        />

        {precioEnTexto && (
          <p className="text-sm text-[#817d58]">
            {precioEnTexto}
          </p>
        )}
      </div>
    </div>
  );
}