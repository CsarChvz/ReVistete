// app/exchange/my-offers/page.tsx
import React from 'react';
import { getAuthUserId } from '@/app/actions/authActions';
import { getUserExchangeOffers } from '@/app/actions/exchangeActions'; // Importa la acción
import EmptyState from '@/components/EmptyState';
import { Card, CardHeader, CardBody, Divider, Image, Button } from '@nextui-org/react'; // Asegúrate de importar Button
import Link from 'next/link';
import { ExchangeStatus } from '@prisma/client'; // Importa el enum para comparar estados
import MemberLink from '@/components/MemberLink'; // Para enlaces a perfiles de miembros

export default async function MyOffersPage() {
  const userId = await getAuthUserId();

  if (!userId) {
    return <EmptyState />;
  }

  // Obtener las ofertas enviadas y recibidas por el usuario autenticado
  const { sent: sentOffers, received: receivedOffers } = await getUserExchangeOffers(userId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-8">Mis Ofertas de Intercambio</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Ofertas Enviadas ({sentOffers.length})</h2>
        {sentOffers.length === 0 ? (
          <EmptyState  />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sentOffers.map(offer => (
              <Card key={offer.id} className="p-4 shadow-md">
                <CardHeader className="flex flex-col items-start pb-0">
                  <Link href={`/exchange/${offer.id}`} className="text-lg font-semibold text-blue-600 hover:underline">
                    Oferta a: <MemberLink memberId={offer.receivingMember?.userId || ''} name={offer.receivingMember?.name || 'Usuario Desconocido'} />
                  </Link>
                  <small className="text-default-500">Estado: <span className={`font-semibold ${
                    offer.status === ExchangeStatus.PENDING ? 'text-yellow-600' :
                    offer.status === ExchangeStatus.ACCEPTED ? 'text-green-600' :
                    offer.status === ExchangeStatus.REJECTED ? 'text-red-600' :
                    offer.status === ExchangeStatus.CANCELED ? 'text-gray-600' :
                    'text-blue-600' // COMPLETED
                  }`}>{offer.status}</span></small>
                </CardHeader>
                <CardBody className="py-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <Image src={offer.offeredItem?.imageUrl || '/images/clothing-placeholder.png'} alt={offer.offeredItem?.name || 'Prenda Ofrecida'} width={80} height={80} className="rounded-md object-cover" />
                      <span className="mt-2 text-center truncate w-full">{offer.offeredItem?.name || 'Prenda Desconocida'}</span>
                      <small className="text-default-400">(Tu prenda)</small>
                    </div>
                    <span className="text-xl mx-4 text-gray-500">🔄</span>
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <Image src={offer.requestedItem?.imageUrl || '/images/clothing-placeholder.png'} alt={offer.requestedItem?.name || 'Prenda Solicitada'} width={80} height={80} className="rounded-md object-cover" />
                      <span className="mt-2 text-center truncate w-full">{offer.requestedItem?.name || 'Prenda Desconocida'}</span>
                      <small className="text-default-400">(Prenda solicitada)</small>
                    </div>
                  </div>
                </CardBody>
                <Divider className="mt-4" />
                <div className="mt-4 flex justify-end">
                  <Button as={Link} href={`/exchange/${offer.id}`} color="primary" variant="flat" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Divider className="my-12" />

      <section>
        <h2 className="text-2xl font-bold mb-6">Ofertas Recibidas ({receivedOffers.length})</h2>
        {receivedOffers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receivedOffers.map(offer => (
              <Card key={offer.id} className="p-4 shadow-md">
                <CardHeader className="flex flex-col items-start pb-0">
                  <Link href={`/exchange/${offer.id}`} className="text-lg font-semibold text-blue-600 hover:underline">
                    Oferta de: <MemberLink memberId={offer.offeringMember?.userId || ''} name={offer.offeringMember?.name || 'Usuario Desconocido'} />
                  </Link>
                  <small className="text-default-500">Estado: <span className={`font-semibold ${
                    offer.status === ExchangeStatus.PENDING ? 'text-yellow-600' :
                    offer.status === ExchangeStatus.ACCEPTED ? 'text-green-600' :
                    offer.status === ExchangeStatus.REJECTED ? 'text-red-600' :
                    offer.status === ExchangeStatus.CANCELED ? 'text-gray-600' :
                    'text-blue-600' // COMPLETED
                  }`}>{offer.status}</span></small>
                </CardHeader>
                <CardBody className="py-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <Image src={offer.offeredItem?.imageUrl || '/images/clothing-placeholder.png'} alt={offer.offeredItem?.name || 'Prenda Ofrecida'} width={80} height={80} className="rounded-md object-cover" />
                      <span className="mt-2 text-center truncate w-full">{offer.offeredItem?.name || 'Prenda Desconocida'}</span>
                      <small className="text-default-400">(Prenda Ofrecida)</small>
                    </div>
                    <span className="text-xl mx-4 text-gray-500">🔄</span>
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <Image src={offer.requestedItem?.imageUrl || '/images/clothing-placeholder.png'} alt={offer.requestedItem?.name || 'Prenda Solicitada'} width={80} height={80} className="rounded-md object-cover" />
                      <span className="mt-2 text-center truncate w-full">{offer.requestedItem?.name || 'Prenda Desconocida'}</span>
                      <small className="text-default-400">(Tu prenda)</small>
                    </div>
                  </div>
                </CardBody>
                <Divider className="mt-4" />
                <div className="mt-4 flex justify-end">
                  <Button as={Link} href={`/exchange/${offer.id}`} color="primary" variant="flat" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}   