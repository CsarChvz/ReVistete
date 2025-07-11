// components/LoadingSpinner.tsx
import React from 'react';
import { Spinner } from '@nextui-org/react'; // O tu componente de spinner preferido

type Props = {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
};

export default function LoadingSpinner({ text = "Cargando...", size = "lg" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <Spinner size={size} />
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
}