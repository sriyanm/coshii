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
// import { CartItem } from "../components/CartItem";

export default function ProfilePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [activeTab, setActiveTab] = useState("Shop"); // State for the active tab (Shop/Activity)
  const [selectedCategory, setSelectedCategory] = useState("All"); // State for selected category
  const sellerView = true; // TODO: Replace with actual seller role check (true iff the shop belongs to the currently signed in user)
  const buyerView = true; // TODO: Replace with actual buyer role check (true iff the currently signed in user does not have any shop)
  const [showPopup, setShowPopup] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]); // State to manage cart items
  const [itemCount, setCount] = useState<number>(0);
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
      setTimeout(() => setShowPopup(false), 3000); // Hide after 3 seconds
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

    setCount(itemCount + 1);
    setCart(updatedCart);
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
    sessionStorage.setItem("sellerId", "acct_1R1Yp7E2rsuqp9lw"); //TODO: this is hardcoded
    console.log("Added to cart", updatedCart);
    console.log("Account Id: ", "acct_1R1Yp7E2rsuqp9lw"); //TODO: this is hardcoded
  };

  const fetchProducts = async (offset: number) => {
    //TODO: this is all hardcoded
    setIsFetching(true);
    const imageSets = [
      [
        "/tempImages/bowl1.jpg",
        "/tempImages/bowl2.jpg",
        "/tempImages/dawn.mp4",
      ],
      [
        "/tempImages/camera1.jpg",
        "/tempImages/camera2.jpeg",
        "/tempImages/dawn.mp4",
      ],
      [
        "/tempImages/guitar.jpg",
        "/tempImages/guitar2.jpg",
        "/tempImages/dawn.mp4",
      ],
      [
        "/tempImages/lego2.jpg",
        "/tempImages/lego3.jpg",
        "/tempImages/dawn.mp4",
      ],
      [
        "/tempImages/coconut.jpg",
        "/tempImages/basket.jpeg",
        "/tempImages/dawn.mp4",
      ],
    ];

    const newProducts = Array.from({ length: 5 }, (_, i) => {
      const images = imageSets[i % imageSets.length];

      // Create the new product object
      return {
        id: `product_${offset + i + 1}`, // Create a unique product ID
        images: images,
        description: `Product ${offset + i + 1} caption. Here's more of a description of the product. You should've been clicking see more in order to see all of this.`,
        shopName: "Mike's Shop",
        name: `Product ${offset + i + 1}`,
        price: (offset + i + 1) * 10 + 0.99,
        tags: ["tag1", "tag2"], // Example tags
        sellerId: "acct_1R1Yp7E2rsuqp9lw",
      };
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    setProducts((prevProducts) => [...prevProducts, ...newProducts]);

    setIsFetching(false);
  };

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching) {
          fetchProducts(products.length);
        }
      },
      { threshold: 1.0 },
    );

    const target = document.querySelector("#load-more-trigger");
    if (target) observerRef.current.observe(target);

    return () => observerRef.current?.disconnect();
  }, [products, isFetching]);

  useEffect(() => {
    fetchProducts(0); // Initial data fetch
  }, []);

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
                <Link href="/shop">
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
            key={index}
            media={product.images}
            caption={product.description || ""}
            productName={product.name}
            price={`\$${product.price}`}
            onAddToCart={() => handleAddToCart(product)}
            onLike={() => console.log("Liked")} //TODO: store in backend
            onComment={() => console.log("Commented")} //TODO: store in backend (see components/comments.tsx)
            onShare={() => console.log("Shared")} //TODO: do something
            buyerView={buyerView}
            isPremium={shopData.isPremium}
          />
        ))}
      </div>

      {/* Pop-up Message if adding own product to cart */}
      {showPopup && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-white p-4 shadow-lg">
          <p>Sorry, you cant add your own products to your cart</p>
        </div>
      )}

      {/* Intersection Observer Trigger */}
      <div id="load-more-trigger" className="h-4 w-full"></div>

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
