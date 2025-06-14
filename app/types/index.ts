import type React from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description?: string;
  inventory?: number;
  isListed?: boolean;
  tags?: string[];
  shopName?: string;
  sellerId: string;
  likesCount?: number;
  commentsCount?: number;
}

export interface Shop {
  createdAt: string;
  creatorId: string;
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

export interface Notification {
  id: string;
  type: NotificationType;
  user: {
    name: string;
    avatar: string;
  };
  content?: string;
  target?: string;
  timestamp: string;
  thumbnail?: string;
  shopHandle: string;
  productId?: string;
}

export type NotificationType = "like" | "comment" | "follow" | "post";

export type NavigationItem = {
  name: string;
  icon: React.ComponentType;
  href: string;
};
