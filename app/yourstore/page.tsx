"use client";

import { NavigationBar } from "@/app/components/navbar";
import { Profile } from "@/app/components/profile";
import { ProductPage } from "../components/productPage";
import { SiFacebook, SiX, SiInstagram } from "@icons-pack/react-simple-icons";

export default function ProfilePage() {
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

      <div>
        <ProductPage
          productImages={productImages}
          caption={caption}
          shopName={shopName}
          productName={productName}
          price={price}
          onAddToCart={onAddToCart}
          onLike={onLike}
          onComment={onComment}
          onShare={onShare}
          onSearch={onSearch}
        />
      </div>

      {/* Navigation Bar */}
      <div className="fixed bottom-0 w-full">
        <NavigationBar />
      </div>
    </div>
  );
}
