// app/exchange/[offerId]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import { getExchangeOfferDetails } from '@/app/actions/exchangeActions';
import { getAuthUserId } from '@/app/actions/authActions';
import EmptyState from '@/components/EmptyState';
import ExchangeDetailClientCard from './ExchangeDetailClientCard';

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
      {/* CORRECCIÓN AQUÍ: Pasa la prop como 'initialOffer' */}
      <ExchangeDetailClientCard initialOffer={offer} currentUserId={currentUserId} />
    </div>
  );
}