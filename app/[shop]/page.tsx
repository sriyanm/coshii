"use client";
import { Store, Search, PlusSquare, Shirt, Settings } from "lucide-react";
import { useState, useEffect, useRef, use } from "react";
import { Toggle } from "@/app/components/Toggle";
import { Profile } from "@/app/components/profile";
import { ProductPage } from "../components/productPage";
import { MdAddShoppingCart } from "react-icons/md";
import { CiBellOn } from "react-icons/ci";
import type { NavigationItem } from "../types";
import Link from "next/link";
// import { TimestampString } from "@firebasegen/dataconnect";
// import { StringValidation } from "zod";
import { Product, Shop, CartItem } from "../types/index";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/client/firebase";
// import { CartItem } from "../components/CartItem";

const navigation: NavigationItem[] = [
  { name: "Shop", icon: Store, href: "/yourstore" },
  { name: "Search", icon: Search, href: "/search" },
  { name: "New Product", icon: PlusSquare, href: "/add-product" },
  { name: "Backrooms", icon: Shirt, href: "/inventory" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function ProfilePage({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const shopHandle = use(params).shop;
  const [currentTab] = useState("Shop");
  const [products, setProducts] = useState<Product[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [activeTab, setActiveTab] = useState("Shop"); // State for the active tab (Shop/Activity)
  const [selectedCategory, setSelectedCategory] = useState("All"); // State for selected category
  const [sellerView, setSellerView] = useState(false);
  const [buyerView, setBuyerView] = useState(true);
  const [invalidShop, setInvalidShop] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastProductRef = useRef<HTMLDivElement | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState<number>(0);
  const [shopData, setShopData] = useState<Shop>({
    createdAt: "",
    creatorId: "",
    creatorName: "",
    profilePic: "",
    shopName: "",
    username: "",
    email: "",
    description: "",
    socialLinks: [
      { platform: "Facebook", url: "https://facebook.com", username: "Mike H" },
      { platform: "Twitter", url: "https://twitter.com", username: "Mike H" },
      {
        platform: "Instagram",
        url: "https://instagram.com",
        username: "Mike H",
      },
    ],
    categories: [
      "All",
      "Reposts",
      "Cups",
      "Ashtrays",
      "Sculptures",
      "Scroll Past This",
    ],
    isPremium: true,
  });

  const handleShopUpdate = (updatedShopData: Shop) => {
    //TODO: should also update backend
    setShopData(updatedShopData);
  };

  const handleAddToCart = (product: Product) => {
    if (sellerView) {
      setShowPopup(true);

      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }

      popupTimerRef.current = setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    console.log(product, cart);
    const existingProductIndex = cart.findIndex(
      (item) => item.productId === product.id,
    );
    let updatedCart;
    if (existingProductIndex >= 0) {
      // Product already exists in the cart, so update the quantity
      console.log("Already in cart, incrementing quantity");
      updatedCart = [...cart];
      updatedCart[existingProductIndex].quantity += 1;
    } else {
      // Product doesn't exist in the cart, add it with quantity 1
      const newItem: CartItem = {
        productId: product.id, // From Product
        image: product.images[0],
        description: product.description || "",
        name: product.name,
        price: product.price,
        quantity: 1,
        sellerId: product.sellerId,
      };
      updatedCart = [...cart, newItem];
      console.log("New item in cart");
    }

    setItemCount(itemCount + 1);
    setCart(updatedCart);
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
    sessionStorage.setItem("sellerId", "acct_1R1Yp7E2rsuqp9lw"); //TODO: this is hardcoded
    console.log("Added to cart", updatedCart);
    console.log("Account Id: ", "acct_1R1Yp7E2rsuqp9lw"); //TODO: this is hardcoded
  };

  const CACHE_KEY = "cachedProducts";
  const CACHE_EXPIRATION_MS = 2 * 60 * 1000; // 2 minutes

  const fetchProducts = async () => {
    if (isFetching) return;

    setIsFetching(true);

    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY);

      if (cachedData) {
        const { products: cachedProducts, timestamp } = JSON.parse(cachedData);
        // Use cached data if it's still valid
        if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
          console.log("Using cached product data.");
          setProducts(cachedProducts);
          setIsFetching(false);
          return;
        }
      }

      // Query products collection for products created by this shop's owner
      const productsRef = collection(db, "products");
      const q = query(
        productsRef,
        where("createdBy", "==", shopData.creatorId),
      );
      const querySnapshot = await getDocs(q);

      const newProducts: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        newProducts.push({
          id: doc.id,
          name: data.name || "",
          price: data.price || 0,
          images: data.mediaUrls || ["/tempImages/basket.jpeg"],
          description: data.description || "",
          stock: data.inventory || 0,
          isListed: data.isListed ?? true,
          tags: data.tags || [],
          shopName: shopData.shopName,
          sellerId: data.sellerId || "",
        });
      });

      // Sort products by creation date if available, or name as fallback
      newProducts.sort((a, b) => {
        if (a.name && b.name) {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });

      // Add cache products in sessionStorage
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ products: newProducts, timestamp: Date.now() }),
      );

      setProducts(newProducts);
      console.log("products:", newProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Remove the infinite scroll observer effect
  useEffect(() => {
    if (shopData.creatorId) {
      fetchProducts();
    }
  }, [shopData.creatorId]);

  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, []);

  // Handle authentication and set user role
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setSellerView(false);
        setBuyerView(true);
        setCart([]);
        setItemCount(0);
      } else {
        // Wait until shopData is loaded
        const isShopOwner = !!(
          shopData && currentUser.uid === shopData.creatorId
        );
        setSellerView(isShopOwner);
        setBuyerView(!isShopOwner);
      }
    });

    return () => unsubscribe();
  }, [shopData]); // run again once shopData is fetched

  // Fetch shop data
  useEffect(() => {
    const fetchShopData = async () => {
      const shopsRef = collection(db, "shops");
      const q = query(shopsRef, where("username", "==", shopHandle));
      const querySnapshot = await getDocs(q);

      console.log("searching for", shopHandle);

      if (querySnapshot.empty) {
        setInvalidShop(true);
        return;
      }

      console.log("Found shop for username", shopHandle);
      const shopDoc = querySnapshot.docs[0];
      const shopData = shopDoc.data() as Shop;

      setShopData(shopData);
      // fetchProducts();
    };
    fetchShopData();
  }, []);

  // Sticky link
  useEffect(() => {
    const hash = window.location.hash; // Get the current URL hash
    if (hash) {
      const productId = hash.substring(1); // Remove the '#' from the hash
      console.log("Sticky", productId);
      const productElement = document.getElementById(`product-${productId}`);
      console.log(productElement);
      if (productElement) {
        productElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [products]);

  // If invalid shop
  if (invalidShop) {
    return (
      <div>
        You have entered an invalid shop name — go home
        <Link href="/">
          <button className="rounded mt-2 bg-black px-4 py-2 text-white">
            Go Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <div className="min-h-screen flex-1 flex-col items-center font-sans">
        {/* Profile Section */}
        <div className="w-full max-w-md p-4">
          <Profile
            shopData={shopData}
            sellerView={sellerView}
            onShopUpdate={handleShopUpdate}
          />
        </div>

        {/* Sticky Container for both toggles */}
        <div className="sticky top-0 z-10 w-full bg-white shadow-sm">
          {/* Wrapper for both toggles */}
          <div className="flex w-full flex-col">
            {/* Shop Name Above the First Toggle */}
            <div className="px-4 py-0.5 text-center text-sm font-medium">
              {shopData.shopName}
            </div>

            {/* Shop/Activity Toggle and Shopping Cart in the Same Row */}
            <div className="flex w-full items-center px-4 py-0.5">
              {/* Shop/Activity Toggle */}
              <div className="flex grow justify-center">
                <Toggle
                  options={["Shop", "Activity"]}
                  selectedOption={activeTab}
                  onOptionSelect={setActiveTab}
                  font="SF Pro"
                  underline={true}
                />
              </div>
              <div className="ml-auto flex shrink-0 items-end justify-end">
                {/* Shopping Cart Icon */}
                <Link
                  href={{ pathname: "/checkout" }}
                  title="Cart Button"
                  className="relative"
                >
                  <MdAddShoppingCart className="text-2xl" />
                  {itemCount > 0 && (
                    <span className="absolute -right-2 -top-3 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Bell Icon (visible only for sellers) */}
                {sellerView && (
                  <Link href="/notifs">
                    <CiBellOn
                      className="ml-4 text-2xl"
                      title="Notifications"
                      style={{ strokeWidth: "0.6" }}
                    />
                  </Link>
                )}
              </div>
            </div>

            {/* Categories Toggle */}
            <div className="shrink-0 px-4 py-0.5">
              <Toggle
                options={shopData.categories}
                selectedOption={selectedCategory}
                onOptionSelect={setSelectedCategory}
                font="SF Pro"
                underline={false}
                borderBox={true}
                selectedColor="orange"
              />
            </div>
          </div>
        </div>

        {/* Product Pages */}
        <div className="mb-16 space-y-6 pt-2">
          {products.map((product, index) => (
            <ProductPage
              key={product.id}
              media={product.images}
              caption={product.description || ""}
              productName={product.name}
              price={`\$${product.price}`}
              onAddToCart={() => handleAddToCart(product)}
              onLike={() => console.log("Liked")}
              onComment={() => console.log("Commented")}
              onShare={() => console.log("Shared")}
              buyerView={buyerView}
              isPremium={shopData.isPremium}
              id={`product-${product.id}`}
              ref={index === products.length - 1 ? lastProductRef : null}
            />
          ))}
        </div>

        {/* Pop-up Message if adding own product to cart */}
        {showPopup && (
          <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-white p-4 shadow-lg">
            <p>Sorry, you cant add your own products to your cart</p>
          </div>
        )}

        {/* Conditionally render the NavigationBar
          {sellerView && (
            <div className="fixed bottom-0 z-10 w-full">
              <NavigationBar />
            </div>
          )} */}
      </div>

      {/* Bottom Navigation */}
      {!buyerView && (
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
                <item.icon />
                <span className="text-xs">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

/*

Notes: 
If you're the seller:
 - Extra Pencil for editing
- Notifications in the top right


Top Down View:
- Profile Component:
  - Top Right Button
    - Seller: Notificatoin
    - Buyer: Cart
  - Next to Name Button:
    - Seller: Edit Profile
- Nav Bar:
  - Seller: Has it
  - Buyer: Nope


*/
