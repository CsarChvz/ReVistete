import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
} from "@nextui-org/react";
import Link from "next/link";
import React from "react";
// import { GiSelfLove } from "react-icons/gi"; // Ya no necesitamos este icono
import NavLink from "./NavLink";
import { auth } from "@/auth";
import UserMenu from "./UserMenu";
import { getUserInfoForNav } from "@/app/actions/userActions";
import FiltersWrapper from "./FiltersWrapper";
import Image from "next/image"; // Importar el componente Image de Next.js

export default async function TopNav() {
  const session = await auth();
  const userInfo =
    session?.user && (await getUserInfoForNav());

  const memberLinks = [
    { href: "/clothes", label: "Explorar" }, // Para ver todas las prendas disponibles
    { href: "/exchange/my-offers", label: "Mis Ofertas" }, // Para ver ofertas enviadas/recibidas
    { href: "/inventory", label: "Mi Inventario" }, // Para ver las prendas del usuario
  ];

  const adminLinks = [
    {
      href: "/admin/moderation",
      label: "Moderación de Fotos",
    },
  ];

  const links =
    session?.user.role === "ADMIN"
      ? adminLinks
      : memberLinks;
  return (
    <>
      <Navbar
        maxWidth="full"
        // Colores ajustados para el concepto de sostenibilidad
        className="bg-gradient-to-r from-emerald-500 via-green-600 to-green-800"
        classNames={{
          item: [
            "text-xl",
            "text-white",
            "uppercase",
            "data-[active=true]:text-lime-200", // Color de resaltado ajustado
          ],
        }}
      >
        <NavbarBrand as={Link} href="/">
          {/* Reemplazamos GiSelfLove por el componente Image */}
          <Image
            src="/images/image.jpg" // Ruta a tu imagen en la carpeta public
            alt="Logo ReVistete"
            width={40} // Ajusta el tamaño según sea necesario
            height={40} // Ajusta el tamaño según sea necesario
            className="rounded-full object-cover" // Opcional: para que sea circular si tu logo es cuadrado
          />
          <div className="font-bold text-3xl flex ml-2"> {/* Añadimos un pequeño margen */}
            <span className="text-gray-200">
              ReVistete
            </span>
          </div>
        </NavbarBrand>
        <NavbarContent justify="center">
          {session &&
            links.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
              />
            ))}
        </NavbarContent>
        <NavbarContent justify="end">
          {userInfo ? (
            <UserMenu userInfo={userInfo} />
          ) : (
            <>
              <Button
                as={Link}
                href="/login"
                variant="bordered"
                className="text-white border-white hover:bg-white hover:text-emerald-600" // Estilo hover
              >
                Iniciar Sesión
              </Button>

            </>
          )}
        </NavbarContent>
      </Navbar>
      {/* FiltersWrapper se mantiene, asumiendo que es para filtros globales o de búsqueda */}
      <FiltersWrapper />
    </>
  );
}