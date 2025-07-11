// app/dashboard/clothing/page.tsx
// Este archivo representa una página en tu aplicación Next.js

import RegisterClothingForm from "./RegisterNewClotheForm";


export default function ClothingPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      {/* Puedes añadir un título o descripción para la página si lo deseas */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Gestionar Prendas</h1>
        <p className="text-lg text-gray-600 mt-2">Añade o edita tus artículos de ropa.</p>
      </div>

      {/* Renderiza el componente del formulario */}
      <RegisterClothingForm />
    </div>
  );
}