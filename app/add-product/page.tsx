"use client";

import { Suspense } from "react";
import InventoryInput from "@/app/components/inventory-input";
import MoneyInput, { MoneyInputValues } from "@/app/components/money-input";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowLeft, ArrowRight, ImagePlus, Plus } from "lucide-react";
import Link from "next/link";
import {
  Dispatch,
  JSX,
  ReactNode,
  SetStateAction,
  useState,
  useEffect,
  useRef,
  // act,
} from "react";
import { Input } from "../components/ui/input";
import { useSearchParams } from "next/navigation";
import { Facebook, Share2 } from "lucide-react";
import Image from "next/image";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/app/lib/client/firebase";
import {
  useFirebaseAuth,
  useProductMediaUpload,
  useProductMediaDelete,
} from "@/app/hooks/firebase";

enum Page {
  MEDIA = 1,
  DESCRIPTION = 2,
  PRICE = 3,
  SUCCESS = 4,
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

function Container({
  backgroundImage,
  nextPage,
  children,
}: {
  backgroundImage: string | null;
  nextPage: Page | null;
  children: ReactNode;
}) {
  return backgroundImage ? (
    <div
      className="fixed inset-0 mx-auto max-w-md bg-amber-400/75 bg-cover bg-blend-overlay"
      style={{
        backgroundImage,
      }}
    >
      <div className="fixed inset-0 mx-auto flex max-w-md flex-col p-4 backdrop-blur-md">
        {children}
      </div>
    </div>
  ) : nextPage ? (
    <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col bg-[#FED15B] p-4">
      {children}
    </div>
  ) : (
    <div className="fixed inset-0 mx-auto max-w-md bg-gradient-to-b from-[#FF5640] to-[#FFC640]">
      {children}
    </div>
  );
}

function TopNavigation({ page }: { page: Page }) {
  const searchParams = useSearchParams();
  const name =
    searchParams.get("step") === "Update" ? "Update Product" : "New Product";
  const cancelLink = searchParams.get("cancel") || "/";
  return page !== Page.SUCCESS ? (
    <div className="flex flex-row items-center justify-between">
      <Button
        className="basis-1/3 justify-start text-lg font-bold text-[#703600]/50"
        variant="addProductSecondary"
        asChild
      >
        <Link href={cancelLink}>Cancel</Link>
      </Button>
      <h1 className="text-center text-lg font-bold text-black">{name}</h1>
      <div className="basis-1/3"></div>
    </div>
  ) : null;
}

function BottomNavigation({
  previousPage,
  nextPage,
  setPage,
  onPost,
}: {
  previousPage: Page | null;
  nextPage: Page | null;
  setPage: Dispatch<SetStateAction<Page>>;
  onPost: () => void;
}) {
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("step") === "Update";
  return (
    <div className="fixed bottom-5 left-1/2 mt-2 flex flex-row items-center justify-end">
      {!previousPage && (
        <Button
          className="invisible text-lg text-black/50"
          variant="addProductSecondary"
        >
          <ArrowLeft className="mr-1 size-4 text-black/50" /> Back
        </Button>
      )}
      {previousPage && previousPage !== Page.PRICE && (
        <Button
          className="text-lg text-black/50"
          variant="addProductSecondary"
          onClick={function () {
            setPage(previousPage);
          }}
        >
          <ArrowLeft className="mr-1 size-4 text-black/50" /> Back
        </Button>
      )}
      {nextPage && nextPage !== Page.SUCCESS ? (
        <Button
          className={"bg-white text-lg font-bold"}
          variant="addProduct"
          onClick={function () {
            setPage(nextPage);
          }}
        >
          Next <ArrowRight className="ml-1 size-4" />
        </Button>
      ) : nextPage && !isEditing ? (
        <Button
          className="bg-white text-lg font-bold"
          variant="addProduct"
          onClick={function () {
            setPage(nextPage);
            onPost();
            console.log("post!");
          }}
        >
          Post <ArrowRight className="ml-1 size-4" />
        </Button>
      ) : nextPage ? (
        <Button
          className="bg-white text-lg font-bold"
          variant="addProduct"
          onClick={function () {
            // onPost;
            console.log("update!");
            window.location.href = "/inventory"; // TODO: temp fix
          }}
        >
          Update <ArrowRight className="ml-1 size-4" />
        </Button>
      ) : null}
    </div>
  );
}

function PageIndicator({ page }: { page: Page }) {
  return page !== Page.SUCCESS ? (
    <div className="mb-4 flex space-x-2">
      {[Page.MEDIA, Page.DESCRIPTION, Page.PRICE].map((item) =>
        item == page ? (
          <div key={item} className="h-1 grow rounded-full bg-amber-100"></div>
        ) : (
          <div key={item} className="h-1 grow rounded-full bg-black/80"></div>
        ),
      )}
    </div>
  ) : null;
}

function MediaPicker({
  handleFileUpload,
  mediaUrls,
  isUploading,
  setIsUploading,
  setMediaUrls,
  deleteMedia,
}: {
  handleFileUpload: (file: File) => Promise<string | undefined>;
  mediaUrls: string[];
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  setMediaUrls: (mediaUrls: string[]) => void;
  deleteMedia: (
    url: string,
    options?: { onSuccess?: () => void; onError?: (error: Error) => void },
  ) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Image editing state
  const [imageEdits, setImageEdits] = useState<
    { scale: number; x: number; y: number }[]
  >([]);
  const [currentScale, setCurrentScale] = useState(1);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });

  // Debug state
  const [debugInfo, setDebugInfo] = useState("");

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Initialize image edits when media URLs change
  useEffect(() => {
    // Initialize edits for new images
    if (mediaUrls.length > imageEdits.length) {
      setImageEdits((prev) => [
        ...prev,
        ...Array(mediaUrls.length - prev.length).fill({ scale: 1, x: 0, y: 0 }),
      ]);
    }
  }, [mediaUrls, imageEdits.length]);

  // Set current edit values when entering edit mode
  useEffect(() => {
    if (isEditMode && imageEdits[activeIndex]) {
      setCurrentScale(imageEdits[activeIndex].scale);
      setCurrentPosition({
        x: imageEdits[activeIndex].x,
        y: imageEdits[activeIndex].y,
      });
      console.log(
        "Entering edit mode for image",
        activeIndex,
        "with edits:",
        imageEdits[activeIndex],
      );
    }
  }, [isEditMode, activeIndex, imageEdits]);

  const handleClick = () => {
    if (mediaUrls.length === 0) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("File selected:", files[0].name);
      try {
        setIsUploading(true);
        const result = await handleFileUpload(files[0]);
        console.log("Upload result:", result);
        setActiveIndex(mediaUrls.length); // Set to the newly added image
      } catch (error) {
        console.error("Error in handleFileChange:", error);
      }
    }
  };

  const handleRemoveMedia = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();

    const removedUrl = mediaUrls[index];

    if (removedUrl.startsWith("https://")) {
      deleteMedia(removedUrl, {
        onSuccess: () => {
          console.log("Deleted from Firebase:", removedUrl);
        },
        onError: (error) => {
          console.error("Error deleting from Firebase:", error);
        },
      });
    }

    const newMediaUrls = [...mediaUrls];
    newMediaUrls.splice(index, 1);
    setMediaUrls(newMediaUrls);

    // Also remove from edits
    const newImageEdits = [...imageEdits];
    newImageEdits.splice(index, 1);
    setImageEdits(newImageEdits);

    if (activeIndex >= newMediaUrls.length) {
      setActiveIndex(Math.max(0, newMediaUrls.length - 1));
    }
    console.log("Removed media at index:", index);
  };

  const handleEditMedia = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex(index);
    setIsEditMode(true);
    console.log("Edit mode activated for image", index);
  };

  const handleDoneEditing = () => {
    // Save the current edits
    const newImageEdits = [...imageEdits];
    newImageEdits[activeIndex] = {
      scale: currentScale,
      x: currentPosition.x,
      y: currentPosition.y,
    };
    setImageEdits(newImageEdits);
    setIsEditMode(false);
    console.log(
      "Saved edits for image",
      activeIndex,
      ":",
      newImageEdits[activeIndex],
    );
  };

  const addMoreMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
    console.log("Add more media");
  };

  // Simple drag implementation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode) return;

    e.preventDefault();
    console.log("Mouse down detected at", e.clientX, e.clientY);
    setDebugInfo(`Mouse down detected. Drag to move.`);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = currentPosition.x;
    const startPosY = currentPosition.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      console.log("Mouse move event", moveEvent.clientX, moveEvent.clientY);
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      // Limit movement based on scale
      const maxOffset = (currentScale - 1) * 150; // Increased range for more movement
      const newX = Math.min(maxOffset, Math.max(-maxOffset, startPosX + dx));
      const newY = Math.min(maxOffset, Math.max(-maxOffset, startPosY + dy));

      setCurrentPosition({ x: newX, y: newY });
      setDebugInfo(`Dragging: ${newX.toFixed(0)}, ${newY.toFixed(0)}`);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      console.log("Mouse up, drag ended");
      setDebugInfo(`Click and drag to move. Scroll to zoom.`);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Simple zoom implementation
  const handleWheel = (e: React.WheelEvent) => {
    if (!isEditMode) return;

    e.preventDefault();

    // Make zooming more responsive
    const delta = e.deltaY * -0.005;
    const newScale = Math.min(3, Math.max(1, currentScale + delta));

    // Apply zoom centered on cursor position
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate normalized position (0-1)
    const normX = mouseX / rect.width;
    const normY = mouseY / rect.height;

    // Calculate the focal point in image coordinates
    const imgX = (normX - 0.5) * rect.width;
    const imgY = (normY - 0.5) * rect.height;

    // Adjust position to keep focal point under cursor
    const scaleFactor = newScale / currentScale;
    const newPosX = currentPosition.x + imgX * (1 - scaleFactor);
    const newPosY = currentPosition.y + imgY * (1 - scaleFactor);

    setCurrentScale(newScale);
    setCurrentPosition({ x: newPosX, y: newPosY });

    setDebugInfo(`Zoom: ${newScale.toFixed(2)}`);
  };

  // Handle scroll snap and update active index
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || containerWidth === 0) return;

      const scrollLeft = scrollContainerRef.current.scrollLeft;
      // Calculate the item width based on the container width and the preview size
      const itemWidth = containerWidth * 0.85 + 16; // 85% of container width + margin
      const newIndex = Math.round(scrollLeft / itemWidth);

      if (newIndex !== activeIndex && newIndex < mediaUrls.length) {
        setActiveIndex(newIndex);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [activeIndex, mediaUrls.length, containerWidth]);

  // Scroll to active index when it changes
  useEffect(() => {
    if (scrollContainerRef.current && !isEditMode && containerWidth > 0) {
      // Calculate the item width based on the container width and the preview size
      const itemWidth = containerWidth * 0.85 + 16; // 85% of container width + margin

      scrollContainerRef.current.scrollTo({
        left: activeIndex * itemWidth,
        behavior: "smooth",
      });
    }
  }, [activeIndex, isEditMode, containerWidth]);

  // Check if current image is the last one
  const isLastImage = activeIndex === mediaUrls.length - 1;

  // Add this touch handler function
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isEditMode) return;

    console.log("Touch start detected");
    setDebugInfo("Touch detected - drag to move");

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const startPosX = currentPosition.x;
    const startPosY = currentPosition.y;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const touchMove = moveEvent.touches[0];
      const dx = touchMove.clientX - startX;
      const dy = touchMove.clientY - startY;

      // Limit movement based on scale
      const maxOffset = (currentScale - 1) * 150;
      const newX = Math.min(maxOffset, Math.max(-maxOffset, startPosX + dx));
      const newY = Math.min(maxOffset, Math.max(-maxOffset, startPosY + dy));

      setCurrentPosition({ x: newX, y: newY });
      console.log("Touch move to", newX, newY);
      setDebugInfo(`Moving: ${newX.toFixed(0)}, ${newY.toFixed(0)}`);

      // Prevent default to avoid scrolling
      moveEvent.preventDefault();
    };

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      console.log("Touch ended");
      setDebugInfo("Touch and drag to move. Pinch to zoom.");
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <div className="flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Container for media and plus button */}
      <div className="relative">
        {/* Horizontal scrollable container */}
        <div
          ref={scrollContainerRef}
          className={`scrollbar-hide relative flex w-full snap-x snap-mandatory overflow-x-auto ${isEditMode ? "pointer-events-none" : ""}`}
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Media items */}
          {mediaUrls.length > 0 ? (
            <>
              {mediaUrls.map((url, index) => {
                const fileExtension = url
                  .split(".")
                  .pop()
                  ?.toLowerCase()
                  .split("?")[0];
                const isVideo =
                  fileExtension === "mp4" || fileExtension === "mov";
                const isImage =
                  fileExtension === "jpg" ||
                  fileExtension === "jpeg" ||
                  fileExtension === "png" ||
                  fileExtension === "gif" ||
                  fileExtension === "bmp";

                const isActive = index === activeIndex;
                const edit = imageEdits[index] || { scale: 1, x: 0, y: 0 };
                const scale =
                  isActive && isEditMode ? currentScale : edit.scale;
                const posX =
                  isActive && isEditMode ? currentPosition.x : edit.x;
                const posY =
                  isActive && isEditMode ? currentPosition.y : edit.y;

                return (
                  <div
                    key={index}
                    className="relative mr-4 shrink-0 snap-center"
                    style={{
                      width: "85%", // Make image width smaller to show preview of next image
                      height: "500px",
                    }}
                  >
                    <div
                      className={`relative size-full cursor-pointer overflow-hidden rounded-lg bg-black/20 hover:bg-black/30 ${isActive && isEditMode ? "editing" : ""}`}
                    >
                      {isVideo ? (
                        <div
                          className="video-container size-full"
                          style={{
                            transform: `translate(${posX}px, ${posY}px) scale(${scale})`,
                            transformOrigin: "center",
                            transition: "transform 0.1s ease-out",
                          }}
                        >
                          <video
                            src={url || "/placeholder.svg"}
                            autoPlay
                            loop
                            playsInline
                            className="inline-block size-full rounded-lg object-cover"
                          />
                          <source src={url} type={`video/${fileExtension}`} />
                        </div>
                      ) : isImage ? (
                        <div
                          className="relative size-full cursor-move touch-manipulation"
                          style={{
                            transform: `translate(${posX}px, ${posY}px) scale(${scale})`,
                            transformOrigin: "center",
                            transition: "transform 0.05s ease-out", // Faster transition for more responsive feel
                          }}
                          onMouseDown={
                            isActive && isEditMode ? handleMouseDown : undefined
                          }
                          onWheel={
                            isActive && isEditMode ? handleWheel : undefined
                          }
                          onTouchStart={
                            isActive && isEditMode
                              ? handleTouchStart
                              : undefined
                          }
                          onClick={() => {
                            if (isActive && isEditMode) {
                              console.log("Image clicked in edit mode");
                            }
                          }}
                        >
                          <img
                            src={url || "/placeholder.svg"}
                            alt="Uploaded media"
                            className="absolute size-full rounded-lg object-cover"
                            draggable="false"
                          />
                        </div>
                      ) : null}

                      {/* Grid overlay for edit mode */}
                      {isActive && isEditMode && (
                        <div className="pointer-events-none absolute inset-0">
                          {/* Vertical lines */}
                          <div className="absolute left-1/3 top-0 h-full w-px bg-white/50"></div>
                          <div className="absolute left-2/3 top-0 h-full w-px bg-white/50"></div>

                          {/* Horizontal lines */}
                          <div className="absolute left-0 top-1/3 h-px w-full bg-white/50"></div>
                          <div className="absolute left-0 top-2/3 h-px w-full bg-white/50"></div>
                        </div>
                      )}

                      {/* Edit button (pencil icon) */}
                      {!isEditMode && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 size-8 rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50"
                          onClick={(e) => handleEditMedia(index, e)}
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="size-full"
                          >
                            <path
                              d="M17 3C17.2626 2.73735 17.5744 2.52901 17.9176 2.38687C18.2608 2.24473 18.6286 2.17157 19 2.17157C19.3714 2.17157 19.7392 2.24473 20.0824 2.38687C20.4256 2.52901 20.7374 2.73735 21 3C21.2626 3.26264 21.471 3.57444 21.6131 3.9176C21.7553 4.26077 21.8284 4.62856 21.8284 5C21.8284 5.37143 21.7553 5.73923 21.6131 6.08239C21.471 6.42555 21.2626 6.73735 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Button>
                      )}

                      {/* Delete button (trash icon) - at bottom left */}
                      {!isEditMode && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute bottom-2 left-2 size-8 rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50"
                          onClick={(e) => handleRemoveMedia(index, e)}
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="size-full"
                          >
                            <path
                              d="M3 6H5H21"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          ) : isUploading ? (
            <div
              className="flex shrink-0 snap-center"
              style={{ width: "85%", height: "500px", marginRight: "16px" }}
            >
              <div className="flex size-full flex-col items-center justify-center rounded-lg bg-black/20">
                <div className="animate-pulse">
                  <ImagePlus className="size-10 text-white/90" />
                </div>
                <p className="text-wrap text-center text-xl text-white/90">
                  Uploading...
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex shrink-0 snap-center"
              style={{ width: "85%", height: "500px", marginRight: "16px" }}
              onClick={handleClick}
            >
              <div className="flex size-full cursor-pointer flex-col items-center justify-center rounded-lg bg-black/20 px-8 hover:bg-black/30">
                <ImagePlus className="size-10 text-white/90" />
                <p className="text-wrap text-center text-xl text-white/90">
                  Add up to 60 seconds of video or photo
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Plus button in the sliver for the last image */}
        {mediaUrls.length > 0 && isLastImage && !isEditMode && (
          <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2">
            <Button
              variant="ghost"
              size="icon"
              className="size-14 rounded-full border-8 border-black/50 p-0"
              onClick={addMoreMedia}
            >
              <Plus className="text-black" />
            </Button>
          </div>
        )}
      </div>

      {/* Debug info */}
      {isEditMode && (
        <div className="rounded mt-2 bg-black/20 p-3 text-center text-sm font-medium text-black">
          <strong>Mac Trackpad:</strong> Click and drag with one finger to move.
          Two-finger scroll to zoom.
          <br />
          <span className="text-xs">{debugInfo}</span>
        </div>
      )}

      {/* Edit controls */}

      {/* Fixed bottom section for buttons and text */}
      <div className="relative mt-4 h-16">
        {/* Dot indicators */}
        {mediaUrls.length > 1 && !isEditMode && (
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {mediaUrls.map((_, index) => (
                <button
                  key={index}
                  className={`size-2 rounded-full ${activeIndex === index ? "bg-black" : "bg-black/30"}`}
                  onClick={() => {
                    setActiveIndex(index);
                    // Force scroll to the correct position
                    if (scrollContainerRef.current && containerWidth > 0) {
                      // Calculate the item width based on the container width and the preview size
                      const itemWidth = containerWidth * 0.85 + 16; // 85% of container width + margin

                      scrollContainerRef.current.scrollTo({
                        left: index * itemWidth,
                        behavior: "smooth",
                      });
                    }
                  }}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Only show "Press and hold to reorder" when in edit mode */}
        {isEditMode && mediaUrls.length > 0 && (
          <p className="absolute inset-x-0 top-0 text-center text-sm text-black/70">
            Press and hold to reorder
          </p>
        )}

        {/* Done button for edit mode */}
        {isEditMode && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center">
            <Button
              className="rounded-full bg-white px-8 py-2 text-lg font-semibold text-black shadow-md"
              onClick={handleDoneEditing}
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ProductDescriptionProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  selectedTags: Tag[];
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  defaultTags: Tag[];
  setDefaultTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

function ProductDescription({
  name,
  setName,
  description,
  setDescription,
  selectedTags,
  setSelectedTags,
  defaultTags,
  setDefaultTags,
}: ProductDescriptionProps) {
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  const tagWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tagWrapperRef.current &&
        !tagWrapperRef.current.contains(event.target as Node)
      ) {
        setIsTagsOpen(false);
      }
    }

    if (isTagsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTagsOpen]);

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.some((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag],
    );
  };

  return (
    <div className="flex grow flex-col items-start justify-start">
      {/* Wrapper for 'Item Name' and 'Tags' */}
      <div className="mt-0 flex w-full max-w-[calc(100%-2rem)] items-center">
        {/* Growable wrapper around the 'Item Name' input */}
        <div className="grow">
          <Input
            placeholder={"Item Name"}
            className="w-full border-0 bg-transparent px-0 py-2 text-xl font-bold text-black/75 placeholder:text-black/50 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* 'Tags' button, only show when the dropdown is closed */}
        {!isTagsOpen && (
          <Button
            variant="outline"
            className="ml-4 bg-white/90 hover:bg-white/95"
            onClick={() => setIsTagsOpen(true)}
          >
            Tags
          </Button>
        )}

        {/* Dropdown for tags selection, show when the button is clicked */}
        <div ref={tagWrapperRef} className="relative">
          {isTagsOpen && (
            <div className="z-100000 fixed right-5 top-2 mt-12 w-full max-w-xs rounded-md">
              <div className="p-4">
                <div className="flex flex-nowrap gap-2 overflow-x-auto p-2">
                  {defaultTags.map((tag) => {
                    const isSelected = selectedTags.some(
                      (t) => t.id === tag.id,
                    );
                    return (
                      <Button
                        key={tag.id}
                        variant="outline"
                        className="rounded-full px-2 py-1 transition-all duration-200"
                        style={{
                          backgroundColor: tag.color,
                          boxShadow: "none",
                          filter: isSelected ? "saturate(2)" : "saturate(1)",
                          border: isSelected
                            ? "2px solid rgba(0,0,0,0.6)"
                            : "2px solid transparent",
                        }}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag.name}
                      </Button>
                    );
                  })}

                  {isAddingTag ? (
                    <input
                      type="text"
                      autoFocus
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newTagName.trim() !== "") {
                          const newTag = {
                            id: Date.now().toString(),
                            name: newTagName.trim(),
                            color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 90%)`, // Random background color
                          };
                          setDefaultTags([...defaultTags, newTag]);
                          toggleTag(newTag);
                          setNewTagName("");
                          setIsAddingTag(false);
                        } else if (e.key === "Escape") {
                          setNewTagName("");
                          setIsAddingTag(false);
                        }
                      }}
                      className="rounded-full border px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      style={{ minWidth: "6rem" }}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setIsAddingTag(true)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Textarea for description */}
      <Textarea
        placeholder={"Write a short description of your product..."}
        className="grow border-0 bg-transparent px-0 text-black/75 placeholder:text-black/50 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* AI suggestion button */}
      {/* <Button className="mb-2 h-6 text-sm" variant="addProduct">
        Write with AI <Wand />
      </Button> */}
    </div>
  );
}

interface PriceAndShippingProps {
  price: number;
  setPrice: (price: number) => void;
  inventory: number;
  setInventory: (inventory: number) => void;
}

function PriceAndShipping({
  price,
  setPrice,
  inventory,
  setInventory,
}: PriceAndShippingProps) {
  const [shipping, setShipping] = useState<MoneyInputValues | null>(null);
  const [priceInput, setPriceInput] = useState<MoneyInputValues | null>({
    value: price.toString(),
    formatted: price.toLocaleString(),
    float: price,
  });

  useEffect(() => {
    if (priceInput?.float !== undefined && priceInput.float !== null) {
      setPrice(priceInput.float);
    }
  }, [priceInput?.float, setPrice]);

  return (
    <div className="mt-32 flex grow flex-col items-center justify-start">
      <MoneyInput
        className="text-8xl"
        values={priceInput}
        onValuesChange={setPriceInput}
      />
      <div className="flex flex-row gap-2">
        <div className="flex flex-col items-center justify-start gap-2">
          <h4 className="text-xl font-bold">Inventory:</h4>
          <InventoryInput
            inventory={inventory}
            onInventoryChange={setInventory}
          />
        </div>
        <div className="flex flex-col items-start justify-start gap-2">
          <h4 className="text-xl font-bold">Shipping:</h4>
          <MoneyInput
            className="text-2xl font-bold"
            values={shipping}
            onValuesChange={setShipping}
          />
        </div>
      </div>
    </div>
  );
}

function SuccessPage({ productImage = "/placeholder.svg", name = "" }) {
  return (
    <div className="mx-auto flex h-screen grow flex-col items-start justify-start">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-8 mt-12 space-y-2">
          <h1 className="text-xl font-bold text-white">
            You&apos;re on the market!
          </h1>
          <p className="text-2xl font-bold text-white">{name}</p>
          <p className="text-xl font-semibold text-white">
            is up on your store.
          </p>
        </div>

        <div className="relative h-[30vh] w-full">
          <Image
            src={productImage}
            alt="Product showcase"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="mb-6">
          <h2 className="mb-4 text-base font-semibold text-white">
            Share your new item
          </h2>
          <div className="flex justify-center gap-4">
            {[
              { name: "Facebook", icon: <Facebook className="size-6" /> },
              { name: "Reddit", icon: <Share2 className="size-6" /> },
              { name: "Instagram", icon: <Share2 className="size-6" /> },
              { name: "TikTok", icon: <Share2 className="size-6" /> },
              { name: "Snapchat", icon: <Share2 className="size-6" /> },
            ].map((platform) => (
              <Button
                key={platform.name}
                variant="addProduct"
                size="icon"
                className="size-14 rounded-full bg-white/90 p-4"
                aria-label={`Share on ${platform.name}`}
              >
                {platform.icon}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Button
            asChild
            variant="onboarding"
            className="rounded-full bg-white px-8 py-2 text-lg font-semibold text-black shadow-md"
          >
            <Link href="/">View Shop</Link>
          </Button>
          <Button
            asChild
            variant="addProductSecondary"
            className="w-full text-lg font-semibold text-[#703600]/50"
          >
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddProductContent() {
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || Page.MEDIA;

  const [page, setPage] = useState(initialPage);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [inventory, setInventory] = useState<number>(1);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const { user } = useFirebaseAuth();
  const mediaUpload = useProductMediaUpload();
  const { mutate: deleteMedia } = useProductMediaDelete();
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [defaultTags, setDefaultTags] = useState<Tag[]>([]); // For what ui displays
  const [ogTags, setOgTags] = useState<Tag[]>([]); // For backend updates

  useEffect(() => {
    const fetchTagsFromShop = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const shopsRef = collection(db, "shops");
      const q = query(shopsRef, where("creatorId", "==", user.uid));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const shopData = snapshot.docs[0].data();
        const categories: string[] = shopData.categories || [];

        // Exclude "All" (case-insensitive, if needed)
        console.log("categories", categories);
        const filteredCategories = categories.filter(
          (category) => category.toLowerCase() !== "all",
        );

        console.log("filtered categories", filteredCategories);

        const hueStep = 45; // You can adjust this for tighter or looser spacing
        const generatedTags: Tag[] = filteredCategories.map(
          (category, index) => ({
            id: (index + 1).toString(),
            name: category,
            color: `hsl(${(index * hueStep) % 360}, 100%, 90%)`, // evenly spaced hues
          }),
        );

        setDefaultTags(generatedTags);
        setOgTags(generatedTags);
        console.log("got OG:", ogTags);
      }
    };

    fetchTagsFromShop();
  }, [user]);

  const handlePost = async () => {
    try {
      if (!auth.currentUser) {
        console.error("No authenticated user found!");
        return;
      }

      console.log("Posting product with media URLs:", mediaUrls);

      const productRef = collection(db, "products");
      await addDoc(productRef, {
        name,
        description,
        price,
        tags: selectedTags.map((tag) => tag.name),
        inventory,
        mediaUrls,
        isListed: true,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Check for new tags that are not in the original tags
      const oldTags = ogTags.map((tag) => tag.name);
      const newTags = selectedTags
        .map((tag) => tag.name)
        .filter((tagName) => !oldTags.includes(tagName));

      console.log("To update tags", oldTags, newTags);
      console.log(
        "selected tags",
        selectedTags.map((tag) => tag.name),
      );

      if (newTags.length > 0) {
        const shopsRef = collection(db, "shops");
        const q = query(
          shopsRef,
          where("creatorId", "==", auth.currentUser.uid),
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const shopDoc = snapshot.docs[0];
          const updatedCategories = ["All", ...oldTags, ...newTags];
          console.log("updatedcategories", updatedCategories);

          // Update the categories field with the new tags
          await updateDoc(shopDoc.ref, {
            categories: updatedCategories,
          });
        }
      }

      console.log("Product created successfully");
      setPage(Page.SUCCESS);
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    setIsUploading(true);

    try {
      // Use the hook's mutation function instead of reimplementing upload logic
      const downloadURL = await mediaUpload.mutateAsync({
        file: file,
        userId: user.uid,
      });

      console.log("File available at", downloadURL);
      console.log("File type:", file.type);

      // Add to the media URLs state
      setMediaUrls((prev) => [...prev, downloadURL]);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);

      // Log error details for debugging
      if (error instanceof Error) {
        console.log("Error name:", error.name);
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
      }

      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  let content: JSX.Element;
  let nextPage: Page | null = null;
  let previousPage: Page | null = null;
  let backgroundImage: string | null = null;
  if (page == Page.MEDIA) {
    nextPage = Page.DESCRIPTION;
    content = (
      <MediaPicker
        handleFileUpload={handleFileUpload}
        mediaUrls={mediaUrls}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        setMediaUrls={setMediaUrls}
        deleteMedia={deleteMedia}
      />
    );
  } else if (page == Page.DESCRIPTION) {
    previousPage = Page.MEDIA;
    nextPage = Page.PRICE;
    backgroundImage = mediaUrls[0] ? `url(${mediaUrls[0]})` : ``;
    content = (
      <ProductDescription
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        defaultTags={defaultTags}
        setDefaultTags={setDefaultTags}
      />
    );
  } else if (page == Page.PRICE) {
    previousPage = Page.DESCRIPTION;
    nextPage = Page.SUCCESS;
    backgroundImage = mediaUrls[0] ? `url(${mediaUrls[0]})` : ``;
    content = (
      <PriceAndShipping
        price={price}
        setPrice={setPrice}
        inventory={inventory}
        setInventory={setInventory}
      />
    );
  } else if (page == Page.SUCCESS) {
    previousPage = Page.PRICE;
    content = (
      <SuccessPage
        productImage={mediaUrls[0] ? mediaUrls[0] : "/placeholder.svg"}
        name={name}
      />
    );
  } else {
    throw Error("Unknown page");
  }

  return (
    <Container backgroundImage={backgroundImage} nextPage={nextPage}>
      <TopNavigation page={page} />
      <PageIndicator page={page} />
      {content}
      <BottomNavigation
        previousPage={previousPage}
        nextPage={nextPage}
        setPage={setPage}
        onPost={handlePost}
      />
    </Container>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddProductContent />
    </Suspense>
  );
}
