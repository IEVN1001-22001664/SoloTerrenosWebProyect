"use client";

import Link from "next/link";
import { MapPin, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-[#0c1f1a] text-gray-300 pt-20 pb-10">

      <div className="max-w-7xl mx-auto px-6">

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">

          {/* LOGO */}
          <motion.div
            initial={{opacity:0,y:30}}
            whileInView={{opacity:1,y:0}}
            transition={{duration:0.5}}
            viewport={{once:true}}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">

              <MapPin className="text-green-400" size={26} />

              <h3 className="text-xl font-bold text-white">
                SoloTerrenos
              </h3>

            </div>

            <p className="text-gray-400 leading-relaxed max-w-md">
              Plataforma especializada en la compra, venta y renta de terrenos.
              Conectamos inversionistas con oportunidades inmobiliarias en todo
              México.
            </p>

            {/* SOCIAL */}
            <div className="flex gap-4 mt-6">

              <div className="p-2 bg-white/10 rounded-lg hover:bg-green-500 transition cursor-pointer">
                <Facebook size={18}/>
              </div>

              <div className="p-2 bg-white/10 rounded-lg hover:bg-green-500 transition cursor-pointer">
                <Instagram size={18}/>
              </div>

              <div className="p-2 bg-white/10 rounded-lg hover:bg-green-500 transition cursor-pointer">
                <Twitter size={18}/>
              </div>

              <div className="p-2 bg-white/10 rounded-lg hover:bg-green-500 transition cursor-pointer">
                <Linkedin size={18}/>
              </div>

            </div>

          </motion.div>

          {/* COMPRAR */}
          <motion.div
            initial={{opacity:0,y:30}}
            whileInView={{opacity:1,y:0}}
            transition={{delay:0.1}}
            viewport={{once:true}}
          >

            <h4 className="text-white font-semibold mb-5">
              Legal
            </h4>

            <ul className="space-y-3 text-sm">

              <li>
                <Link href="/privacidad" className="hover:text-green-400 transition">
                  Aviso de privacidad
                </Link>
              </li>

              <li>
                <Link href="/terminos" className="hover:text-green-400 transition">
                  Términos y condiciones
                </Link>
              </li>

              <li>
                <Link href="/politicaCookies" className="hover:text-green-400 transition">
                  Política de cookies
                </Link>
              </li>

            </ul>

          </motion.div>

          {/* VENDE */}
          <motion.div
            initial={{opacity:0,y:30}}
            whileInView={{opacity:1,y:0}}
            transition={{delay:0.2}}
            viewport={{once:true}}
          >

            <h4 className="text-white font-semibold mb-5">
              Vender
            </h4>

            <ul className="space-y-3 text-sm">

              <li>
                <Link href="/suscripciones" className="hover:text-green-400 transition">
                  Publicar terreno
                </Link>
              </li>

              <li>
                <Link href="/planes" className="hover:text-green-400 transition">
                  Planes y precios
                </Link>
              </li>

              <li>
                <Link href="/vendedores" className="hover:text-green-400 transition">
                  Guía para vendedores
                </Link>
              </li>

            </ul>

          </motion.div>

          {/* EMPRESA */}
          <motion.div
            initial={{opacity:0,y:30}}
            whileInView={{opacity:1,y:0}}
            transition={{delay:0.3}}
            viewport={{once:true}}
          >

            <h4 className="text-white font-semibold mb-5">
              Empresa
            </h4>

            <ul className="space-y-3 text-sm">

              <li>
                <Link href="/about" className="hover:text-green-400 transition">
                  Sobre nosotros
                </Link>
              </li>

              <li>
                <Link href="/contacto" className="hover:text-green-400 transition">
                  Contacto
                </Link>
              </li>

              <li>
                <Link href="/blog" className="hover:text-green-400 transition">
                  Blog
                </Link>
              </li>

            </ul>

          </motion.div>

        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">

          <p>
            © {new Date().getFullYear()} SoloTerrenos. Todos los derechos reservados.
          </p>

          <div className="flex gap-6">

            <Link href="/privacidad" className="hover:text-green-400 transition">
              Privacidad
            </Link>

            <Link href="/terminos" className="hover:text-green-400 transition">
              Términos
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}