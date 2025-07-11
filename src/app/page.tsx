import { auth } from "@/auth";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import dynamic from "next/dynamic";

const DynamicHeartAnimation = dynamic(
  () =>
    import(
      "@/components/animations/HeartAnimation" // Podrías considerar renombrar o adaptar esta animación a algo más "circular" o "verde" si los corazones no encajan con la nueva marca. Por ahora la dejamos.
    ),
  { ssr: false }
);
const DynamicAnimatedBackground = dynamic(
  () =>
    import(
      "@/components/animations/AnimatedBackground"
    ),
  { ssr: false }
);
const DynamicAnimatedStats = dynamic(
  () =>
    import(
      "@/components/animations/AnimatedStats" // Si esta animación contiene texto, deberás modificarla internamente.
    ),
  { ssr: false }
);
const DynamicAnimatedFeatures = dynamic(
  () =>
    import(
      "@/components/animations/AnimatedFeatures" // Si esta animación contiene texto, deberás modificarla internamente.
    ),
  { ssr: false }
);

export default async function Home() {
  const session = await auth();

  return (
    // This negative margin trick overrides the container mx-auto from layout.tsx
    <div className="-mx-[calc(50vw-50%)] w-screen -mt-[calc(1.25rem)]">
      {/* Hero Section */}
      <div className="w-full min-h-screen relative overflow-hidden bg-gradient-to-b from-emerald-100 via-emerald-50 to-white"> {/* Colores más asociados a sostenibilidad */}
        <DynamicAnimatedBackground />
        {/* Considerar si HeartAnimation sigue siendo relevante o adaptarla/reemplazarla */}
        <DynamicHeartAnimation /> 

        <div className="w-full max-w-7xl mx-auto px-4 py-20 flex flex-col justify-center items-center min-h-screen">
          <div className="text-center space-y-8 w-full max-w-4xl">
            <h1 className="text-6xl md:text-7xl font-bold">
              <span className="inline-block bg-gradient-to-r from-emerald-500 to-green-700 text-transparent bg-clip-text transform hover:scale-105 transition-transform cursor-default"> {/* Gradiente verde */}
                Intercambia, Renueva, Sostenible
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Dale una nueva vida a tu ropa y encuentra tesoros únicos. Únete a una comunidad que valora la moda consciente y el planeta.
            </p>

            <div className="flex flex-col items-center gap-8 mt-12">
              {session ? (
                <Button
                  as={Link}
                  href="/clothes" // Asumiendo que esta es la ruta para ver las prendas disponibles para intercambio
                  className="bg-gradient-to-r from-emerald-500 to-green-700 text-white text-xl px-12 py-8 rounded-full hover:opacity-90 transform hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                >
                  Explorar Ropa para Intercambio
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    as={Link}
                    href="/register"
                    className="bg-gradient-to-r from-emerald-500 to-green-700 text-white text-xl px-12 py-8 rounded-full hover:opacity-90 transform hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                  >
                    Regístrate y Empieza a Intercambiar
                  </Button>
                  <Button
                    as={Link}
                    href="/login"
                    className="bg-white text-emerald-600 border-2 border-emerald-600 text-xl px-12 py-8 rounded-full hover:bg-emerald-50 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                  >
                    Iniciar Sesión
                  </Button>
                </div>
              )}
            </div>

            <DynamicAnimatedStats />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full min-h-screen bg-white relative overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 py-20 flex flex-col justify-center items-center min-h-screen">
          <div className="text-center w-full">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-emerald-500 to-green-700 text-transparent bg-clip-text w-full">
              ¿Por Qué Unirte a Nuestra Comunidad de Intercambio?
            </h2>
            <DynamicAnimatedFeatures />
            <p className="text-lg text-gray-700 mt-12 max-w-3xl mx-auto">
              Nuestra plataforma facilita un proceso de intercambio de ropa justo y transparente, promoviendo un consumo más responsable y una moda más ética para un futuro mejor.
            </p>
            {/* Puedes añadir más texto o un botón aquí */}
            <Button
              as={Link}
              href={session ? "/clothes" : "/register"}
              className="mt-8 bg-gradient-to-r from-emerald-600 to-green-800 text-white text-lg px-8 py-4 rounded-full hover:opacity-90 transform hover:scale-105 transition-all shadow-md"
            >
              ¡Comienza tu Intercambio Sostenible Hoy!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}