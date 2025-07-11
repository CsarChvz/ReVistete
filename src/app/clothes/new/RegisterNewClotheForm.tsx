"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import React from "react";
import { GiTShirt } from "react-icons/gi"; // Icono de ejemplo para la prenda
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation"; // Aunque no se usa para redirección aquí, es útil para refrescar
import { toast } from "react-toastify"; // Para notificaciones
import { clothingItemSchema, ClothingItemSchema } from "@/lib/schemas/ClothingItemSchema";
import { registerClothingItem } from "@/app/actions/clothesActions";

export default function RegisterClothingForm() {
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
    reset, // Función para limpiar el formulario después de enviar
  } = useForm<ClothingItemSchema>({
    resolver: zodResolver(clothingItemSchema),
    mode: "onTouched",
  });

  const router = useRouter(); // Instancia del router de Next.js

  // Opciones predefinidas para las categorías de prendas
  const categories = [
    { label: "Camiseta", value: "camiseta" },
    { label: "Pantalón", value: "pantalon" },
    { label: "Vestido", value: "vestido" },
    { label: "Chaqueta", value: "chaqueta" },
    { label: "Falda", value: "falda" },
    { label: "Calzado", value: "calzado" },
    { label: "Accesorio", value: "accesorio" },
    { label: "Otro", value: "otro" },
  ];

  // Opciones predefinidas para las tallas
  const sizes = [
    { label: "XS", value: "XS" },
    { label: "S", value: "S" },
    { label: "M", value: "M" },
    { label: "L", value: "L" },
    { label: "XL", value: "XL" },
    { label: "XXL", value: "XXL" },
    { label: "Talla Única", value: "one_size" },
  ];

  /**
   * Función que se ejecuta al enviar el formulario.
   * Llama a la acción de servidor para registrar la prenda y maneja la respuesta.
   * @param data Los datos validados del formulario.
   */
  const onSubmit = async (data: ClothingItemSchema) => {
    const result = await registerClothingItem(data);
    if (result.status === "success") {
      toast.success(result.data); // Muestra un mensaje de éxito
      reset(); // Limpia todos los campos del formulario
      // Opcional: Si tienes una lista de prendas en otra parte, puedes refrescarla
      // router.refresh();
      // Opcional: Redirigir a una página de listado de prendas
      // router.push('/my-clothing');
    } else {
      toast.error(result.error as string); // Muestra un mensaje de error
    }
  };

  return (
    <Card className="w-3/5 mx-auto">
      <CardHeader className="flex flex-col items-center justify-center">
        <div className="flex flex-col gap-2 items-center text-default">
          <div className="flex flex-row items-center gap-3">
            <GiTShirt size={30} /> {/* Icono de camiseta */}
            <h1 className="text-3xl font-semibold">
              Registrar Prenda
            </h1>
          </div>
          <p className="text-neutral-500">
            Añade una nueva prenda a tu guardarropa virtual.
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Campo para el Nombre de la Prenda */}
            <Input
              defaultValue=""
              label="Nombre de la Prenda"
              variant="bordered"
              {...register("name")}
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message as string}
            />
            {/* Campo para la Categoría (Select) */}
            <Select
              label="Categoría"
              placeholder="Selecciona una categoría"
              variant="bordered"
              {...register("category")}
              isInvalid={!!errors.category}
              errorMessage={errors.category?.message as string}
            >
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </Select>
            {/* Campo para la Talla (Select) */}
            <Select
              label="Talla"
              placeholder="Selecciona una talla"
              variant="bordered"
              {...register("size")}
              isInvalid={!!errors.size}
              errorMessage={errors.size?.message as string}
            >
              {sizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </Select>
 
            {/* Botón de Enviar */}
            <Button
              fullWidth
              color="primary" // Color primario para una acción positiva
              type="submit"
              isDisabled={!isValid} // El botón se deshabilita si el formulario no es válido
            >
              Registrar Prenda
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
