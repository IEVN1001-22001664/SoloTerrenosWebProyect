"use client";

import Link from "next/link";
import {
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-[#0c1f1a] pb-10 pt-20 text-gray-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="text-green-400" size={26} />

              <h3 className="text-xl font-bold text-white">
                SoloTerrenos
              </h3>
            </div>

            <p className="max-w-md leading-relaxed text-gray-400">
              Plataforma especializada en la compra, venta y renta de terrenos.
              Conectamos inversionistas con oportunidades inmobiliarias en todo
              México.
            </p>

            <div className="mt-6 flex gap-4">
              <a
                href="#"
                aria-label="Facebook"
                className="cursor-pointer rounded-lg bg-white/10 p-2 transition hover:bg-green-500"
              >
                <Facebook size={18} />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="cursor-pointer rounded-lg bg-white/10 p-2 transition hover:bg-green-500"
              >
                <Instagram size={18} />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="cursor-pointer rounded-lg bg-white/10 p-2 transition hover:bg-green-500"
              >
                <Twitter size={18} />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="cursor-pointer rounded-lg bg-white/10 p-2 transition hover:bg-green-500"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="mb-5 font-semibold text-white">
              Legal
            </h4>

            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacidad" className="transition hover:text-green-400">
                  Aviso de privacidad
                </Link>
              </li>

              <li>
                <Link href="/terminos" className="transition hover:text-green-400">
                  Términos y condiciones
                </Link>
              </li>

              <li>
                <Link href="/cookies" className="transition hover:text-green-400">
                  Política de cookies
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="mb-5 font-semibold text-white">
              Vender
            </h4>

            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/suscripciones" className="transition hover:text-green-400">
                  Publicar terreno
                </Link>
              </li>

              <li>
                <Link href="/planes" className="transition hover:text-green-400">
                  Planes y precios
                </Link>
              </li>

              <li>
                <Link href="/guia-vendedores" className="transition hover:text-green-400">
                  Guía para vendedores
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="mb-5 font-semibold text-white">
              Empresa
            </h4>

            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/nosotros" className="transition hover:text-green-400">
                  Sobre nosotros
                </Link>
              </li>

              <li>
                <Link href="/contacto" className="transition hover:text-green-400">
                  Contacto
                </Link>
              </li>

              <li>
                <Link href="/blog" className="transition hover:text-green-400">
                  Blog
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-gray-400 md:flex-row">
          <p>
            © {new Date().getFullYear()} SoloTerrenos. Todos los derechos reservados.
          </p>

          <div className="flex gap-6">
            <Link href="/privacidad" className="transition hover:text-green-400">
              Privacidad
            </Link>

            <Link href="/terminos" className="transition hover:text-green-400">
              Términos
            </Link>

            <Link href="/cookies" className="transition hover:text-green-400">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}