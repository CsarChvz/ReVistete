// app/clothes/ClothingCard.tsx
"use client";
import {
  Card,
  CardFooter,
  Image,
} from "@nextui-org/react";
import { ClothingItem } from "@prisma/client";
import Link from "next/link";
import React from "react";

type Props = {
  clothingItem: ClothingItem;
};

export default function ClothingCard({
  clothingItem,
}: Props) {
  return (
    <Card
      fullWidth
      as={Link}
      href={`/clothes/${clothingItem.id}`} // Ruta para ver los detalles de la prenda
      isPressable
    >
      <Image
        isZoomed
        alt={clothingItem.name}
        width={300} // Ajusta el tamaño según sea necesario
        src={clothingItem.imageUrl || "/images/clothing-placeholder.png"} // Un placeholder para prendas sin imagen
        className="aspect-square object-cover"
      />
      <CardFooter className="flex justify-start bg-black overflow-hidden absolute bottom-0 z-10 bg-dark-gradient">
        <div className="flex flex-col text-white">
          <span className="font-semibold">
            {clothingItem.name}
          </span>
          <span className="text-sm">
            {clothingItem.category} - {clothingItem.size}
          </span>
          {/* Opcional: Mostrar el nombre del dueño si es necesario */}
          {/* <span className="text-xs">De: {clothingItem.member.name}</span> */}
        </div>
      </CardFooter>
    </Card>
  );
}