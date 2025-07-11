// app/clothes/[id]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { getClothingDetails } from "@/app/actions/clothesActions";
import EmptyState from "@/components/EmptyState";
import { getAuthUserId } from "@/app/actions/authActions";
import { getMemberByUserId } from "@/app/actions/memberActions"; // Importa la nueva acción
import ClothingDetailCard from "./ClothingDetailCard";

type Props = {
  params: {
    id: string;
  };
};

export default async function ClothingDetailsPage({ params }: Props) {
  const clothingItem = await getClothingDetails(params.id);

  if (!clothingItem) {
    return <EmptyState />;
  }

  const currentUserId = await getAuthUserId();
  
  // Paso 1: Obtener el miembro asociado al userId autenticado
  let currentMember = null;
  if (currentUserId) { // Asegúrate de que hay un userId autenticado antes de intentar buscar el miembro
    currentMember = await getMemberByUserId(currentUserId);
  }

  // Paso 2: Comparar el memberId de la prenda con el id del miembro autenticado
  // Es importante comparar los IDs de miembro (la relación en ClothingItem es memberId, que apunta a Member.id)
  const isOwner = currentMember ? clothingItem.memberId === currentMember.id : false;

  return (
    <div className="container mx-auto px-4 py-8">
      <ClothingDetailCard clothingItem={clothingItem} isOwner={isOwner} currentUserId={currentUserId} />
    </div>
  );
}