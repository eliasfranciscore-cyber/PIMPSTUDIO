/** @type {import('tailwindcss').Config} */
export default {
  // Escaneo limitado SOLO al componente de la lámpara: Tailwind genera únicamente
  // las utilidades que usa la lámpara, sin tocar el resto del sitio (que usa CSS
  // propio en pimp.css/brunetti.css).
  content: ["./src/components/ui/lamp.jsx"],
  // CRÍTICO: preflight (reset base de Tailwind) DESACTIVADO para no resetear ni
  // romper los estilos existentes del sitio.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      backgroundImage: {
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
}
