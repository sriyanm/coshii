import { useState, useRef, UIEvent } from "react";
import { SocialBar } from "./SocialBar"; // Import the SocialBar component
import { Caption } from "./Caption"; // Import Caption component

interface ProductPageProps {
  productImages: string[];
  caption: string;
  shopName: string;
  productName: string;
  price: string;
  onAddToCart: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSearch: (query: string) => void;
}

export function ProductPage({
  productImages,
  caption,
  shopName,
  productName,
  price,
  onAddToCart,
  onLike,
  onComment,
  onShare,
  onSearch,
}: ProductPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrolling, setScrolling] = useState(false);

  // Use a ref to directly access the scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle scrolling images
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (scrolling || !scrollContainerRef.current) return;

    const scrollLeft = event.currentTarget.scrollLeft;
    const imageWidth = event.currentTarget.clientWidth;

    // Calculate the closest image index based on the scroll position
    const newIndex = Math.round(scrollLeft / imageWidth);

    // Only update if the index has changed
    if (newIndex !== currentImageIndex) {
      setScrolling(true);
      setCurrentImageIndex(newIndex);

      // Scroll to the nearest image with smooth behavior
      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({
          left: newIndex * imageWidth,
          behavior: "smooth",
        });
      });

      // Allow scrolling again after smooth scroll is finished
      setTimeout(() => {
        setScrolling(false);
      }, 300); // Adjust timeout to match the smooth scroll duration
    }
  };

  return (
    <div className="bg-black relative h-screen w-screen">
      {/* Back Bar */}
      <div className="bg-black absolute left-0 top-0 z-20 flex w-full items-center bg-opacity-100 p-3">
        <button className="text-white">Back</button>
      </div>

      {/* Media (scrollable images/videos) */}
      <div
        ref={scrollContainerRef} // Assign the ref to the scroll container
        className="size-full overflow-x-auto scroll-smooth whitespace-nowrap"
        onScroll={handleScroll}
      >
        {productImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={productName}
            className="inline-block size-full object-cover"
          />
        ))}
      </div>

      {/* Top Left Info */}
      <div className="absolute left-0 top-0 z-10 p-5 text-white">
        <p className="text-lg font-semibold">{shopName}</p>
        <p className="text-xl font-semibold">{productName}</p>
        <p className="text-lg font-semibold">{price}</p>
      </div>

      {/* Top Right Search Bar */}
      <div className="absolute right-0 top-0 z-10 w-1/3 p-5">
        <input
          type="text"
          placeholder="Search"
          className="text-black w-full rounded-md bg-white p-2"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Image Navigation (Swipe/Toggle Images) */}
      <div className="sticky bottom-0 left-1/2 top-[calc(100vh-80px)] z-10 flex -translate-x-1/2 space-x-2">
        {productImages.map((_, index) => (
          <div
            key={index}
            className={`rounded-full size-3 bg-white ${
              currentImageIndex === index ? "bg-opacity-100" : "bg-opacity-50"
            }`}
          />
        ))}
      </div>
      {/* Bottom Left Caption */}
      <div className="relative">
        {/* Bottom Left Caption */}
        <div className="from-black to-transparent absolute bottom-0 left-0 right-1/4 z-10 bg-gradient-to-t p-5 text-white">
          <Caption caption={caption} />
        </div>

        {/* Social Bar */}
        <div className="absolute bottom-0 right-0 z-10 ml-auto flex flex-col items-center space-y-3 p-5">
          <SocialBar onLike={onLike} onComment={onComment} onShare={onShare} />

          {/* Add to Cart Button */}
          <button
            onClick={onAddToCart}
            className="bg-yellow-400 rounded-full px-6 py-3 text-white"
          >
            Cart
          </button>
        </div>
      </div>
    </div>
  );
}
