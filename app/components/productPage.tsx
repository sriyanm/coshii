import { useState, useRef, UIEvent } from "react";
import { SocialBar } from "./SocialBar"; // Import SocialBar
import { Caption } from "./Caption"; // Import Caption

interface ProductPageProps {
  media: string[]; // Supports both images (.jpg, .png) and videos (.mp4)
  caption: string;
  productName: string;
  price: string;
  onAddToCart: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export function ProductPage({
  media,
  caption,
  productName,
  price,
  onAddToCart,
  onLike,
  onComment,
  onShare,
}: ProductPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrolling, setScrolling] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Handle scrolling images
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (scrolling || !scrollContainerRef.current) return;

    const scrollLeft = event.currentTarget.scrollLeft;
    const imageWidth = event.currentTarget.clientWidth;
    const newIndex = Math.round(scrollLeft / imageWidth);

    if (newIndex !== currentIndex) {
      setScrolling(true);
      setCurrentIndex(newIndex);

      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({
          left: newIndex * imageWidth,
          behavior: "smooth",
        });
      });

      setTimeout(() => setScrolling(false), 300);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    setMuted(!muted);
    if (videoRef.current) {
      videoRef.current.muted = !muted;
    }
  };

  // Toggle Play/Pause when clicking the screen
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  return (
    <div className="relative h-[70vh] w-[95vw] bg-white">
      {/* Media Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="size-full overflow-x-auto scroll-smooth whitespace-nowrap rounded-lg"
        onScroll={handleScroll}
      >
        {media.map((item, index) =>
          item.endsWith(".mp4") ? (
            <div key={index} className="relative inline-block size-full">
              <video
                ref={index === currentIndex ? videoRef : null}
                src={item}
                autoPlay
                loop
                muted={muted}
                playsInline
                className="inline-block size-full rounded-lg object-cover"
                onClick={togglePlayPause}
              />
              {/* Play/Pause Indicator */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                  playing ? "opacity-0" : "opacity-100"
                }`}
              >
                {playing ? null : (
                  <div className="flex size-16 items-center justify-center rounded-full bg-black bg-opacity-50">
                    <span className="text-4xl text-white">
                      {playing ? "▶" : "❚❚"}
                    </span>
                  </div>
                )}
              </div>
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className="absolute bottom-5 right-5 rounded-full bg-black bg-opacity-50 p-2 text-white"
              >
                {muted ? "🔇" : "🔊"}
              </button>
            </div>
          ) : (
            <img
              key={index}
              src={item}
              alt={`${productName} - media ${index + 1}`}
              className="inline-block size-full rounded-lg object-cover"
            />
          ),
        )}
      </div>

      {/* Image Navigation Dots (Top Center) */}
      <div className="absolute left-1/2 top-4 flex -translate-x-1/2 space-x-2">
        {media.map((_, index) => (
          <div
            key={index}
            className={`size-1.5 rounded-full bg-white ${
              currentIndex === index ? "bg-opacity-100" : "bg-opacity-50"
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
        <div className="z-8 relative -top-3 flex flex-col items-center space-y-4">
          <SocialBar onLike={onLike} onComment={onComment} onShare={onShare} />
        </div>
      </div>
    </div>
  );
}
