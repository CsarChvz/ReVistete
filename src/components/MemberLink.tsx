// components/MemberLink.tsx
import Link from 'next/link';
import React from 'react';

type Props = {
  memberId: string;
  name: string;
  // Puedes añadir más props si quieres personalizar el estilo, como un `className`
  className?: string;
};

export default function MemberLink({ memberId, name, className }: Props) {
  // Asegúrate de que la ruta a los perfiles de miembro es correcta.
  // Según tu estructura, es /members/[userId]
  const href = `/members/${memberId}`;

  return (
    <Link href={href} className={`text-blue-500 hover:underline ${className || ''}`}>
      {name}
    </Link>
  );
}