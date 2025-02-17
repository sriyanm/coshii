"use client";
import { useState, useEffect, useRef } from "react";
import { Toggle } from "@/app/components/Toggle";
import { NavigationBar } from "@/app/components/navbar";
import { Profile } from "@/app/components/profile";
import { ProductPage } from "../components/productPage";
import { SiFacebook, SiX, SiInstagram } from "@icons-pack/react-simple-icons";
import { MdAddShoppingCart } from "react-icons/md";
import { CiBellOn } from "react-icons/ci";
import Link from "next/link";

interface Product {
  images: string[];
  caption: string;
  shopName: string;
  name: string;
  price: string;
}

export default function ProfilePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [activeTab, setActiveTab] = useState("Shop"); // State for the active tab (Shop/Activity)
  const [selectedCategory, setSelectedCategory] = useState("All"); // State for selected category
  // const [sellerView, setSellerView] = useState(true); // Replace with actual seller role check
  const sellerView = true;
  const observerRef = useRef<IntersectionObserver | null>(null);

  // const [cart, setCart] = useState<any[]>([]); // State to manage cart items

  // const handleAddToCart = (product: any) => {
  //   setCart((prevCart) => [...prevCart, product]);
  //   console.log("Added to cart", product);
  // };

  const fetchProducts = async (offset: number) => {
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
      return {
        images,
        caption: `Product ${offset + i + 1} caption. Here's more of a description of the product. You should've been clicking see more in order to see all of this.`,
        shopName: "Mike's Shop",
        name: `Product ${offset + i + 1}`,
        price: `$${(offset + i + 1) * 10}`,
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

  const profilePic = "/tempImages/basketWeaver.jpg";
  const shopName = "Mike's Shop";
  const username = "basketweaver";
  const description =
    "Hey this is my basketweaving description! It'd be funny if this was left in prod";
  const socialLinks = [
    {
      platform: "Facebook",
      url: "https://facebook.com",
      icon: <SiFacebook size={30} />,
    },
    {
      platform: "Twitter",
      url: "https://twitter.com",
      icon: <SiX size={30} />,
    },
    {
      platform: "Instagram",
      url: "https://instagram.com",
      icon: <SiInstagram size={30} />,
    },
  ];

  const categories = [
    "All",
    "Reposts",
    "Cups",
    "Ashtrays",
    "Sculptures",
    "Scroll Past This",
  ];

  return (
    <div className="flex min-h-screen flex-col items-center font-sans">
      {/* Profile Section */}
      <div className="w-full max-w-md p-4">
        <Profile
          profilePic={profilePic}
          shopName={shopName}
          username={username}
          description={description}
          socialLinks={socialLinks}
          sellerView={sellerView}
        />
      </div>

      {/* Sticky Container for both toggles */}
      <div className="sticky top-0 z-10 w-full bg-white shadow-sm">
        {/* Wrapper for both toggles */}
        <div className="flex w-full flex-col">
          {/* Shop Name Above the First Toggle */}
          <div className="px-4 py-0.5 text-center text-sm font-medium">
            {shopName}
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
            <div className="ml-auto flex shrink-0 items-center">
              {/* Shopping Cart Icon */}
              <Link href="/checkout" title="Cart Button">
                <MdAddShoppingCart className="text-xl" />
              </Link>
              {/* Bell Icon (visible only for sellers) */}
              {sellerView && (
                <CiBellOn className="ml-4 text-xl" title="Notifications" />
              )}
            </div>
          </div>

          {/* Categories Toggle */}
          <div className="shrink-0 px-4 py-0.5">
            <Toggle
              options={categories}
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
            caption={product.caption}
            productName={product.name}
            price={product.price}
            onAddToCart={() => console.log("Added to cart!")}
            onLike={() => console.log("Liked")}
            onComment={() => console.log("Commented")}
            onShare={() => console.log("Shared")}
          />
        ))}
      </div>

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
