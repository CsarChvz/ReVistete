// app/clothes/ClothesSidebar.tsx
"use client";
import { Button, Card, CardBody, Slider } from '@nextui-org/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { GetClothesParams } from '../actions/clothesActions';

export default function ClothesSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados locales para los filtros
  const [currentCategory, setCurrentCategory] = useState(searchParams.get('category') || '');
  const [currentSize, setCurrentSize] = useState(searchParams.get('size') || '');
  const [currentOrderBy, setCurrentOrderBy] = useState(searchParams.get('orderBy') || 'createdAt');

  // Opciones de categorías y tallas (ejemplos, puedes expandirlos)
  const categories = ['Camisa', 'Pantalón', 'Vestido', 'Chaqueta', 'Calzado', 'Accesorio'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const orderByOptions = [
    { label: 'Más Reciente', value: 'createdAt' },
    { label: 'Más Reciente (Actualizado)', value: 'updatedAt' },
    // Puedes añadir más opciones de ordenamiento como 'name' alfabético, etc.
  ];

  // Callback para crear la URL de búsqueda
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name); // Eliminar el parámetro si el valor está vacío
      }
      return params.toString();
    },
    [searchParams]
  );

  // Manejador para aplicar los filtros
  const applyFilters = () => {
    let newSearchParams = new URLSearchParams();
    if (currentCategory) newSearchParams.set('category', currentCategory);
    if (currentSize) newSearchParams.set('size', currentSize);
    if (currentOrderBy) newSearchParams.set('orderBy', currentOrderBy);

    router.push(`/clothes?${newSearchParams.toString()}`);
  };

  // Manejador para resetear los filtros
  const resetFilters = () => {
    setCurrentCategory('');
    setCurrentSize('');
    setCurrentOrderBy('createdAt');
    router.push('/clothes'); // Navegar a la página sin parámetros de búsqueda
  };

  // Sincronizar estados con searchParams al cargar la página o cambiar la URL
  useEffect(() => {
    setCurrentCategory(searchParams.get('category') || '');
    setCurrentSize(searchParams.get('size') || '');
    setCurrentOrderBy(searchParams.get('orderBy') || 'createdAt');
  }, [searchParams]);


  return (
    <Card className="w-full mt-10 p-4">
      <CardBody className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Filtrar Prendas</h2>

        {/* Filtro por Categoría */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
          <select
            id="category"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={currentCategory}
            onChange={(e) => setCurrentCategory(e.target.value)}
          >
            <option value="">Todas las Categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Talla */}
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700">Talla</label>
          <select
            id="size"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={currentSize}
            onChange={(e) => setCurrentSize(e.target.value)}
          >
            <option value="">Todas las Tallas</option>
            {sizes.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Ordenar por */}
        <div>
          <label htmlFor="orderBy" className="block text-sm font-medium text-gray-700">Ordenar por</label>
          <select
            id="orderBy"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={currentOrderBy}
            onChange={(e) => setCurrentOrderBy(e.target.value)}
          >
            {orderByOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 mt-4">
          <Button fullWidth color="primary" onClick={applyFilters}>
            Aplicar Filtros
          </Button>
          <Button fullWidth variant="bordered" onClick={resetFilters}>
            Resetear
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}