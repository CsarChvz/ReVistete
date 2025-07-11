// app/inventory/page.tsx
import React from "react";
import { getUserClothingInventory } from "@/app/actions/clothesActions"; // Asegúrate de la ruta correcta
import ClothingCard from "@/app/clothes/ClothingCard"; // Reutilizamos el componente de ClothingCard
import PaginationComponent from "@/components/PaginationComponent";
import EmptyState from "@/components/EmptyState";
import { getAuthUserId } from "@/app/actions/authActions"; // Necesitamos el userId del usuario autenticado
import { Button } from "@nextui-org/react";
import Link from "next/link";

export default async function InventoryPage({
  searchParams,
}: {
  // Para el inventario del usuario, la paginación es el filtro principal.
  // Podrías añadir filtros de categoría/talla si quisieras que el usuario filtre su propio inventario.
  searchParams: {
    pageNumber?: string;
    pageSize?: string;
  };
}) {
  const userId = await getAuthUserId(); // Obtener el ID del usuario autenticado


  // Prepara los parámetros para la función de obtener inventario
  const pageNumber = searchParams.pageNumber || '1';
  const pageSize = searchParams.pageSize || '12';

  // Llama a la acción para obtener las prendas del usuario
  const { items: userClothes, totalCount } =
    await getUserClothingInventory(userId, { pageNumber, pageSize });


  return (
    <>
      <h1 className="text-3xl font-semibold mb-6">Mi Inventario de Ropa</h1>
          <Button
            as={Link}
            href="/clothes/new"
            color="primary"
            className="bg-gradient-to-r from-emerald-500 to-green-700 text-white shadow-lg"
            size="lg"
          >
            Registrar Nueva Prenda
          </Button>
      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {userClothes.map((clothingItem) => (
          <ClothingCard
            clothingItem={clothingItem}
            key={clothingItem.id}
          />
        ))}
      </div>
      <PaginationComponent
        totalCount={totalCount}
      />
    </>
  );
}