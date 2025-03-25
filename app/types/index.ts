import type React from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  stock?: number;
  isListed?: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  date: string;
  status: "active" | "archived" | "completed";
  address?: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export type NavigationItem = {
  name: string;
  icon: React.ComponentType;
  href: string;
};
