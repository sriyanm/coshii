import { useState, useRef, UIEvent } from "react";
import { SocialBar } from "./SocialBar"; // Import the SocialBar component
import { Caption } from "./Caption"; // Import Caption component

interface ProductPageProps {
  productImages: string[];
  caption: string;
  productName: string;
  price: string;
  onAddToCart: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export function ProductPage({
  productImages,
  caption,
  productName,
  price,
  onAddToCart,
  onLike,
  onComment,
  onShare,
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
    <div className="relative h-[70vh] w-[95vw] bg-white">
      {/* Media (scrollable images/videos) */}
      <div
        ref={scrollContainerRef}
        className="size-full overflow-x-auto scroll-smooth whitespace-nowrap rounded-lg"
        onScroll={handleScroll}
      >
        {productImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${productName} - image ${index + 1}`}
            className="inline-block size-full rounded-lg object-cover"
          />
        ))}
      </div>

      {/* Image Navigation Dots (Top Center) */}
      <div className="z-9 absolute left-1/2 top-4 flex -translate-x-1/2 space-x-2">
        {productImages.map((_, index) => (
          <div
            key={index}
            className={`size-1.5 rounded-full bg-white ${currentImageIndex === index ? "bg-opacity-100" : "bg-opacity-50"}`}
          />
        ))}
      </div>

      {/* Image Navigation (Swipe/Toggle Images) */}
      <div className="sticky bottom-4 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
        {productImages.map((_, index) => (
          <div
            key={index}
            className={`size-3 rounded-full bg-white ${
              currentImageIndex === index ? "bg-opacity-100" : "bg-opacity-50"
            }`}
          />
        ))}
      </div>

      {/* Bottom Left Caption */}
      <div className="absolute bottom-0 left-0 flex w-full items-end justify-between rounded-lg bg-black bg-opacity-50 p-5">
        <div className="z-9 flex flex-col pr-10 text-white">
          <p className="text-md mb-0 font-bold">{productName}</p>
          <p className="text-md -mt-1 mb-1 font-semibold">{price}</p>
          <Caption caption={caption} />
          <button
            onClick={onAddToCart}
            className="mt-2 rounded-full bg-white px-6 py-2 text-black"
          >
            Add to Cart
          </button>
        </div>

        {/* Social Bar */}
        <div className="relative -top-3 z-10 flex flex-col items-center space-y-4">
          <SocialBar onLike={onLike} onComment={onComment} onShare={onShare} />
        </div>
      </div>
    </div>
  );
}
