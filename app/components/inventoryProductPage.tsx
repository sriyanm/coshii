import { useState, useRef, useEffect, forwardRef } from "react";
import { MdVolumeOff, MdVolumeUp } from "react-icons/md";
import Image from "next/image";

interface InventoryProductPageProps {
  media: string[]; // Supports both images (.jpg, .png) and videos (.mp4)
  productName: string;
  muted: boolean;
  setMuted: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
}

export const InventoryProductPage = forwardRef<HTMLDivElement, InventoryProductPageProps>(
  (
    {
      media,
      productName,
      id,
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
      </div>
    );
  },
);

InventoryProductPage.displayName = "InventoryProductPage";