"use client";
import { useState, useEffect, useRef } from "react";
import { Toggle } from "@/app/components/Toggle";
import { NavigationBar } from "@/app/components/navbar";
import { Profile } from "@/app/components/profile";
import { ProductPage } from "../components/productPage";
import { SiFacebook, SiX, SiInstagram } from "@icons-pack/react-simple-icons";
import { MdAddShoppingCart } from "react-icons/md";

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

  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchProducts = async (offset: number) => {
    setIsFetching(true);
    const imageSets = [
      ["/tempImages/bowl1.jpg", "/tempImages/bowl2.jpg"],
      ["/tempImages/camera1.jpg", "/tempImages/camera2.jpeg"],
      ["/tempImages/guitar.jpg", "/tempImages/guitar2.jpg"],
      ["/tempImages/lego2.jpg", "/tempImages/lego3.jpg"],
      ["/tempImages/coconut.jpg", "/tempImages/basket.jpeg"],
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
  const magicPagesUrl = "/magic-pages";
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
    <div className="bg-gray-50 flex min-h-screen flex-col items-center">
      {/* Profile Section */}
      <div className="w-full max-w-md p-4">
        <Profile
          profilePic={profilePic}
          shopName={shopName}
          username={username}
          description={description}
          magicPagesUrl={magicPagesUrl}
          socialLinks={socialLinks}
        />
      </div>

      {/* Sticky Container for both toggles */}
      <div className="sticky top-0 z-10 w-full bg-white shadow-sm">
        {/* Wrapper for both toggles */}
        <div className="flex w-full flex-col">
          {/* Shop Name Above the First Toggle */}
          <div className="px-4 py-0.5 text-center text-sm font-medium">
            {" "}
            {/* Reduced padding */}
            {shopName}
          </div>

          {/* Shop/Activity Toggle and Shopping Cart in the Same Row */}
          <div className="flex w-full items-center px-4 py-0.5">
            {" "}
            {/* Reduced padding */}
            {/* Shop/Activity Toggle (centered in the row) */}
            <div className="flex grow justify-center">
              <Toggle
                options={["Shop", "Activity"]} // Pass "Shop" and "Activity" to the first Toggle
                selectedOption={activeTab}
                onOptionSelect={setActiveTab}
                font="SF Pro"
                underline={true}
              />
            </div>
            {/* Shopping Cart Icon (aligned to the right edge) */}
            <div className="ml-auto shrink-0">
              <MdAddShoppingCart />
            </div>
          </div>

          {/* Categories Toggle */}
          <div className="shrink-0 px-4 py-0.5">
            {" "}
            {/* Reduced padding */}
            <Toggle
              options={categories} // Pass other categories to the second Toggle
              selectedOption={selectedCategory}
              onOptionSelect={setSelectedCategory}
              font="SF Pro"
              underline={false}
            />
          </div>
        </div>
      </div>

      {/* Product Pages */}
      <div className="space-y-6 pt-20">
        {products.map((product, index) => (
          <ProductPage
            key={index}
            productImages={product.images}
            caption={product.caption}
            productName={product.name}
            price={product.price}
            onAddToCart={() => console.log("Added to cart")}
            onLike={() => console.log("Liked")}
            onComment={() => console.log("Commented")}
            onShare={() => console.log("Shared")}
          />
        ))}
      </div>

      {/* Intersection Observer Trigger */}
      <div id="load-more-trigger" className="h-4 w-full"></div>

      {/* Navigation Bar */}
      <div className="fixed bottom-0 w-full">
        <NavigationBar />
      </div>
    </div>
  );
}
