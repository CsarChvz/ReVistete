// app/clothes/[id]/ClothingDetailCard.tsx
"use client";
import React from 'react';
import { Button, Card, CardBody, CardFooter, Image, Divider } from '@nextui-org/react';
import { ClothingItem } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MemberLink from '@/components/MemberLink';

type Props = {
  clothingItem: ClothingItem & {
    // CORRECCIÓN AQUÍ: Cambia image?: string | undefined; a image: string | null;
    // Opcionalmente, puedes dejarlo como image?: string | null; si también podría ser undefined
    // PERO, para la imagen de un miembro cargada a través de `include`, si no tiene valor, Prisma enviará `null`.
    // Por lo tanto, `string | null` es el tipo más preciso aquí.
    member: { userId: string; name: string; image: string | null; city: string; country: string; };
  };
  isOwner: boolean;
  currentUserId: string;
};

export default function ClothingDetailCard({ clothingItem, isOwner, currentUserId }: Props) {
  const router = useRouter();

  const handleInitiateExchange = () => {
    router.push(`/exchange/new?targetClotheId=${clothingItem.id}`);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto my-10 p-6 shadow-lg">
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sección de Imágenes */}
          <div className="flex flex-col gap-4">
            <Image
              isZoomed
              alt={clothingItem.name}
              src={clothingItem.imageUrl || "/images/clothing-placeholder.png"}
              className="object-cover w-full h-auto max-h-96 rounded-lg"
            />
            <div className="grid grid-cols-4 gap-2">
              {/* Esqueleto para múltiples imágenes (si las tuvieras) */}
            </div>
          </div>

          {/* Sección de Detalles */}
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold">{clothingItem.name}</h1>
            <p className="text-xl text-gray-600">{clothingItem.category} - {clothingItem.size}</p>
            <Divider />
            <p className="text-lg">{clothingItem.description || "Sin descripción."}</p>
            <p className="text-md text-gray-700">Condición: {clothingItem.condition || "No especificada"}</p>
            <p className="text-md text-gray-700">Estado: {clothingItem.status}</p>

            <Divider className="my-4" />

            {/* Información del Dueño */}
            <div className="flex items-center gap-3">
              <Image
                // Ahora clothingItem.member.image es de tipo string | null,
                // y el fallback || "/images/user.png" lo maneja correctamente.
                src={clothingItem.member.image || "/images/user.png"}
                alt={clothingItem.member.name}
                width={50}
                height={50}
                className="rounded-full object-cover"
              />
              <div>
                <span className="text-lg font-semibold">
                  De: <MemberLink memberId={clothingItem.member.userId} name={clothingItem.member.name} />
                </span>
                <p className="text-sm text-neutral-500">{clothingItem.member.city}, {clothingItem.member.country}</p>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
      <CardFooter className="flex justify-between items-center mt-6 border-t pt-4">
        <Button
          as={Link}
          href="/clothes"
          variant="bordered"
          color="default"
        >
          &larr; Volver a las prendas
        </Button>

        {!isOwner && (
          <Button
            color="primary"
            onClick={handleInitiateExchange}
          >
            Ofrecer Intercambio
          </Button>
        )}
        {isOwner && (
          <Button
            color="secondary"
            as={Link}
            href={`/inventory/${clothingItem.id}/edit`}
          >
            Editar Prenda
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}