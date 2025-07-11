'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from './authActions'; // Asumiendo que esta función existe para obtener el ID del usuario autenticado
import { ClothingItemSchema } from '@/lib/schemas/ClothingItemSchema'; // Importa el esquema que acabas de crear
import { ActionResult } from '@/types'; // Asumiendo que tienes este tipo definido para tus acciones de servidor
import { ClothingItem, ClothingStatus } from '@prisma/client';

export async function registerClothingItem(data: ClothingItemSchema): Promise<ActionResult<string>> {
  try {
    // Obtiene el ID del usuario autenticado. Si no hay usuario, lanza un error.
    const userId = await getAuthUserId();

    if (!userId) {
      return { status: 'error', error: 'Usuario no autenticado' };
    }

    // Obtiene el ID del miembro asociado al usuario autenticado.
    // Tu esquema de Prisma ClothingItem se relaciona con Member, no directamente con User.
    const member = await prisma.member.findUnique({
      where: { userId: userId },
      select: { id: true } // Solo necesitamos el ID del miembro
    });

    if (!member) {
      return { status: 'error', error: 'No se encontró el perfil de miembro para el usuario autenticado. Asegúrate de que el usuario tiene un perfil de miembro asociado.' };
    }

    // Crea la nueva prenda en la base de datos, vinculándola al miembro.
    await prisma.clothingItem.create({
      data: {
        ...data, // Spreads all fields from the validated data
        memberId: member.id, // Vincula la prenda al ID del miembro
        // Nota: 'status' tiene un valor por defecto en tu esquema de Prisma (AVAILABLE),
        // así que no necesita ser enviado explícitamente a menos que quieras cambiarlo.
      },
    });

    return { status: 'success', data: 'Prenda registrada exitosamente' };
  } catch (error) {
    console.error('Error al registrar la prenda:', error);
    return { status: 'error', error: 'Fallo al registrar la prenda. Por favor, inténtalo de nuevo.' };
  }
}

// Definiciones de Tipos (asegúrate de que estén en un archivo accesible, quizás src/types.ts o directamente aquí)
export type GetClothesParams = {
  pageNumber?: string;
  pageSize?: string;
  orderBy?: 'createdAt' | 'updatedAt' | 'name'; // Agregamos 'name' como opción de ordenamiento
  category?: string;
  size?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
};
export async function getAvailableClothes({
  pageNumber = '1',
  pageSize = '12',
  orderBy = 'createdAt',
  category,
  size,
}: GetClothesParams): Promise<PaginatedResponse<ClothingItem>> {
  const userId = await getAuthUserId(); // Obtener el ID del usuario autenticado

  const page = parseInt(pageNumber);
  const limit = parseInt(pageSize);
  const skip = (page - 1) * limit;

  try {
    const clothesWhere = {
      AND: [
        { status: ClothingStatus.AVAILABLE }, // ¡CORREGIDO: Usando el enum directamente!
        // {
        //   NOT: {
        //     member: {
        //       userId,
        //     },
        //   },
        // },

        // @TODO: Descomentar esto
        ...(category ? [{ category: category }] : []),
        ...(size ? [{ size: size }] : []),
      ],
    };

    const count = await prisma.clothingItem.count({ where: clothesWhere });

    const clothes = await prisma.clothingItem.findMany({
      where: clothesWhere,
      include: {
        member: {
          select: {
            userId: true,
            name: true,
            city: true,
            country: true,
            image: true,
          },
        },
      },
      orderBy: { [orderBy]: 'desc' },
      skip,
      take: limit,
    });

    return {
      items: clothes,
      totalCount: count,
    };
  } catch (error) {
    console.error("Error al obtener prendas disponibles:", error);
    throw error;
  }
}

export async function getUserClothingInventory(
  userId: string,
  { pageNumber = '1', pageSize = '12' }: { pageNumber?: string; pageSize?: string }
): Promise<PaginatedResponse<ClothingItem>> {
  const page = parseInt(pageNumber);
  const limit = parseInt(pageSize);
  const skip = (page - 1) * limit;

  try {
    const whereClause = {
      member: {
        userId: userId,
      },
    };

    const count = await prisma.clothingItem.count({ where: whereClause });

    const userClothes = await prisma.clothingItem.findMany({
      where: whereClause,
      skip,
      take: limit,
      // Incluye la información del miembro si la necesitas en el ClothingCard para el inventario del propio usuario
      // include: {
      //   member: {
      //     select: {
      //       name: true,
      //       // ...otros campos si son necesarios
      //     },
      //   },
      // },
    });

    return {
      items: userClothes,
      totalCount: count,
    };
  } catch (error) {
    console.error(`Error al obtener el inventario de ropa del usuario ${userId}:`, error);
    throw error;
  }
}

// 2. getClothingDetails (modificado para incluir fotos)
export async function getClothingDetails(clotheId: string) {
  try {
    return prisma.clothingItem.findUnique({
      where: {
        id: clotheId,
      },
      include: {
        member: { // Incluimos el miembro dueño de la prenda
          select: {
            userId: true,
            name: true,
            city: true,
            country: true,
            image: true,
          },
        },
        // Si tienes un modelo de Photo específicamente para ClothingItem, inclúyelo así:
        // photos: true, // Asumiendo que ClothingItem tiene una relación 'photos'
      },
    });
  } catch (error) {
    console.error(`Error al obtener detalles de la prenda ${clotheId}:`, error);
    throw error;
  }
}