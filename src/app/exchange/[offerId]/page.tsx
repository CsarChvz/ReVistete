// app/exchange/[offerId]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import { getExchangeOfferDetails } from '@/app/actions/exchangeActions';
import { getAuthUserId } from '@/app/actions/authActions'; // Para obtener el ID del usuario autenticado
import EmptyState from '@/components/EmptyState';
import ExchangeDetailClientCard from './ExchangeDetailClientCard'; // Nuestro componente cliente

type Props = {
  params: {
    offerId: string;
  };
};

export default async function ExchangeDetailsPage({ params }: Props) {
  const offer = await getExchangeOfferDetails(params.offerId);
  const currentUserId = await getAuthUserId();

  if (!offer) {
    return <EmptyState />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ExchangeDetailClientCard offer={offer} currentUserId={currentUserId} />
    </div>
  );
}