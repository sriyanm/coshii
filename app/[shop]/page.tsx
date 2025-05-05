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
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/app/lib/client/firebase";
import { fetchProducts } from "../components/ProductServer";

const navigation: NavigationItem[] = [
  { name: "Shop", icon: Store, href: "/" },
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
  // const [activeTab, setActiveTab] = useState("Shop"); // State for the active tab (Shop/Activity)
  const [selectedCategory, setSelectedCategory] = useState("All"); // State for selected category
  const [stickied, setStickied] = useState(false); //track if we have already scrolled to a sticky product
  const [sellerView, setSellerView] = useState(false);
  const [buyerView, setBuyerView] = useState(true);
  const [invalidShop, setInvalidShop] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useRef<HTMLDivElement | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState<number>(0);
  const [lastVisibleProduct, setLastVisibleProduct] =
    useState<DocumentSnapshot | null>(null);
  const [donePaginating, setDonePaginating] = useState<boolean>(false);
  const [shopData, setShopData] = useState<Shop>({
    createdAt: "",
    creatorId: "",
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

  const handleShopUpdate = async (updatedShopData: Shop) => {
    try {
      const shopsRef = collection(db, "shops");
      const q = query(
        shopsRef,
        where("username", "==", updatedShopData.username),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;

        const cleanedData = JSON.parse(JSON.stringify(updatedShopData));
        await updateDoc(docRef, cleanedData);

        // Only update local state if Firestore update succeeds
        setShopData(updatedShopData);
        console.log("Shop data updated in Firestore and local state.");
      } else {
        console.warn(
          "No matching shop document found for username:",
          updatedShopData.username,
        );
      }
    } catch (error) {
      console.error("Failed to update shop in Firestore:", error);
    }
  };

  const handleShare = (product: Product) => {
    const productLink = `${process.env.NEXT_PUBLIC_BASE_URL}/${shopData.username}#product-${product.id}`;
    console.log("Share clicked");

    // Copy the URL to the clipboard
    navigator.clipboard
      .writeText(productLink)
      .then(() => {
        setShowPopup(true);
        setPopupMessage(`Product link for ${product.name} copied to clipboard`);
        setTimeout(() => setShowPopup(false), 3000);
      })
      .catch((error) => {
        console.error("Failed to copy text: ", error);
      });
  };

  const handleAddToCart = (product: Product) => {
    if (sellerView) {
      setShowPopup(true);
      setPopupMessage("Sorry, you cant add your own products to your cart");

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

  const CACHE_KEY = `cachedProducts-${shopData.username}`;
  const CACHE_EXPIRATION_MS = 2 * 60 * 1000; // 2 minutes

  const getProducts = async (
    sharedProductId: string | null = null,
    bottom: boolean = false,
  ) => {
    if (isFetching) return;

    setIsFetching(true);

    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY);

      if (cachedData && !bottom) {
        const { products: cachedProducts, timestamp } = JSON.parse(cachedData);
        // Use cached data if it's still valid
        if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
          console.log("Using cached product data.", cachedProducts);
          setProducts(cachedProducts);
          setIsFetching(false);
          return;
        }
      }

      // Query products collection for products created by this shop's owner
      const {
        products: newProducts,
        lastVisible: newLastVisibleProduct,
        done,
      } = await fetchProducts(
        shopData.creatorId,
        shopData.shopName,
        selectedCategory,
        sharedProductId,
        lastVisibleProduct,
      );
      setProducts((prevProducts) => {
        // Filter out any products in newProducts that are already in prevProducts (possibly due to sticky links)
        const filteredNewProducts = newProducts.filter(
          (newProduct) =>
            !prevProducts.some((product) => product.id === newProduct.id),
        );
        return [...prevProducts, ...filteredNewProducts];
      });
      setLastVisibleProduct(newLastVisibleProduct);
      setDonePaginating(done);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Add cache products in sessionStorage
  useEffect(() => {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ products: products, timestamp: Date.now() }),
    );
  }, [products]);

  // Initial product fetch
  useEffect(() => {
    if (shopData.creatorId) {
      const hash = window.location.hash; // Get the current URL hash
      let productId = null;
      if (hash) {
        productId = hash.substring(9); // Remove the '#product-' from the hash
        console.log("Parsed product in link", productId);
      }
      getProducts(productId);
    }
  }, [shopData.creatorId, selectedCategory]);

  // Fetch more products if reached bottom
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && !donePaginating) {
          getProducts(undefined, true);
        }
      },
      { threshold: 1.0 },
    );

    const target = document.querySelector("#load-more-trigger");
    if (target) observerRef.current.observe(target);

    return () => observerRef.current?.disconnect();
  }, [products, isFetching]);

  // Popup if try to buy own product
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
  const handleStickyLink = () => {
    const hash = window.location.hash; // Get the current URL hash
    if (hash) {
      const productId = hash.substring(1); // Remove the '#' from the hash
      console.log("Sticky", productId);
      const productElement = document.getElementById(`product-${productId}`);
      console.log(productElement);
      if (productElement) {
        productElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setStickied(true);
      }
    }
  };

  useEffect(() => {
    handleStickyLink();
  }, [shopData.creatorId, selectedCategory]);

  useEffect(() => {
    if (!stickied) {
      handleStickyLink();
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
            <div className="relative flex items-center justify-center px-4 py-2 text-sm font-medium">
              <div>{shopData.shopName}</div>

              <div className="absolute right-4 flex items-center">
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

            {/* Shop/Activity Toggle and Shopping Cart in the Same Row */}
            {/* <div className="flex w-full items-center px-4 py-0.5">
              <div className="flex grow justify-center">
                <Toggle
                  options={["Shop", "Activity"]}
                  selectedOption={activeTab}
                  onOptionSelect={setActiveTab}
                  font="SF Pro"
                  underline={true}
                />
              </div>
            </div> */}

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
          {products
            .filter((product) => {
              return (
                selectedCategory === "All" ||
                (product.tags && product.tags.includes(selectedCategory))
              );
            })
            .map((product, index) => (
              <ProductPage
                key={product.id}
                media={product.images}
                caption={product.description || ""}
                productName={product.name}
                price={`\$${product.price}`}
                onAddToCart={() => handleAddToCart(product)}
                onLike={() => console.log("Liked")}
                onComment={() => console.log("Commented")}
                onShare={() => handleShare(product)}
                buyerView={buyerView}
                isPremium={shopData.isPremium}
                likesCount={product.likesCount || 0}
                commentsCount={product.commentsCount || 0}
                id={`product-${product.id}`}
                ref={index === products.length - 1 ? lastProductRef : null}
              />
            ))}
        </div>

        {/* Pop-up Message if adding own product to cart */}
        {showPopup && (
          <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-white p-4 shadow-lg">
            {popupMessage}
          </div>
        )}
      </div>

      <div id="load-more-trigger" className="h-4 w-full"></div>

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
