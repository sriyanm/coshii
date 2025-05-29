import { useState, useRef, useEffect, forwardRef } from "react";
import { SocialBar } from "./SocialBar";
import { MdVolumeOff, MdVolumeUp } from "react-icons/md";
import { DMCreatorButton } from "./DMCreatorButton";
import Image from "next/image";
import { Shop } from "../types";

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
  shopData: Shop;
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
      shopData,
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

    const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
    const toggleCaption = () => setIsCaptionExpanded((prev) => !prev);
    const captionRef = useRef<HTMLDivElement>(null);
    const [maxHeight, setMaxHeight] = useState("3rem"); // Initial collapsed height

    useEffect(() => {
      if (captionRef.current) {
        const scrollHeight = captionRef.current.scrollHeight;
        setMaxHeight(isCaptionExpanded ? `${scrollHeight}px` : "3rem");
      }
    }, [isCaptionExpanded, caption]);

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
              item.split("?")[0].toLowerCase().endsWith(".mp4") ||
              item.split("?")[0].toLowerCase().endsWith(".mov");

            return (
              <div
                key={index}
                className="relative inline-block size-full align-top"
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
                      className="absolute right-5 top-5 rounded-full bg-neutral-700/40 p-2 text-white shadow-md"
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

        {/* Bottom Caption & Buttons - Updated for smooth transition */}
        <div className="absolute bottom-0 left-0 min-h-48 w-full rounded-lg">
          {/* Base gradient that stays constant */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/10 to-transparent"></div>

          {/* Overlay with transitioning opacity that's also a gradient */}
          <div
            className={`absolute inset-0 rounded-lg bg-gradient-to-t from-black via-black/80 via-40% to-transparent backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isCaptionExpanded ? "opacity-50" : "opacity-0"} `}
          ></div>

          {/* Content positioned on top of the gradients */}
          <div className="relative -top-2 flex min-h-48 w-full items-end justify-between p-5">
            {/* Left Column */}
            <div className="z-9 flex h-full grow flex-col justify-between pr-4 text-white drop-shadow">
              <div>
                <p className="mb-0 text-xl font-bold">{productName}</p>
                <p className="-mt-1 mb-1 text-lg font-semibold">{price}</p>

                {/* Animated Caption */}
                <div
                  onClick={toggleCaption}
                  className="max-w-xs cursor-pointer select-none overflow-hidden transition-all duration-500 ease-in-out"
                  style={{ maxHeight }}
                >
                  <div ref={captionRef}>
                    <p className="w-full whitespace-pre-wrap break-words text-base">
                      {isCaptionExpanded
                        ? caption
                        : caption.length > 80
                          ? `${caption.slice(0, 80)}...`
                          : caption}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom-aligned Button */}
              <div>
                {!shopData.isPremium ? (
                  <DMCreatorButton shopData={shopData} />
                ) : (
                  <button
                    onClick={onAddToCart}
                    className="mt-2 w-11/12 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black shadow"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>

            {/* Social Bar */}
            <div className="z-8 relative top-1 flex w-8 flex-col items-center space-y-4">
              <SocialBar
                onLike={onLike}
                onComment={onComment}
                onShare={onShare}
                profilePic={shopData.profilePic}
                buyerView={buyerView}
                likesCountInit={likesCount}
                commentsCountInit={commentsCount}
                productId={id.split("-")[1]}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ProductPage.displayName = "ProductPage";
