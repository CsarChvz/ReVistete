// app/exchange/[offerId]/ExchangeDetailClientCard.tsx
"use client";
import React, { useState } from 'react';
import {
  acceptExchangeOffer,
  rejectExchangeOffer,
  cancelExchangeOffer,
  completeExchangeOffer,
  getExchangeOfferDetails // Para refrescar los datos después de una acción
} from '@/app/actions/exchangeActions';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardFooter, Image, Divider, Spinner } from '@nextui-org/react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { ExchangeOffer, ExchangeStatus } from '@prisma/client'; // Importa los tipos y enums
import MemberLink from '@/components/MemberLink';

// Definir el tipo de la oferta con las relaciones incluidas
type ExchangeOfferWithRelations = ExchangeOffer & {
  offeringMember: { userId: string; name: string; image: string | null; city: string; country: string; } | null;
  receivingMember: { userId: string; name: string; image: string | null; city: string; country: string; } | null;
  offeredItem: { id: string; name: string; imageUrl: string | null; status: string; member: { userId: string; name: string; } | null; } | null;
  requestedItem: { id: string; name: string; imageUrl: string | null; status: string; member: { userId: string; name: string; } | null; } | null;
};

type Props = {
  offer: ExchangeOfferWithRelations;
  currentUserId: string | null;
};

export default function ExchangeDetailClientCard({ initialOffer, currentUserId }: { initialOffer: ExchangeOfferWithRelations, currentUserId: string | null }) {
  const [offer, setOffer] = useState<ExchangeOfferWithRelations>(initialOffer);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  // Calcular roles y acciones permitidas
  const isOfferingMember = offer.offeringMember?.userId === currentUserId;
  const isReceivingMember = offer.receivingMember?.userId === currentUserId;

  const canAcceptOrReject = isReceivingMember && offer.status === ExchangeStatus.PENDING;
  const canCancel = isOfferingMember && offer.status === ExchangeStatus.PENDING;
  // Solo se puede completar si está aceptada y es uno de los dos miembros involucrados
  const canComplete = (isOfferingMember || isReceivingMember) && offer.status === ExchangeStatus.ACCEPTED;


  const handleAction = async (action: 'accept' | 'reject' | 'cancel' | 'complete') => {
    setActionLoading(true);
    try {
      let message = '';
      let updatedOffer;

      switch (action) {
        case 'accept':
          updatedOffer = await acceptExchangeOffer(offer.id);
          message = "Oferta aceptada con éxito. ¡Es hora de coordinar el intercambio!";
          break;
        case 'reject':
          updatedOffer = await rejectExchangeOffer(offer.id);
          message = "Oferta rechazada. Las prendas vuelven a estar disponibles.";
          break;
        case 'cancel':
          updatedOffer = await cancelExchangeOffer(offer.id);
          message = "Oferta cancelada. Las prendas vuelven a estar disponibles.";
          break;
        case 'complete':
          updatedOffer = await completeExchangeOffer(offer.id);
          message = "¡Intercambio completado con éxito! Las prendas han cambiado de dueño.";
          break;
        default:
          throw new Error('Acción no reconocida.');
      }

      if (updatedOffer) {
        // Refrescar los datos de la oferta en el estado local
        const refetchedOffer = await getExchangeOfferDetails(offer.id);
        if (refetchedOffer) {
          setOffer(refetchedOffer as ExchangeOfferWithRelations); // Casting para asegurar el tipo
        }
        toast.success(message);
        router.refresh(); // Para revalidar el cache de datos en el lado del servidor y reflejar cambios en otras páginas
      }
    } catch (error: any) {
      console.error(`Error al ${action} la oferta:`, error);
      toast.error(error.message || `Error al ${action} la oferta.`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto my-10 p-6 shadow-lg">
      <CardBody>
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-4xl font-bold mb-2 text-center">Detalles de la Oferta de Intercambio</h1>
          <div className="flex items-center gap-2 text-xl font-semibold">
            <span>Estado:</span>
            <span className={`
              ${offer.status === ExchangeStatus.PENDING ? 'text-yellow-600' : ''}
              ${offer.status === ExchangeStatus.ACCEPTED ? 'text-green-600' : ''}
              ${offer.status === ExchangeStatus.REJECTED ? 'text-red-600' : ''}
              ${offer.status === ExchangeStatus.CANCELED ? 'text-gray-600' : ''}
              ${offer.status === ExchangeStatus.COMPLETED ? 'text-blue-600' : ''}
            `}>
              {offer.status}
            </span>
          </div>
          <p className="text-sm text-default-500 mt-1">
            Enviada el: {new Date(offer.createdAt).toLocaleDateString()}
            {offer.status !== ExchangeStatus.PENDING && ` (Última actualización: ${new Date(offer.updatedAt).toLocaleDateString()})`}
          </p>
        </div>

        <Divider className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Prenda Ofrecida */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Prenda Ofrecida:</h2>
            <Image
              src={offer.offeredItem?.imageUrl || "/images/clothing-placeholder.png"}
              alt={offer.offeredItem?.name || 'Prenda Ofrecida'}
              className="object-cover w-full h-56 rounded-lg mb-4"
            />
            <h3 className="text-2xl font-semibold text-center">{offer.offeredItem?.name || 'Prenda Desconocida'}</h3>
            <p className="text-lg text-gray-600 mt-1">{offer.offeredItem?.category || ''} - {offer.offeredItem?.size || ''}</p>
            <p className="text-sm text-neutral-500 mt-2 text-center">
              De: <MemberLink memberId={offer.offeringMember?.userId || ''} name={offer.offeringMember?.name || 'Desconocido'} />
            </p>
            {offer.offeredItem?.status && <p className="text-xs text-gray-400 mt-1">Estado de la prenda: {offer.offeredItem.status}</p>}
          </div>

          {/* Icono de Intercambio */}
          <div className="flex items-center justify-center p-4">
            <span className="text-5xl text-gray-500">🔄</span>
          </div>

          {/* Prenda Solicitada */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Prenda Solicitada:</h2>
            <Image
              src={offer.requestedItem?.imageUrl || "/images/clothing-placeholder.png"}
              alt={offer.requestedItem?.name || 'Prenda Solicitada'}
              className="object-cover w-full h-56 rounded-lg mb-4"
            />
            <h3 className="text-2xl font-semibold text-center">{offer.requestedItem?.name || 'Prenda Desconocida'}</h3>
            <p className="text-lg text-gray-600 mt-1">{offer.requestedItem?.category || ''} - {offer.requestedItem?.size || ''}</p>
            <p className="text-sm text-neutral-500 mt-2 text-center">
              De: <MemberLink memberId={offer.receivingMember?.userId || ''} name={offer.receivingMember?.name || 'Desconocido'} />
            </p>
            {offer.requestedItem?.status && <p className="text-xs text-gray-400 mt-1">Estado de la prenda: {offer.requestedItem.status}</p>}
          </div>
        </div>
      </CardBody>
      <CardFooter className="flex flex-col items-center mt-6 border-t pt-4">
        <div className="flex justify-between items-center w-full gap-4 mb-4">
          <Button
            as={Link}
            href="/exchange/my-offers"
            variant="bordered"
            color="default"
          >
            &larr; Volver a Mis Ofertas
          </Button>

          {/* Botones de Acción Condicionales */}
          <div className="flex gap-2">
            {canAcceptOrReject && (
              <>
                <Button color="success" onClick={() => handleAction('accept')} isDisabled={actionLoading}>
                  {actionLoading ? <Spinner size="sm" color="white" /> : "Aceptar Oferta"}
                </Button>
                <Button color="danger" onClick={() => handleAction('reject')} isDisabled={actionLoading}>
                  {actionLoading ? <Spinner size="sm" color="white" /> : "Rechazar Oferta"}
                </Button>
              </>
            )}
            {canCancel && (
              <Button color="warning" onClick={() => handleAction('cancel')} isDisabled={actionLoading}>
                {actionLoading ? <Spinner size="sm" color="white" /> : "Cancelar Oferta"}
              </Button>
            )}
            {canComplete && (
              <Button color="primary" onClick={() => handleAction('complete')} isDisabled={actionLoading}>
                {actionLoading ? <Spinner size="sm" color="white" /> : "Marcar como Completado"}
              </Button>
            )}
          </div>
        </div>
        {actionLoading && <p className="text-sm text-gray-500 mt-2">Procesando acción...</p>}
      </CardFooter>
    </Card>
  );
}