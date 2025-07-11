'use server';

import { prisma } from '@/lib/prisma';
import { getAuthUserId } from './authActions'; // Asumiendo que esta función existe para obtener el ID del usuario autenticado
import { ClothingItemSchema } from '@/lib/schemas/ClothingItemSchema'; // Importa el esquema que acabas de crear
import { ActionResult } from '@/types'; // Asumiendo que tienes este tipo definido para tus acciones de servidor

export async function getAvailableClothes() {
  try {
    return prisma.clothingItem.findMany({
      where: {
        status: 'AVAILABLE',
      },
      // Puedes añadir `take` y `skip` aquí para paginación si es necesario
    });
  } catch (error) {
    console.error("Error al obtener prendas disponibles:", error);
    // Podrías lanzar el error o devolver null/undefined dependiendo de tu manejo de errores
    throw error;
  }
}
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

