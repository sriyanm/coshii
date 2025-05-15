import { useState, useRef, useEffect, forwardRef } from "react";
import { SocialBar } from "./SocialBar";
import { Caption } from "./Caption";
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
    const [playing, setPlaying] = useState(true);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // Scroll behavior: keep track of image index for dots at top
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.clientWidth;
      const index = Math.round(scrollLeft / width);
      setCurrentIndex(index);
    };

    const toggleMute = () => {
      setMuted(!muted);
      if (videoRef.current) {
        videoRef.current.muted = !muted;
      }
    };

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

    const onDMCreator = () => {
      console.log("Should DM Creator");
    };

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!videoRef.current) return;
          const video = videoRef.current;

          if (entry.isIntersecting) {
            if (playing && video.paused) {
              video.play();
            }
          } else {
            if (!video.paused) {
              video.pause();
            }
          }
        },
        { threshold: 0.5 },
      );

      observer.observe(video);
      return () => observer.disconnect();
    }, [playing, currentIndex]);

    return (
      <div
        id={`product-${id}`}
        className="relative h-[70vh] w-[95vw] max-w-md bg-white"
        ref={ref}
      >
        {/* Scrollable Media */}
        <div
          ref={scrollContainerRef}
          className="relative size-full overflow-x-auto overflow-y-hidden whitespace-nowrap rounded-lg"
          onScroll={handleScroll}
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {media.map((item, index) => {
            const isVideo =
              item.split("?")[0].endsWith(".mp4") ||
              item.split("?")[0].endsWith(".mov");

            return (
              <div
                key={index}
                className="relative inline-block size-full"
                style={{ scrollSnapAlign: "start", flexShrink: 0 }}
              >
                {isVideo ? (
                  <>
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
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      {!playing && (
                        <div className="flex size-16 items-center justify-center rounded-full bg-black bg-opacity-50">
                          <span className="text-4xl text-white">▶</span>
                        </div>
                      )}
                    </div>
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
                  </>
                ) : (
                  <Image
                    key={index}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={item}
                    alt={`${productName} - media ${index + 1}`}
                    className="inline-block size-full rounded-lg object-cover"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Top Navigation Dots */}
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

        {/* Bottom Caption & Buttons */}
        <div className="via-black/1 absolute bottom-0 left-0 flex w-full items-end justify-between rounded-lg bg-gradient-to-t from-black/10 to-transparent p-5">
          <div className="z-9 flex flex-col pr-10 text-white drop-shadow">
            <p className="text-md mb-0 font-bold">{productName}</p>
            <p className="text-md -mt-1 mb-1 font-semibold">{price}</p>
            <Caption caption={caption} />
            {!isPremium ? (
              <button
                onClick={onDMCreator}
                className="mt-2 rounded-full bg-white px-6 py-2 text-black shadow"
              >
                DM Creator
              </button>
            ) : (
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
              productId={id.split("-")[1]}
            />
          </div>
        </div>
      </div>
    );
  },
);

ProductPage.displayName = "ProductPage";
