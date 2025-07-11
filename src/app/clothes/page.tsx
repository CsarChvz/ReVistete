// app/clothes/page.tsx
import React from "react";
import { getAvailableClothes, GetClothesParams } from "@/app/actions/clothesActions"; // Asegúrate de que la ruta sea correcta
import PaginationComponent from "@/components/PaginationComponent";
import EmptyState from "@/components/EmptyState";
import ClothesSidebar from "./ClothesSidebar";
import ClothingCard from "./ClothingCard";

export default async function ClothesPage({
  searchParams,
}: {
  searchParams: GetClothesParams;
}) {
  const { items: clothes, totalCount } =
    await getAvailableClothes(searchParams);

  // No necesitamos likeIds aquí directamente, a menos que quieras
  // que los usuarios puedan "likear" prendas, lo cual es otra funcionalidad.


  return (
    <div className="grid grid-cols-12 gap-8"> {/* Usa un grid para la sidebar y el contenido */}
      <div className="col-span-3"> {/* Columna para los filtros/sidebar */}
        <ClothesSidebar /> {/* Este componente manejará los filtros */}
      </div>
      <div className="col-span-9"> {/* Columna para la lista de prendas */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8"> {/* Ajusta el grid para las cards */}
          {clothes.map((clothingItem) => (
            <ClothingCard
              clothingItem={clothingItem}
              key={clothingItem.id}
            />
          ))}
        </div>
        <PaginationComponent
          totalCount={totalCount}
        />
      </div>
    </div>
  );
}