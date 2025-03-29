import type React from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description?: string;
  stock?: number;
  isListed?: boolean;
  tags?: string[];
  shopName?: string;
  sellerId: string;
}

export interface Shop {
  createdAt: string;
  creatorId: string;
  creatorName: string;
  shopName: string;
  username: string;
  email: string;
  description: string;
  profilePic: string;
  socialLinks: {
    platform: string;
    url: string;
    username: string;
  }[];
  categories: string[];
  isPremium: boolean;
  subscriptionId?: string; //id for this user's subscription to coshii premium
  sellerId?: string; //id for stripe connect account
}

export interface CartItem {
  productId: string;
  image: string;
  description: string;
  name: string;
  price: number;
  quantity: number;
  sellerId: string;
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
