// app/actions/exchangeActions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { ExchangeStatus, ClothingStatus } from '@prisma/client';
import { getAuthUserId } from './authActions'; // Asegúrate de que esta ruta es correcta
import { getMemberByUserId } from './memberActions'; // Asegúrate de que esta ruta es correcta



// Función para iniciar la oferta de intercambio
export async function initiateExchangeOffer(
  offeredItemId: string, // La prenda que el oferente ofrece
  requestedItemId: string // La prenda que el oferente solicita (la de la página de detalles)
) {
  // Asegúrate de que esta función es segura y solo se puede llamar por el usuario autenticado
  const currentUserId = await getAuthUserId();
  if (!currentUserId) {
    throw new Error('Debes iniciar sesión para iniciar un intercambio.');
  }

  const offeringMember = await getMemberByUserId(currentUserId);
  if (!offeringMember) {
    throw new Error('No se encontró tu perfil de miembro. Por favor, completa tu perfil.');
  }

  try {
    // 1. Obtener detalles de ambas prendas
    const offeredClothe = await prisma.clothingItem.findUnique({
      where: { id: offeredItemId },
      include: { member: true }, // Incluye el miembro para validaciones
    });

    const requestedClothe = await prisma.clothingItem.findUnique({
      where: { id: requestedItemId },
      include: { member: true }, // Incluye el miembro para validaciones
    });

    if (!offeredClothe || !requestedClothe) {
      throw new Error('Una o ambas prendas involucradas en la oferta no fueron encontradas.');
    }

    // 2. Validaciones de Negocio
    // a. La prenda ofrecida debe pertenecer al usuario que inicia la oferta
    if (offeredClothe.memberId !== offeringMember.id) {
      throw new Error('La prenda que intentas ofrecer no pertenece a tu inventario.');
    }
    // b. La prenda solicitada no puede ser del mismo usuario que inicia la oferta
    if (requestedClothe.memberId === offeringMember.id) {
      throw new Error('No puedes intercambiar una prenda contigo mismo.');
    }
    // c. Ambas prendas deben estar disponibles
    if (offeredClothe.status !== ClothingStatus.AVAILABLE || requestedClothe.status !== ClothingStatus.AVAILABLE) {
      throw new Error('Ambas prendas deben estar disponibles para iniciar un intercambio.');
    }
    // d. Asegurarse de que no haya ofertas PENDING existentes para estas dos prendas (opcional, para evitar duplicados)
    const existingOffer = await prisma.exchangeOffer.findFirst({
      where: {
        OR: [
          {
            offeredItemId: offeredItemId,
            requestedItemId: requestedItemId,
            status: ExchangeStatus.PENDING,
          },
          {
            offeredItemId: requestedItemId, // Evitar ofertas inversas duplicadas
            requestedItemId: offeredItemId,
            status: ExchangeStatus.PENDING,
          },
        ],
      },
    });

    if (existingOffer) {
      throw new Error('Ya existe una oferta pendiente para estas prendas.');
    }


    // 3. Crear la oferta de intercambio en la base de datos
    const newOffer = await prisma.exchangeOffer.create({
      data: {
        offeringMemberId: offeringMember.userId, // El userId del oferente
        receivingMemberId: requestedClothe.member.userId, // El userId del miembro que posee la prenda solicitada
        offeredItemId: offeredItemId,
        requestedItemId: requestedItemId,
        status: ExchangeStatus.PENDING, // Estado inicial
      },
    });

    // 4. (Opcional) Actualizar el estado de las prendas a "UNAVAILABLE" o "PENDING_EXCHANGE_OFFER"
    // Esto evita que las prendas se ofrezcan en múltiples intercambios al mismo tiempo.
    // Esto es crucial para la integridad del sistema.
    await prisma.clothingItem.update({
      where: { id: offeredItemId },
      data: { status: ClothingStatus.UNAVAILABLE }, // O un estado más específico como PENDING_OFFER
    });
    await prisma.clothingItem.update({
      where: { id: requestedItemId },
      data: { status: ClothingStatus.UNAVAILABLE }, // O un estado más específico
    });


    console.log('Oferta de intercambio creada:', newOffer);
    return newOffer;

  } catch (error: any) {
    console.error("Error al iniciar la oferta de intercambio:", error);
    // Vuelve a lanzar el error para que pueda ser capturado por el componente del cliente
    throw new Error(`Fallo al iniciar el intercambio: ${error.message}`);
  }
}

export async function getUserExchangeOffers(userId: string) {
  try {
    // Asegurarse de que el userId corresponde a un Member ID para las relaciones de ExchangeOffer
    // NOTA IMPORTANTE: En tu schema, offeringMemberId y receivingMemberId apuntan a userId de la tabla User.
    // Esto es un poco confuso porque la relación es con Member. Por lo tanto,
    // necesitamos que el `userId` que pasamos a esta función sea el `User.id` (el que obtenemos de `getAuthUserId`).
    // Y las relaciones en el modelo ExchangeOffer deben usar `references: [id]` de `User` si los campos `Id` son `userId`.
    // Si tus relaciones en ExchangeOffer fueran `references: [id]` de `Member`, entonces aquí deberíamos usar `member.id`.
    // Basado en tu schema: `references: [userId]` -> esto significa que los campos offeringMemberId/receivingMemberId almacenan el User.id.
    // Esto es consistente con lo que devuelve `getAuthUserId()`.

    const sentOffers = await prisma.exchangeOffer.findMany({
      where: { offeringMemberId: userId },
      include: {
        // Incluir la información del receptor (para ofertas enviadas)
        receivingMember: {
          select: {
            userId: true, // Importante para MemberLink
            name: true,
            image: true,
            city: true, // Puedes añadir más campos si los vas a mostrar
            country: true,
          }
        },
        // Incluir las prendas involucradas
        offeredItem: { select: { id: true, name: true, imageUrl: true, status: true } },
        requestedItem: { select: { id: true, name: true, imageUrl: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const receivedOffers = await prisma.exchangeOffer.findMany({
      where: { receivingMemberId: userId },
      include: {
        // Incluir la información del oferente (para ofertas recibidas)
        offeringMember: {
          select: {
            userId: true, // Importante para MemberLink
            name: true,
            image: true,
            city: true,
            country: true,
          }
        },
        // Incluir las prendas involucradas
        offeredItem: { select: { id: true, name: true, imageUrl: true, status: true } },
        requestedItem: { select: { id: true, name: true, imageUrl: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      sent: sentOffers,
      received: receivedOffers,
      totalSent: sentOffers.length,
      totalReceived: receivedOffers.length,
    };
  } catch (error) {
    console.error(`Error al obtener ofertas de intercambio para el usuario ${userId}:`, error);
    return { sent: [], received: [], totalSent: 0, totalReceived: 0 };
  }
}

export async function getExchangeOfferDetails(offerId: string) {
  try {
    return prisma.exchangeOffer.findUnique({
      where: { id: offerId },
      include: {
        offeringMember: {
          select: { userId: true, name: true, image: true, city: true, country: true } // Asegúrate de que `userId` también esté aquí
        },
        receivingMember: {
          select: { userId: true, name: true, image: true, city: true, country: true } // Y aquí
        },
        offeredItem: {
          include: { member: { select: { userId: true, name: true } } } // Incluir dueño de la prenda ofrecida
        },
        requestedItem: {
          include: { member: { select: { userId: true, name: true } } } // Incluir dueño de la prenda solicitada
        },
      },
    });
  } catch (error) {
    console.error(`Error al obtener detalles de la oferta ${offerId}:`, error);
    return null;
  }
}

async function authorizeExchangeAction(offerId: string, actionType: 'sender' | 'recipient' | 'complete_action') {
  // Nota: He cambiado 'complete' a 'complete_action' en el actionType para evitar el conflicto
  // con el enum ExchangeStatus. También puedes pasar un booleano `isCompleteAction` si prefieres.

  const currentUserId = await getAuthUserId();
  if (!currentUserId) {
    throw new Error('No autenticado. Por favor, inicia sesión para realizar esta acción.');
  }

  const currentMember = await getMemberByUserId(currentUserId);
  if (!currentMember) {
    throw new Error('No se encontró tu perfil de miembro. Por favor, completa tu perfil.');
  }

  const offer = await prisma.exchangeOffer.findUnique({
    where: { id: offerId },
    select: {
      offeringMemberId: true,
      receivingMemberId: true,
      status: true,
      offeredItemId: true,
      requestedItemId: true,
      offeredItem: { select: { status: true } },
      requestedItem: { select: { status: true } },
    },
  });

  if (!offer) {
    throw new Error('Oferta de intercambio no encontrada.');
  }

  // Validar el rol del usuario según el tipo de acción
  if (actionType === 'sender') {
    if (offer.offeringMemberId !== currentUserId) {
      throw new Error('No autorizado. Solo el oferente puede cancelar esta oferta.');
    }
  } else if (actionType === 'recipient') {
    if (offer.receivingMemberId !== currentUserId) {
      throw new Error('No autorizado. Solo el receptor puede aceptar/rechazar esta oferta.');
    }
  } else if (actionType === 'complete_action') { // Para la acción de completar
    if (offer.offeringMemberId !== currentUserId && offer.receivingMemberId !== currentUserId) {
      throw new Error('No autorizado. Solo un miembro involucrado puede completar esta oferta.');
    }
  }

  // Validar el estado de la oferta según el tipo de acción
  if (actionType === 'sender' || actionType === 'recipient') {
    // Para cancelar (sender), aceptar/rechazar (recipient), la oferta debe estar PENDING
    if (offer.status !== ExchangeStatus.PENDING) {
      throw new Error(`La oferta ya no está pendiente (estado actual: ${offer.status}).`);
    }
  } else if (actionType === 'complete_action') {
    // Para completar, la oferta debe estar ACEPTADA
    if (offer.status !== ExchangeStatus.ACCEPTED) {
      throw new Error(`La oferta debe estar ACEPTADA para poder ser completada (estado actual: ${offer.status}).`);
    }
  }
  return { offer, currentMember };
}

export async function acceptExchangeOffer(offerId: string) {
  try {
    const { offer } = await authorizeExchangeAction(offerId, 'recipient');

    // Validaciones adicionales antes de aceptar
    if (offer.offeredItem?.status !== ClothingStatus.AVAILABLE && offer.offeredItem?.status !== ClothingStatus.UNAVAILABLE) {
      throw new Error('La prenda ofrecida ya no está disponible para el intercambio.');
    }
    if (offer.requestedItem?.status !== ClothingStatus.AVAILABLE && offer.requestedItem?.status !== ClothingStatus.UNAVAILABLE) {
      throw new Error('Tu prenda solicitada ya no está disponible para el intercambio.');
    }


    // 1. Actualizar el estado de la oferta a ACEPTADA
    const updatedOffer = await prisma.exchangeOffer.update({
      where: { id: offerId },
      data: { status: ExchangeStatus.ACCEPTED },
    });

    // 2. Cambiar el estado de AMBAS prendas a "UNAVAILABLE"
    // Esto es crucial para que no se ofrezcan en otros intercambios mientras se coordina la entrega.
    await prisma.clothingItem.updateMany({
      where: { id: { in: [updatedOffer.offeredItemId, updatedOffer.requestedItemId] } },
      data: { status: ClothingStatus.UNAVAILABLE }, // Marcar como no disponibles temporalmente
    });

    // TODO: Implementar notificación al oferente de que su oferta fue aceptada

    return updatedOffer;

  } catch (error: any) {
    console.error(`Error al aceptar la oferta ${offerId}:`, error);
    throw new Error(`Fallo al aceptar la oferta: ${error.message}`);
  }
}

// Acción para que el RECEPTOR RECHACE una oferta
export async function rejectExchangeOffer(offerId: string) {
  try {
    const { offer } = await authorizeExchangeAction(offerId, 'recipient');

    // 1. Actualizar el estado de la oferta a REJECTED
    const updatedOffer = await prisma.exchangeOffer.update({
      where: { id: offerId },
      data: { status: ExchangeStatus.REJECTED },
    });

    // 2. Devolver las prendas a estado AVAILABLE
    // Asumiendo que el estado 'UNAVAILABLE' se usa para "en proceso de oferta"
    await prisma.clothingItem.updateMany({
      where: { id: { in: [updatedOffer.offeredItemId, updatedOffer.requestedItemId] } },
      data: { status: ClothingStatus.AVAILABLE },
    });

    // TODO: Implementar notificación al oferente de que su oferta fue rechazada

    return updatedOffer;

  } catch (error: any) {
    console.error(`Error al rechazar la oferta ${offerId}:`, error);
    throw new Error(`Fallo al rechazar la oferta: ${error.message}`);
  }
}

// Acción para que el OFERENTE CANCELE una oferta
export async function cancelExchangeOffer(offerId: string) {
  try {
    const { offer } = await authorizeExchangeAction(offerId, 'sender');

    // 1. Actualizar el estado de la oferta a CANCELED
    const updatedOffer = await prisma.exchangeOffer.update({
      where: { id: offerId },
      data: { status: ExchangeStatus.CANCELED },
    });

    // 2. Devolver las prendas a estado AVAILABLE
    await prisma.clothingItem.updateMany({
      where: { id: { in: [updatedOffer.offeredItemId, updatedOffer.requestedItemId] } },
      data: { status: ClothingStatus.AVAILABLE },
    });

    // TODO: Implementar notificación al receptor de que la oferta fue cancelada

    return updatedOffer;

  } catch (error: any) {
    console.error(`Error al cancelar la oferta ${offerId}:`, error);
    throw new Error(`Fallo al cancelar la oferta: ${error.message}`);
  }
}

// Acción para MARCAR UNA OFERTA COMO COMPLETADA (después de que ha sido aceptada)
export async function completeExchangeOffer(offerId: string) {
  try {
    // La acción de completar puede ser iniciada por CUALQUIERA de los dos miembros.
    // Necesitamos una verificación de autorización más permisiva aquí.
    const currentUserId = await getAuthUserId();
    if (!currentUserId) {
        throw new Error('No autenticado. Por favor, inicia sesión para completar esta oferta.');
    }

    const currentMember = await getMemberByUserId(currentUserId);
    if (!currentMember) {
      throw new Error('No se encontró tu perfil de miembro.');
    }

    const offer = await prisma.exchangeOffer.findUnique({
      where: { id: offerId },
      select: {
        offeringMemberId: true,
        receivingMemberId: true,
        status: true,
        offeredItemId: true,
        requestedItemId: true,
      },
    });

    if (!offer) {
      throw new Error('Oferta de intercambio no encontrada.');
    }
    // Verificar que el usuario actual es uno de los dos involucrados en la oferta
    if (offer.offeringMemberId !== currentUserId && offer.receivingMemberId !== currentUserId) {
      throw new Error('No autorizado para completar esta oferta.');
    }
    // Solo se puede completar una oferta que ha sido ACEPTADA
    if (offer.status !== ExchangeStatus.ACCEPTED) {
      throw new Error(`La oferta debe estar en estado 'ACEPTADA' para poder ser completada (estado actual: ${offer.status}).`);
    }

    // 1. Actualizar el estado de la oferta a COMPLETED
    const updatedOffer = await prisma.exchangeOffer.update({
      where: { id: offerId },
      data: { status: ExchangeStatus.COMPLETED },
    });

    // 2. ACTUALIZAR la propiedad de las prendas: ¡Ahora pertenecen al nuevo dueño!
    // La prenda ofrecida (offeredItemId) ahora pertenece al receivingMember.
    const receivingMemberData = await getMemberByUserId(updatedOffer.receivingMemberId);
    if (!receivingMemberData) throw new Error('No se encontró el miembro receptor.');

    await prisma.clothingItem.update({
      where: { id: updatedOffer.offeredItemId },
      data: {
        memberId: receivingMemberData.id, // Asignar el ID del miembro receptor
        status: ClothingStatus.EXCHANGED, // Marcar como intercambiada
      },
    });

    // La prenda solicitada (requestedItemId) ahora pertenece al offeringMember.
    const offeringMemberData = await getMemberByUserId(updatedOffer.offeringMemberId);
    if (!offeringMemberData) throw new Error('No se encontró el miembro oferente.');

    await prisma.clothingItem.update({
      where: { id: updatedOffer.requestedItemId },
      data: {
        memberId: offeringMemberData.id, // Asignar el ID del miembro oferente
        status: ClothingStatus.EXCHANGED, // Marcar como intercambiada
      },
    });

    // TODO: Implementar notificación a AMBAS partes de que el intercambio ha sido completado

    return updatedOffer;

  } catch (error: any) {
    console.error(`Error al completar la oferta ${offerId}:`, error);
    throw new Error(`Fallo al completar la oferta: ${error.message}`);
  }
}