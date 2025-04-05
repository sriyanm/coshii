import React from "react";
import Image from "next/image";

export function CartItem({
  name,
  price,
  quantity,
  image,
}: {
  name: string;
  price: number;
  quantity: number;
  image: string;
}) {
  return (
    <div className="flex h-[14.2857vh] w-[90vw] items-center justify-between rounded-lg bg-white p-4 shadow">
      <Image
        width={100}
        height={100}
        src={image}
        alt={name}
        className="h-full w-20 rounded-lg object-cover"
      />
      <div className="grow px-4">
        <h3 className="text-lg font-medium">{name}</h3>
        <p className="text-sm text-gray-500">Qty: {quantity}</p>
      </div>
      <div className="font-semibold text-gray-800">${price.toFixed(2)}</div>
    </div>
  );
}
