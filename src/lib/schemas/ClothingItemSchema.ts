import { z } from 'zod';

export const clothingItemSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(50, 'El nombre no puede exceder 50 caracteres'),
  category: z.string().min(1, 'La categoría es obligatoria'),
  size: z.string().min(1, 'La talla es obligatoria'),
  // Puedes añadir más campos aquí según sea necesario, por ejemplo:
  // imageUrl: z.string().url('URL de imagen inválida').optional(),
});

export type ClothingItemSchema = z.infer<typeof clothingItemSchema>;
