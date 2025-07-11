// app/exchange/new/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import { getAuthUserId } from '@/app/actions/authActions';
import { getClothingDetails } from '@/app/actions/clothesActions'; // Para obtener detalles de la prenda objetivo
import { getUserClothingInventory } from '@/app/actions/clothesActions'; // Para obtener el inventario del usuario
import { getMemberByUserId } from '@/app/actions/memberActions'; // Para obtener el miembro autenticado
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner'; // Para el estado de carga inicial
import ExchangeFormClient from './ExchangeFormClient';

type Props = {
  searchParams: {
    targetClotheId?: string; // El ID de la prenda que el usuario quiere de la URL
  };
};

export default async function InitiateExchangePage({ searchParams }: Props) {
  const currentUserId = await getAuthUserId();

  if (!currentUserId) {
    return <EmptyState  />;
  }

  const targetClotheId = searchParams.targetClotheId;

  if (!targetClotheId) {
    return <EmptyState />;
  }

  // Obtener el miembro autenticado para validaciones
  const currentMember = await getMemberByUserId(currentUserId);
  if (!currentMember) {
    return <EmptyState />;
  }

  // Obtener detalles de la prenda que el usuario quiere
  const targetClothingItem = await getClothingDetails(targetClotheId);

  if (!targetClothingItem) {
    return <EmptyState  />;
  }

  // Validar que la prenda objetivo no sea del propio usuario
  if (targetClothingItem.memberId === currentMember.id) {
    return <EmptyState />;
  }
  // Validar que la prenda objetivo esté disponible
  if (targetClothingItem.status !== 'AVAILABLE') {
    return <EmptyState />;
  }


  // Obtener el inventario del usuario actual
  // Paginación aquí puede ser una opción, pero para un selector, tal vez mejor traer todos los disponibles
  const { items: userClothingInventory } = await getUserClothingInventory(currentUserId, { pageSize: '999' });

  // Filtrar prendas del usuario que estén AVAILABLE
  const availableToOffer = userClothingInventory.filter(item =>
    item.status === 'AVAILABLE'
  );

  if (availableToOffer.length === 0) {
    return <EmptyState />;
  }

  return (
    <ExchangeFormClient
      targetClothingItem={targetClothingItem}
      userClothingInventory={availableToOffer}
    />
  );
}