"use client";
import { useState, useEffect, useRef } from "react";

import { NavigationBar } from "@/app/components/navbar";
import { Profile } from "@/app/components/profile";
import { ProductPage } from "../components/productPage";
import { SiFacebook, SiX, SiInstagram } from "@icons-pack/react-simple-icons";
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
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchProducts = async (offset: number) => {
    setIsFetching(true);
    //set up API call for dynamic fetching,
    //intention is for offset to be like index in array of products
    const imageSets = [
      ["/tempImages/bowl1.jpg", "/tempImages/bowl2.jpg"],
      ["/tempImages/camera1.jpg", "/tempImages/camera2.jpeg"],
      ["/tempImages/guitar.jpg", "/tempImages/guitar2.jpg"],
      ["/tempImages/lego2.jpg", "/tempImages/lego3.jpg"],
      ["/tempImages/coconut.jpg", "/tempImages/basket.jpeg"],
    ];

    const newProducts = Array.from({ length: 5 }, (_, i) => {
      const images = imageSets[i % imageSets.length]; // Alternate images
      return {
        images,
        caption: `Product ${offset + i + 1} caption. Here's more of a description of the product. You should've been clicking see more in order to see all of this. `,
        shopName: "Mike's Shop",
        name: `Product ${offset + i + 1}`,
        price: `$${(offset + i + 1) * 10}`,
      };
    });

    // Simulate network delay for better UX testing
    await new Promise((resolve) => setTimeout(resolve, 500));

    setProducts((prevProducts) => [...prevProducts, ...newProducts]);

    setIsFetching(false);
  };

  // Set up intersection observer
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
    // Initial data fetch
    fetchProducts(0);
  }, []);

  // Variable definitions
  const profilePic = "/tempImages/basketWeaver.jpg";
  const shopName = "Mike's Shop";
  const username = "basketweaver";
  const description =
    "Hey this is my basketweaving description! It'd be funny if this was left in prod";
  const magicPagesUrl = "/magic-pages";
  const socialLinks = [
    {
      platform: "Facebook",
      url: "https://facebook.com", //to be modified w/their link
      icon: <SiFacebook size={30} />,
    },
    {
      platform: "Twitter",
      url: "https://twitter.com",
      icon: <SiX size={30} />,
      // iconSrc: "/tempImages/icons/X.png",
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
  /*
  const productImages = [
    "/tempImages/basket.jpeg",
    "/tempImages/basket2.jpg",
    "/tempImages/coconut.jpg",
  ]; // URL for the product image/video
  const caption =
    "Dude check out this basket! I made it underwater and I swear it works."; // Caption text for the product
  const productName = "Basket"; // Product name
  const price = "$50"; // Price of the product

  // Handlers for the buttons (you can implement them as needed)
  const onAddToCart = () => {
    console.log("Added to cart");
  };
  const onLike = () => {
    console.log("Liked");
  };
  const onComment = () => {
    console.log("Commented");
  };
  const onShare = () => {
    console.log("Shared");
  };
  const onSearch = (query: string) => {
    console.log("Searching for:", query);
  };
*/
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
          categories={categories}
        />
      </div>

      {/* Product Pages */}
      <div>
        {products.map((product, index) => (
          <ProductPage
            key={index}
            productImages={product.images}
            caption={product.caption}
            shopName={product.shopName}
            productName={product.name}
            price={product.price}
            onAddToCart={() => console.log("Added to cart")}
            onLike={() => console.log("Liked")}
            onComment={() => console.log("Commented")}
            onShare={() => console.log("Shared")}
            onSearch={(query) => console.log("Searching for:", query)}
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
