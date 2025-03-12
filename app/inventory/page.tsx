"use client";

import { useState } from "react";
import { Store, Search, PlusSquare, Shirt, Settings } from "lucide-react";
// import { CoatHanger } from '@lucide/lab';
import { ProductCard } from "../components/product-card";
import { OrderCard } from "../components/order-card";
import { ProductDetailsView } from "../components/product-details-view";
import { OrderDetailsView } from "../components/order-details-view";
import type { Product, Order, NavigationItem } from "../types";
import Link from "next/link";

const navigation: NavigationItem[] = [
  { name: "Shop", icon: Store, href: "/shop" },
  { name: "Search", icon: Search, href: "/search" },
  { name: "New Product", icon: PlusSquare, href: "/add-product" },
  { name: "Backrooms", icon: Shirt, href: "/inventory" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

// Sample data
const products: Product[] = [
  {
    id: "1",
    name: "Charm Necklace",
    price: 31,
    image: "/placeholder.svg",
    description:
      "This beautiful Home Beautiful Linens by Vickie tablecloth and napkin set is in good vintage condition and its original box.",
    stock: 4,
    isListed: true,
  },
  {
    id: "2",
    name: "Vase Necklace",
    price: 18,
    image: "/placeholder.svg",
    description:
      "This beautiful Home Beautiful Linens by Vickie tablecloth and napkin set is in good vintage condition and its original box.",
    stock: 4,
    isListed: true,
  },
  {
    id: "3",
    name: "Custom Candle",
    price: 60,
    image: "/placeholder.svg",
    description:
      "This beautiful Home Beautiful Linens by Vickie tablecloth and napkin set is in good vintage condition and its original box.",
    stock: 4,
    isListed: false,
  },
  {
    id: "4",
    name: "Ashtrays",
    price: 79,
    image: "/placeholder.svg",
    description:
      "This beautiful Home Beautiful Linens by Vickie tablecloth and napkin set is in good vintage condition and its original box.",
    stock: 4,
    isListed: false,
  },
];

const orders: Order[] = [
  {
    id: "1",
    customerName: "Kevin Barnes",
    items: [
      {
        product: {
          id: "1",
          name: "Grey Plate",
          price: 30,
          image: "/placeholder.svg",
        },
        quantity: 2,
      },
    ],
    date: "2023-12-23",
    status: "active",
    address: "123 Main St\nApt 4B\nNew York, NY 10001",
  },
  {
    id: "2",
    customerName: "Kevin Barnes",
    items: [
      {
        product: {
          id: "1",
          name: "Grey Plate",
          price: 30,
          image: "/placeholder.svg",
        },
        quantity: 2,
      },
    ],
    date: "2023-12-23",
    status: "archived",
    address: "123 Main St\nApt 4B\nNew York, NY 10001",
  },
  {
    id: "3",
    customerName: "Kevin Barnes",
    items: [
      {
        product: {
          id: "1",
          name: "Grey Plate",
          price: 30,
          image: "/placeholder.svg",
        },
        quantity: 2,
      },
    ],
    date: "2023-12-23",
    status: "completed",
    address: "123 Main St\nApt 4B\nNew York, NY 10001",
  },
];

type View = "backrooms" | "transactions" | "productDetails" | "orderDetails";

export default function Home() {
  const [view, setView] = useState<View>("backrooms");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentTab] = useState("Backrooms");

  const listedProducts = products.filter((p) => p.isListed);
  const unlistedProducts = products.filter((p) => !p.isListed);
  const activeOrders = orders.filter((o) => o.status === "active");
  const archivedOrders = orders.filter((o) => o.status === "archived");
  const purchases = orders.filter((o) => o.status === "completed");

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setView("productDetails");
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setView("orderDetails");
  };

  const handleBackClick = () => {
    setView(view === "productDetails" ? "backrooms" : "transactions");
    setSelectedProduct(null);
    setSelectedOrder(null);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        {view === "productDetails" && selectedProduct ? (
          <ProductDetailsView
            product={selectedProduct}
            onBack={handleBackClick}
          />
        ) : view === "orderDetails" && selectedOrder ? (
          <OrderDetailsView order={selectedOrder} onBack={handleBackClick} />
        ) : (
          <div className="space-y-6 p-4">
            <div className="flex gap-4">
              <button
                className={`text-xl ${view === "backrooms" ? "font-bold" : "text-muted-foreground"}`}
                onClick={() => setView("backrooms")}
              >
                Backrooms
              </button>
              <button
                className={`text-xl ${view === "transactions" ? "font-bold" : "text-muted-foreground"}`}
                onClick={() => setView("transactions")}
              >
                Transactions
              </button>
            </div>

            {view === "backrooms" ? (
              <>
                <div>
                  <h2 className="mb-2 text-lg font-semibold">On Your Store</h2>
                  <div className="divide-y rounded-lg border">
                    {listedProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                      >
                        <ProductCard product={product} showStock />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="mb-2 text-lg font-semibold">Unlisted</h2>
                  <div className="divide-y rounded-lg border">
                    {unlistedProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="mb-2 text-lg font-semibold">Active Orders</h2>
                  <div className="divide-y rounded-lg border">
                    {activeOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => handleOrderClick(order)}
                      >
                        <OrderCard order={order} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="mb-2 text-lg font-semibold">Archive</h2>
                  <div className="divide-y rounded-lg border">
                    {archivedOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => handleOrderClick(order)}
                      >
                        <OrderCard order={order} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="mb-2 text-lg font-semibold">Your Purchases</h2>
                  <div className="divide-y rounded-lg border">
                    {purchases.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => handleOrderClick(order)}
                      >
                        <OrderCard order={order} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <nav className="flex h-16 items-center justify-around border-t bg-white px-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 ${
              currentTab === item.name ? "text-black" : "text-black/50"
            }`}
          >
            <item.icon /*className="h-6 w-6"*/ />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
