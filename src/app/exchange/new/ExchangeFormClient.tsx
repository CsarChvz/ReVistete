// app/exchange/new/ExchangeFormClient.tsx
"use client";
import React, { useState } from 'react';
import { ClothingItem } from '@prisma/client';
import { Button, Card, CardBody, CardHeader, Image, RadioGroup, Radio, Divider } from '@nextui-org/react';
import { initiateExchangeOffer } from '@/app/actions/exchangeActions'; // Importa la acción
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify'; // Para notificaciones (asegúrate de tenerlo configurado)
import LoadingSpinner from '@/components/LoadingSpinner'; // Para el spinner del botón
import MemberLink from '@/components/MemberLink'; // Para el enlace al perfil del miembro

type Props = {
  // Asegúrate de que targetClothingItem incluya la info del miembro
  targetClothingItem: ClothingItem & { member: { userId: string; name: string; image: string | null; city: string; country: string; }; };
  userClothingInventory: ClothingItem[]; // Solo las prendas que el usuario puede ofrecer
};

export default function ExchangeFormClient({
  targetClothingItem,
  userClothingInventory,
}: Props) {
  const [selectedOfferingItemId, setSelectedOfferingItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Para el estado del botón
  const router = useRouter();

  const handleInitiateExchange = async () => {
    if (!selectedOfferingItemId) {
      toast.error("Por favor, selecciona una prenda de tu inventario para ofrecer.");
      return;
    }

    setIsLoading(true);
    try {
      const newOffer = await initiateExchangeOffer(
        selectedOfferingItemId,
        targetClothingItem.id
      );
      toast.success("¡Oferta de intercambio enviada con éxito!");
      router.push(`/exchange/${newOffer.id}`); // Redirige a la página de detalles de la oferta
    } catch (error: any) {
      console.error("Error al iniciar el intercambio:", error);
      toast.error(error.message || "Error al enviar la oferta de intercambio.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Iniciar Nuevo Intercambio</h1>
      <p className="text-lg text-gray-600 mb-8">
        Estás a punto de ofrecer una prenda de tu inventario a cambio de:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Prenda que el usuario desea (Target Item) */}
        <Card className="p-4 shadow-md bg-blue-50">
          <CardHeader className="flex flex-col items-start pb-0">
            <h2 className="text-xl font-bold">Prenda que deseas:</h2>
          </CardHeader>
          <CardBody className="py-2">
            <Image
              src={targetClothingItem.imageUrl || "/images/clothing-placeholder.png"}
              alt={targetClothingItem.name}
              className="object-cover w-full h-48 rounded-lg mb-4"
            />
            <h3 className="text-2xl font-semibold">{targetClothingItem.name}</h3>
            <p className="text-lg text-gray-600">{targetClothingItem.category} - {targetClothingItem.size}</p>
            <p className="text-sm text-neutral-500 mt-2">
              De: <MemberLink memberId={targetClothingItem.member.userId} name={targetClothingItem.member.name} />
            </p>
          </CardBody>
        </Card>

        {/* Selector de prenda a ofrecer (Offering Item) */}
        <Card className="p-4 shadow-md bg-green-50">
          <CardHeader className="flex flex-col items-start pb-0">
            <h2 className="text-xl font-bold">Selecciona tu prenda para ofrecer:</h2>
            {userClothingInventory.length === 0 && (
              <p className="text-sm text-red-500">No tienes prendas disponibles en tu inventario para ofrecer.</p>
            )}
          </CardHeader>
          <CardBody className="overflow-y-auto max-h-[400px]">
            <RadioGroup
              value={selectedOfferingItemId || undefined}
              onValueChange={(value) => setSelectedOfferingItemId(value)}
              className="gap-4"
            >
              {userClothingInventory.map((item) => (
                <Radio
                  key={item.id}
                  value={item.id}
                  color="primary"
                  className="items-start"
                  // Deshabilitar la opción si el item ofrecido es el mismo que el solicitado (aunque ya se valida en la acción)
                  // También podrías ocultarlo.
                  isDisabled={item.id === targetClothingItem.id}
                >
                  <div className="flex items-center gap-4 py-2">
                    <Image
                      src={item.imageUrl || "/images/clothing-placeholder.png"}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-lg">{item.name}</span>
                      <span className="text-sm text-gray-500">{item.category} - {item.size}</span>
                    </div>
                  </div>
                </Radio>
              ))}
            </RadioGroup>
          </CardBody>
        </Card>
      </div>

      <Divider className="my-6" />

      <div className="flex justify-end gap-4">
        <Button
          variant="bordered"
          onClick={() => router.back()} // Volver a la página anterior
        >
          Cancelar
        </Button>
        <Button
          color="primary"
          onClick={handleInitiateExchange}
          isDisabled={!selectedOfferingItemId || isLoading || userClothingInventory.length === 0}
          isLoading={isLoading}
        >
          {isLoading ? "Enviando Oferta..." : "Enviar Oferta de Intercambio"}
        </Button>
      </div>
    </div>
  );
}