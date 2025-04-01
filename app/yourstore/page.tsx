"use client";
import { useState, useEffect, useRef } from "react";
import { Toggle } from "@/app/components/Toggle";
import { NavigationBar } from "@/app/components/navbar";
import { Profile } from "@/app/components/profile";
import { ProductPage } from "../components/productPage";
import { MdAddShoppingCart } from "react-icons/md";
import { CiBellOn } from "react-icons/ci";
import Link from "next/link";
// import { TimestampString } from "@firebasegen/dataconnect";
// import { StringValidation } from "zod";
import { Product, Shop, CartItem } from "../types/index";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/client/firebase";
// import { CartItem } from "../components/CartItem";

export default function ProfilePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [activeTab, setActiveTab] = useState("Shop"); // State for the active tab (Shop/Activity)
  const [selectedCategory, setSelectedCategory] = useState("All"); // State for selected category
  const [sellerView, setSellerView] = useState(false);
  const [buyerView, setBuyerView] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastProductRef = useRef<HTMLDivElement | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState<number>(0);
  const [shopData, setShopData] = useState<Shop>({
    //TODO: this is hardcoded
    createdAt: "",
    creatorId: "",
    creatorName: "",
    profilePic: "/tempImages/basketWeaver.jpg",
    shopName: "Mike's Shop",
    username: "basketweaver",
    email: "Mike@gmail.com",
    description:
      "Hey this is my basketweaving description! It'd be funny if this was left in prod",
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

    const existingProductIndex = cart.findIndex(
      (item) => item.name === product.name,
    );
    let updatedCart;
    if (existingProductIndex >= 0) {
      // Product already exists in the cart, so update the quantity
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
    }

    setItemCount(itemCount + 1);
    setCart(updatedCart);
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
    sessionStorage.setItem("sellerId", "acct_1R1Yp7E2rsuqp9lw"); //TODO: this is hardcoded
    console.log("Added to cart", updatedCart);
    console.log("Account Id: ", "acct_1R1Yp7E2rsuqp9lw"); //TODO: this is hardcoded
  };

  const fetchProducts = async () => {
    if (isFetching) return;

    setIsFetching(true);

    try {
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
          images: data.mediaUrls || ["/placeholder.svg"],
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

      setProducts(newProducts);
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

  // Remove the initial fetch effect since we now fetch when creatorId changes
  // useEffect(() => {
  //   fetchProducts(0);
  // }, [fetchProducts]);

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
      if (currentUser) {
        try {
          // Query the shops collection for the current user's shop
          const shopsRef = collection(db, "shops");
          const q = query(shopsRef, where("creatorId", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const shopDoc = querySnapshot.docs[0];
            const shopData = shopDoc.data();

            // Update shop data with the fetched data
            setShopData((prevData) => ({
              ...prevData,
              creatorId: shopData.creatorId,
              shopName: shopData.shopName,
              createdAt: shopData.createdAt?.toDate().toISOString() || "",
            }));
          }

          // Check if the current user is the owner of this shop
          const isShopOwner = currentUser.uid === shopData.creatorId;
          setSellerView(isShopOwner);
          setBuyerView(!isShopOwner);

          // Optional: fetch user-specific data here
          // For example, load their cart from session storage or database
          const savedCart = sessionStorage.getItem("cart");
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            setCart(parsedCart);
            const totalItems = parsedCart.reduce(
              (sum: number, item: CartItem) => sum + item.quantity,
              0,
            );
            setItemCount(totalItems);
          }
        } catch (error) {
          console.error("Error fetching shop data:", error);
        }
      } else {
        // Not logged in
        setSellerView(false);
        setBuyerView(true);
        // Clear cart when logged out
        setCart([]);
        setItemCount(0);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [shopData.creatorId]);

  return (
    <div className="flex min-h-screen flex-col items-center font-sans">
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
                <Link href="/yourstore">
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
      <div className="space-y-6 pt-2">
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

      {/* Conditionally render the NavigationBar */}
      {sellerView && (
        <div className="fixed bottom-0 z-10 w-full">
          <NavigationBar />
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
