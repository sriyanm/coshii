import { useState, useRef, useEffect, UIEvent, forwardRef } from "react";
import { SocialBar } from "./SocialBar"; // Import SocialBar
import { Caption } from "./Caption"; // Import Caption
import { MdVolumeOff, MdVolumeUp } from "react-icons/md";
import Image from "next/image";

interface ProductPageProps {
  media: string[]; // Supports both images (.jpg, .png) and videos (.mp4)
  caption: string;
  productName: string;
  price: string;
  onAddToCart: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  buyerView: boolean;
  isPremium: boolean;
  likesCount: number;
  commentsCount: number;
  muted: boolean;
  setMuted: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
}

export const ProductPage = forwardRef<HTMLDivElement, ProductPageProps>(
  (
    {
      media,
      caption,
      productName,
      price,
      onAddToCart,
      onLike,
      onComment,
      onShare,
      buyerView,
      isPremium,
      id,
      likesCount,
      commentsCount,
      muted,
      setMuted,
    },
    ref,
  ) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scrolling, setScrolling] = useState(false);
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
      console.log("toggle PlayPause trigggered");
      if (videoRef.current) {
        if (playing) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setPlaying(!playing);
      }
    };

    // DM creator if no premium access
    const onDMCreator = () => {
      console.log("Should DM Creator");
    };

    useEffect(() => {
      console.log("Playing toggled for", productName, playing);
    }, [playing]);

    // Only play video if on screen
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!videoRef.current) return;

          const video = videoRef.current;

          if (entry.isIntersecting) {
            // Only play if user had it playing before
            if (playing && video.paused) {
              video.play();
            }
          } else {
            // Pause and sync state
            if (!video.paused) {
              video.pause();
            }
          }
        },
        { threshold: 0.5 },
      );

      observer.observe(video);

      return () => {
        observer.disconnect();
      };
    }, [playing, currentIndex]); // currentIndex ensures ref is updated

    return (
      <div
        id={`product-${id}`}
        className="relative h-[70vh] w-[95vw] max-w-md bg-white"
        ref={ref}
      >
        {/* Media Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="relative size-full overflow-x-auto overflow-y-hidden scroll-smooth whitespace-nowrap rounded-lg"
          onScroll={handleScroll}
        >
          {media.map((item, index) =>
            item.split("?")[0].endsWith(".mp4") ||
            item.split("?")[0].endsWith(".mov") ? (
              <div key={index} className="relative inline-block size-full">
                <video
                  ref={index === currentIndex ? videoRef : null}
                  src={item}
                  autoPlay={false}
                  loop
                  muted={muted}
                  playsInline
                  className="inline-block size-full rounded-lg object-cover"
                  onClick={togglePlayPause}
                />
                {/* Play/Pause Indicator */}
                <div
                  className={`pointer-events-none absolute inset-0 flex items-center justify-center`}
                >
                  {playing ? null : (
                    <div className="flex size-16 items-center justify-center rounded-full bg-black bg-opacity-50">
                      <span className="text-4xl text-white">
                        {!playing ? "▶" : "❚❚"}
                      </span>
                    </div>
                  )}
                </div>
                {/* Mute Button */}
                <button
                  onClick={toggleMute}
                  className="absolute right-5 top-5 rounded-full bg-gray-50 bg-opacity-20 p-2 text-white"
                >
                  {muted ? (
                    <MdVolumeOff className="text-2xl" />
                  ) : (
                    <MdVolumeUp className="text-2xl" />
                  )}
                </button>
              </div>
            ) : (
              <div key={index} className="relative inline-block size-full">
                <Image
                  key={index}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src={item}
                  alt={`${productName} - media ${index + 1}`}
                  className="inline-block size-full rounded-lg object-cover"
                />
              </div>
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
        <div className="via-black/1 absolute bottom-0 left-0 flex w-full items-end justify-between rounded-lg bg-gradient-to-t from-black/10 to-transparent p-5">
          <div className="z-9 flex flex-col pr-10 text-white drop-shadow">
            <p className="text-md mb-0 font-bold">{productName}</p>
            <p className="text-md -mt-1 mb-1 font-semibold">{price}</p>
            <Caption caption={caption} />
            {!isPremium && (
              <button
                onClick={onDMCreator}
                className="mt-2 rounded-full bg-white px-6 py-2 text-black shadow"
              >
                DM Creator
              </button>
            )}

            {isPremium && (
              <button
                onClick={onAddToCart}
                className="mt-2 rounded-full bg-white px-6 py-2 text-black shadow"
              >
                Add to Cart
              </button>
            )}
          </div>

          {/* Social Bar */}
          <div className="z-8 relative -top-3 flex flex-col items-center space-y-4">
            <SocialBar
              onLike={onLike}
              onComment={onComment}
              onShare={onShare}
              buyerView={buyerView}
              likesCount={likesCount}
              commentsCount={commentsCount}
              productId={id.split("-")[1]} //Passed in id looks like: product-02rKSxlMzsLLfks7JZDm
            />
          </div>
        </div>
      </div>
    );
  },
);

ProductPage.displayName = "ProductPage";
