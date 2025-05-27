"use client";

import { useState, useEffect } from "react";
import { Store, Search, PlusSquare, Shirt, Settings } from "lucide-react";
// import { CoatHanger } from '@lucide/lab';
import { ProductCard } from "../components/product-card";
import { OrderCard } from "../components/order-card";
import { ProductDetailsView } from "../components/product-details-view";
import { OrderDetailsView } from "../components/order-details-view";
import type { Product, Order, NavigationItem } from "../types";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/client/firebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { cleanupUnusedCategoriesForShop } from "../lib/utils";
import { useRouter } from "next/navigation";

const navigation: NavigationItem[] = [
  { name: "Shop", icon: Store, href: "/" },
  { name: "Search", icon: Search, href: "/search" },
  { name: "New Product", icon: PlusSquare, href: "/add-product" },
  { name: "Backrooms", icon: Shirt, href: "/inventory" },
  { name: "Settings", icon: Settings, href: "/settings" },
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
          images: ["/placeholder.svg"],
          sellerId: "",
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
          images: ["/placeholder.svg"],
          sellerId: "",
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
          images: ["/placeholder.svg"],
          sellerId: "",
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

export default function InventoryPage() {
  const [view, setView] = useState<View>("backrooms");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentTab] = useState("Backrooms");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userPlan, setUserPlan] = useState("");
  const auth = getAuth();
  const router = useRouter();

  const listedProducts = products.filter((p) => p.isListed);
  const unlistedProducts = products.filter((p) => !p.isListed);
  const activeOrders = orders.filter((o) => o.status === "active");
  const archivedOrders = orders.filter((o) => o.status === "archived");

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        router.replace("/onboarding");
        return;
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Fetch user plan
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user) {
        setUserPlan("");
        return;
      }
      try {
        const shopsRef = collection(db, "shops");
        const q = query(shopsRef, where("creatorId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const shopDoc = querySnapshot.docs[0].data();
          console.log("Shop data:", shopDoc);
          if (shopDoc.isPremium) setUserPlan("paid");
          else setUserPlan("free");
          console.log("User plan:", shopDoc.isPremium);
        } else {
          console.warn("No user document found for this user.");
        }
      } catch (error) {
        console.error("Error fetching user plan:", error);
      }
    };
    fetchUserPlan();
  }, [user]);

  // Fetch products when user auth state changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("createdBy", "==", user.uid));

        const querySnapshot = await getDocs(q);
        const fetchedProducts: Product[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Product data:", data);

          // Check if mediaUrls exists and has valid entries
          const mediaUrls =
            data.mediaUrls && data.mediaUrls.length > 0
              ? data.mediaUrls
              : null;
          console.log("Using mediaUrls:", mediaUrls);

          fetchedProducts.push({
            id: doc.id,
            name: data.name || "",
            price: data.price || 0,
            // Make sure we use the full URL string without modifications
            images: mediaUrls && mediaUrls.length > 0
              ? mediaUrls.map((mediaUrl: string) => mediaUrl.toString())
              : data.images || ["/placeholder.svg"],
            description: data.description || "",
            inventory: data.inventory || 0,
            isListed: data.isListed ?? true,
            tags: data.tags || [],
            shopName: data.shopName || "",
            sellerId: data.sellerId || "",
          });

          console.log(
            "Final images array:",
            fetchedProducts[fetchedProducts.length - 1].images,
          );
        });

        // Sort products by creation date if available, or name as fallback
        fetchedProducts.sort((a, b) => {
          if (a.name && b.name) {
            return a.name.localeCompare(b.name);
          }
          return 0;
        });

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === updatedProduct.id ? updatedProduct : p,
      ),
    );
  };

  const handleProductDelete = (productId: string) => {
    setProducts((prevProducts) =>
      prevProducts.filter((p) => p.id !== productId),
    );
    setSelectedProduct(null);
    setView("backrooms");
    cleanupUnusedCategoriesForShop(auth.currentUser?.uid || "");
  };

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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <div className="flex-1 overflow-y-auto pb-20">
        {view === "productDetails" && selectedProduct ? (
          <ProductDetailsView
            product={selectedProduct}
            onBack={handleBackClick}
            onProductUpdate={handleProductUpdate}
            onDeleteProduct={handleProductDelete}
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
              {userPlan === "paid" && (
                <button
                  className={`text-xl ${view === "transactions" ? "font-bold" : "text-muted-foreground"}`}
                  onClick={() => setView("transactions")}
                >
                  Transactions
                </button>
              )}
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
                        <ProductCard product={product} showInventory />
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
              </>
            )}
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2">
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
    </div>
  );
}
