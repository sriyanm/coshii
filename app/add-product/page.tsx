"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import InventoryInput from "@/app/components/inventory-input";
import MoneyInput, { MoneyInputValues } from "@/app/components/money-input";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowLeft, ArrowRight, ImagePlus } from "lucide-react";
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
import Image from "next/image";
import { MdVolumeOff, MdVolumeUp } from "react-icons/md";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/app/lib/client/firebase";
import {
  useFirebaseAuth,
  useProductMediaUpload,
  useProductMediaDelete,
} from "@/app/hooks/firebase";
import { cleanupUnusedCategoriesForShop } from "../lib/utils";

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

type MediaPreview = {
  url: string;
  type: 'image' | 'video';
};

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

function TopNavigation({ 
  page, 
  isUpdateProduct, 
}: { 
    page: Page, 
    isUpdateProduct: boolean, 
  }) {
  const name =
    isUpdateProduct ? "Update Product" : "New Product";
  const cancelLink = isUpdateProduct ? "/inventory" : "/";
  const router = useRouter();
  
  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(cancelLink); 
  };

  return page !== Page.SUCCESS ? (
    <div className="flex flex-row items-center justify-between">
      <Button
        className="basis-1/3 justify-start text-lg font-bold text-[#703600]/50"
        variant="addProductSecondary"
        onClick={handleCancel}
      >
        Cancel
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
  page,
  onPost,
  isUpdateProduct,
  mediaPreviews,
  name,
  description,
  price,
  shipping,
  addMoreMedia,
  isEditMode,
}: {
  previousPage: Page | null;
  nextPage: Page | null;
  setPage: Dispatch<SetStateAction<Page>>;
  onPost: (isUpdate: boolean) => void;
  isUpdateProduct: boolean;
  mediaPreviews: MediaPreview[];
  page: Page;
  name: string;
  description: string;
  price: number | null;
  shipping: number | null;
  addMoreMedia: (e: React.MouseEvent) => void;
  isEditMode: boolean;
}) {
  const router = useRouter();
  return (
  <div className="fixed bottom-5 left-1/2 w-full max-w-md -translate-x-1/2 px-2 flex justify-between items-center">
    {/* Plus Button on Bottom Left */}
    <div>
    {mediaPreviews.length > 0 && mediaPreviews.length < 5 && nextPage === Page.DESCRIPTION && !isEditMode ? (
    <div
      onClick={addMoreMedia}
      className="size-12 rounded-full hover:bg-white hover:scale-105 transition-all duration-150 cursor-pointer flex items-center justify-center"
    >
      <ImagePlus className="size-8 text-black" />
    </div>
  ) : (
    <div className="size-12 invisible" />
  )}
    </div>
    {/* Back / Next / Post / Update Buttons on Bottom Right */}
    <div className="flex space-x-2">
      {!previousPage ? (
        <Button
          className="invisible text-lg text-black/50"
          variant="addProductSecondary"
        >
          <ArrowLeft className="mr-1 size-4 text-black/50" /> Back
        </Button>
      ) : previousPage !== Page.PRICE ? (
        <Button
          className="text-lg text-black/50"
          variant="addProductSecondary"
          onClick={function () {
            setPage(previousPage);
          }}
        >
          <ArrowLeft className="mr-1 size-4 text-black/50" /> Back
        </Button>
      ) : null}
      {nextPage && nextPage !== Page.SUCCESS ? (
        <div className="relative group">
          {/* Tooltip */}
          {mediaPreviews.length === 0 && (
            <div className="absolute -top-8 right-0 w-max text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Please add at least one image or video!
            </div>
          )}
          <Button
            className={"bg-white text-lg font-bold"}
            variant="addProduct"
            onClick={function () {
              setPage(nextPage);
            }}
            disabled={(page === Page.MEDIA && mediaPreviews.length === 0) || (page === Page.MEDIA && isEditMode) || (page === Page.DESCRIPTION && (name === "" || description === ""))}
          >
            Next <ArrowRight className="ml-1 size-4" />
          </Button>
        </div>
      ) : nextPage && !isUpdateProduct ? (
        <Button
          className="bg-white text-lg font-bold"
          variant="addProduct"
          onClick={function () {
            setPage(nextPage);
            onPost(isUpdateProduct);
            console.log("post!");
          }}
          disabled={page === Page.PRICE && (price === null)}
        >
          Post <ArrowRight className="ml-1 size-4" />
        </Button>
      ) : nextPage ? (
        <Button
          className="bg-white text-lg font-bold"
          variant="addProduct"
          onClick={function () {
            onPost(isUpdateProduct);
            console.log("update!");
            router.push("/inventory");
          }}
          disabled={page === Page.PRICE && (price === null || shipping === null)}
        >
          Update <ArrowRight className="ml-1 size-4" />
        </Button>
      ) : null}
    </div>
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
  isUpdateProduct,
  updateProductId,
  mediaFiles,
  setMediaFiles,
  mediaPreviews,
  setMediaPreviews,
  fileInputRef,
  isEditMode,
  setIsEditMode,
}: {
  isUpdateProduct: boolean;
  updateProductId: string;
  mediaFiles: File[];
  setMediaFiles: React.Dispatch<React.SetStateAction<File[]>>;
  mediaPreviews: MediaPreview[];
  setMediaPreviews: React.Dispatch<React.SetStateAction<MediaPreview[]>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollSyncEnabled, setScrollSyncEnabled] = useState(true);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
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
    if (mediaPreviews.length > imageEdits.length) {
      setImageEdits((prev) => [
        ...prev,
        ...Array(mediaPreviews.length - prev.length).fill({ scale: 1, x: 0, y: 0 }),
      ]);
    }
  }, [mediaPreviews, imageEdits.length]);

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

  useEffect(() => {
    if (activeIndex >= mediaPreviews.length) {
      setActiveIndex(Math.max(0, mediaPreviews.length - 1));
    }
  }, [mediaPreviews]);

  const handleClick = () => {
    if (mediaPreviews.length === 0) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX_FILE_SIZE_MB = 50;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const tooLargeFiles = fileArray.filter(file => file.size > MAX_FILE_SIZE_BYTES);
    const validFiles = fileArray.filter(file => file.size <= MAX_FILE_SIZE_BYTES);

    if (tooLargeFiles.length > 0) {
      alert(`Some files are too large and will not be added (limit: ${MAX_FILE_SIZE_MB}MB).
        Skipped files: ${tooLargeFiles.map(f => f.name).join(", ")}`);
      console.warn("Skipped files:", tooLargeFiles.map(f => f.name));
    }

    const previewItems = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.split('/')[0],
    } as MediaPreview));
    console.log("Preview items:", previewItems);
    // Use updater form to ensure correct previous state reference
    setMediaFiles((prev) => {
      const updated = [...prev, ...validFiles];
      return updated;
    });

    setMediaPreviews((prev) => {
      const updated = [...prev, ...previewItems];
      return updated;
    });

    setActiveIndex(() => mediaPreviews.length);
  };

  const handleRemoveMedia = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setScrollSyncEnabled(false);
    setTimeout(() => setScrollSyncEnabled(true), 300);
  
    const newMediaPreviews = [...mediaPreviews];
    newMediaPreviews.splice(index, 1);
    const newMediaFiles = [...mediaFiles];
    newMediaFiles.splice(index, 1);
    const newImageEdits = [...imageEdits];
    newImageEdits.splice(index, 1);
  
    const newLength = newMediaPreviews.length;
    const isLastImage = index === mediaPreviews.length - 1;
    const newIndex = isLastImage ? Math.max(0, newLength - 1) : Math.min(index, newLength - 1);
  
    setMediaPreviews(newMediaPreviews);
    setMediaFiles(newMediaFiles);
    setImageEdits(newImageEdits);
  
    // Wait until after layout updates
    requestAnimationFrame(() => {
      setActiveIndex(newIndex);
    });
  
    console.log("Removed media at index:", index);
  };

  // const handleEditMedia = (index: number, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setActiveIndex(index);
  //   setIsEditMode(true);
  //   console.log("Edit mode activated for image", index);
  // };

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

  function getMediaTypeFromUrl(url: string): 'image' | 'video' {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    const videoExtensions = ['mp4', 'mov', 'avi', 'webm'];
    return videoExtensions.includes(extension) ? 'video' : 'image';
  }

  // Handle scroll snap and update active index
  useEffect(() => {
    if (!scrollSyncEnabled) return;
    const handleScroll = () => {
      if (!scrollContainerRef.current || containerWidth === 0) return;

      const scrollLeft = scrollContainerRef.current.scrollLeft;
      // Calculate the item width based on the container width and the preview size
      const itemWidth = containerWidth * 0.85 + 16; // 85% of container width + margin
      const newIndex = Math.round(scrollLeft / itemWidth);

      if (newIndex !== activeIndex && newIndex < mediaPreviews.length) {
        setActiveIndex(newIndex);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [scrollSyncEnabled, activeIndex, mediaPreviews.length, containerWidth]);

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

  useEffect(() => {
    if (isUpdateProduct) {
      // fetch existing media
      const fetchProductDetails = async () => {
        const productRef = doc(db, "products", updateProductId);
        const productDoc = await getDoc(productRef);
        if (productDoc.exists()) {
          const productData = productDoc.data();
          setMediaPreviews(
            (productData.mediaUrls || []).map((url: string) => ({
              url,
              type: getMediaTypeFromUrl(url), // a helper function
            }))
          );
          setMediaFiles(productData.mediaUrls || []);
          console.log("productData", productData);
        }
      };
      fetchProductDetails();
    }
  }, [isUpdateProduct, updateProductId]);

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

  const toggleMute = () => {
    setMuted(!muted);
    if (videoRef.current) {
      videoRef.current.muted = !muted;
    }
  };

  return (
    <div className="flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        multiple
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
          {mediaPreviews.length > 0 ? (
            <>
              {mediaPreviews.map((preview, index) => {
                const url = preview.url;
                console.log("Preview URL:", url);
                console.log("Preview type:", preview.type);
                console.log("Rendering media item", index, "with URL:", url);
                const isVideo = preview.type === 'video';
                const isImage = preview.type === 'image';

                

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
                    className="relative shrink-0 snap-center"
                    style={{
                      width: "85%", // Make image width smaller to show preview of next image
                      height: "500px",
                      marginLeft: index === 0 ? "7.5%" : "2%",
                      marginRight: index === mediaPreviews.length - 1 ? "0%" : "2%",
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
                            ref={index === activeIndex ? videoRef : null}
                            src={url || "/placeholder.svg"}
                            autoPlay
                            loop
                            muted={muted}
                            playsInline
                            className="inline-block size-full rounded-lg object-cover"
                          />
                          <button
                            onClick={toggleMute}
                            className="absolute right-2 bottom-2 rounded-full bg-neutral-700/40 p-2 text-white shadow-md"
                          >
                            {muted ? (
                              <MdVolumeOff className="text-2xl" />
                            ) : (
                              <MdVolumeUp className="text-2xl" />
                            )}
                          </button>
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
                          className="hidden absolute right-2 top-2 size-8 rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50"
                          onClick={() => {}}
                          // onClick={(e) => handleEditMedia(index, e)}
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
              <div
                className="shrink-0"
                style={{
                  width: "7.5%", // space for last image to center
                }}
              />
            </>
          ) : (
            <div
              className="flex shrink-0 snap-center"
              style={{ width: "85%", height: "500px", marginLeft: "7.5%", marginRight: "7.5%" }}
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
        {mediaPreviews.length > 1 && !isEditMode && (
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {mediaPreviews.map((_, index) => (
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
        {isEditMode && mediaPreviews.length > 0 && (
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
  // defaultTags: Tag[];
  // setDefaultTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  ogTags: Tag[];
  isUpdateProduct: boolean;
  updateProductId: string;
  setIsTagDeleted: React.Dispatch<React.SetStateAction<boolean>>;
}

function ProductDescription({
  name,
  setName,
  description,
  setDescription,
  selectedTags,
  setSelectedTags,
  // defaultTags,
  // setDefaultTags,
  ogTags,
  isUpdateProduct,
  updateProductId,
  setIsTagDeleted
}: ProductDescriptionProps) {
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  // const [isAddingTag, setIsAddingTag] = useState(false);

  const tagWrapperRef = useRef<HTMLDivElement>(null);
  
  const filteredSuggestions = ogTags.filter((tag) => {
    const raw = newTagName.replace("#", "").toLowerCase();
    const isAlreadySelected = selectedTags.some(
      (t) => t.name.toLowerCase() === tag.name.toLowerCase()
    );
    return tag.name.toLowerCase().startsWith(raw) && !isAlreadySelected;
  });

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

  useEffect(() => {
    if (isUpdateProduct) {
      // fetch existing name, description, and tags from the database
      const fetchProductDetails = async () => {
        const productRef = doc(db, "products", updateProductId);
        const productDoc = await getDoc(productRef);
        if (productDoc.exists()) {
          const productData = productDoc.data();
          setName(productData.name);
          setDescription(productData.description);
          console.log("productData", productData);
          const tagsFromDb = (productData.tags as string[]).map((tagName) => {
            return (
              ogTags.find(
                (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
              ) || {
                id: Date.now().toString() + Math.random(),
                name: tagName,
                color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 90%)`,
              }
            );
          });
          
          setSelectedTags(tagsFromDb);
        }
      };
      fetchProductDetails();
    }
  }, [isUpdateProduct, updateProductId]);

  // const toggleTag = (tag: Tag) => {
  //   setSelectedTags((prev) =>
  //     prev.some((t) => t.id === tag.id)
  //       ? prev.filter((t) => t.id !== tag.id)
  //       : [...prev, tag],
  //   );
  // };

  return (
    <div className="flex grow flex-col items-start justify-start">
      {/* Wrapper for 'Item Name' and 'Tags' */}
      <div className="mt-0 w-full max-w-[calc(100%-2rem)]">
        <Input
          placeholder="Item Name"
          className="w-full border-0 bg-transparent px-0 py-2 mb-2 text-xl font-bold text-black/75 placeholder:text-black/50 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
        />

        {/* Inline Tag Input */}
        <div className="relative">
          <Input
            placeholder="#tags (type with '#' and hit space)"
            className="w-full border-0 bg-transparent px-0 py-1 text-black/75 placeholder:text-black/50 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            maxLength={25}
            onKeyDown={(e) => {
              if (["Enter", "Tab", " "].includes(e.key)) {
                e.preventDefault();
                const raw = newTagName.trim().replace(/^#/, "");
                if (!raw) return;

                const existing = ogTags.find(
                  (tag) => tag.name.toLowerCase() === raw.toLowerCase(),
                );
                const tag = existing || {
                  id: Date.now().toString(),
                  name: raw,
                  color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 90%)`,
                };

                setSelectedTags((prev) => {
                  if (prev.some((t) => t.name.toLowerCase() === tag.name.toLowerCase())) return prev;
                  return [...prev, tag];
                });
                // if (!existing) setDefaultTags((prev) => [...prev, tag]);
                setNewTagName("");
              } else if (e.key === "Backspace" && newTagName === "") {
                setSelectedTags((prev) => prev.slice(0, -1));
                setIsTagDeleted(true);
              }
            }}
          />

          {/* Suggestions dropdown */}
          {newTagName.startsWith("#") && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 z-10 mt-1 w-full rounded-md border bg-white shadow">
              {filteredSuggestions.map((tag) => (
                <div
                  key={tag.id}
                  className="cursor-pointer px-3 py-1 hover:bg-gray-100"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSelectedTags((prev) => {
                      if (prev.some((t) => t.name.toLowerCase() === tag.name.toLowerCase())) return prev;
                      return [...prev, tag];
                    });
                    setNewTagName("");
                  }}
                >
                  #{tag.name}
                </div>
              ))}
            </div>
          )}
          {/* Render tags */}
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag.id}
                className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-black"
                style={{ backgroundColor: tag.color }}
              >
                #{tag.name}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTags((prev) => prev.filter((t) => t.id !== tag.id));
                    setIsTagDeleted(true);
                  }}
                  className="ml-1 text-gray-500 hover:text-black"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Textarea for description */}
      <Textarea
        placeholder={"Write a short description of your product..."}
        className="resize-none grow border-0 mb-20 bg-transparent px-0 text-black/75 placeholder:text-black/50 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={300}
      />

      {/* AI suggestion button */}
      {/* <Button className="mb-2 h-6 text-sm" variant="addProduct">
        Write with AI <Wand />
      </Button> */}
    </div>
  );
}

interface PriceAndShippingProps {
  setPrice: (price: number | null) => void;
  setShipping: (shipping: number | null) => void;
  inventory: number;
  setInventory: (inventory: number) => void;
  isUpdateProduct: boolean;
  updateProductId: string;
}

function PriceAndShipping({
  setPrice,
  setShipping,
  inventory,
  setInventory,
  isUpdateProduct,
  updateProductId,
}: PriceAndShippingProps) {
  const [shippingInput, setShippingInput] = useState<MoneyInputValues | null>(null);
  const [priceInput, setPriceInput] = useState<MoneyInputValues | null>(null);

  useEffect(() => {
    if (priceInput?.float !== undefined && priceInput.float !== null) {
      setPrice(priceInput.float);
    }
    else {
      setPrice(null);
    }
  }, [priceInput?.float, setPrice]);

  useEffect(() => {
    if (shippingInput?.float !== undefined && shippingInput.float !== null) {
      setShipping(shippingInput.float);
    }
    else {
      setShipping(null);
    }
  }, [shippingInput?.float, setShipping]);

  useEffect(() => {
    if (isUpdateProduct) {
      const fetchProductDetails = async () => {
        const productRef = doc(db, "products", updateProductId);
        const productDoc = await getDoc(productRef);
        if (productDoc.exists()) {
          const productData = productDoc.data();
          setPriceInput({
            float: productData.price,
            formatted: productData.price.toLocaleString(),
            value: productData.price.toString(),
          });
          setPrice(productData.price);
          setShippingInput({
            float: productData.shipping,
            formatted: productData.shipping.toLocaleString(),
            value: productData.shipping.toString(),
          });
          setShipping(productData.shipping);
          setInventory(productData.inventory);
        }
      };
      fetchProductDetails();
    }
  }, [isUpdateProduct, updateProductId]);

  return (
    <div className="mt-32 flex grow flex-col items-center justify-start">
      <div className="w-full max-w-[600px] overflow-hidden">
      <MoneyInput
        className="text-8xl"
        values={priceInput}
        onValuesChange={setPriceInput}
      />
      </div>
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
            values={shippingInput}
            onValuesChange={setShippingInput}
          />
        </div>
      </div>
    </div>
  );
}

function SuccessPage({ productType = "", productUrl = "", name = "" }) {
  return (
    <div className="mx-auto flex h-screen w-full min-w-[50px] max-w-md flex-col overflow-hidden">
      <div className="flex flex-col items-center justify-between h-full px-4 text-center">
        <div className="mb-8 mt-12 space-y-2">
          <h1 className="text-xl font-bold text-white">
            You&apos;re on the market!
          </h1>
          <p className="text-2xl font-bold text-white">{name}</p>
          <p className="text-xl font-semibold text-white">
            is up on your store.
          </p>
        </div>

        <div className="relative h-[60vh] w-full mb-6">
          {productType === "video" ? (
            <video
              src={productUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-contain rounded-lg"
            />
          ) : (
            <Image
              src={productUrl}
              alt="Product showcase"
              fill
              className="object-contain rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>

        <div className="mb-6">
          <Button
            asChild
            variant="onboarding"
            className="rounded-full bg-white px-8 py-2 text-lg font-semibold text-black shadow-md"
          >
            <Link href="/">View Shop</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddProductContent() {
  const searchParams = useSearchParams();
  const initialPage = /* Number(searchParams.get("page")) || */ Page.MEDIA;

  const [page, setPage] = useState(initialPage);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [shipping, setShipping] = useState<number | null>(null);
  const [inventory, setInventory] = useState<number>(1);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const { user } = useFirebaseAuth();
  const mediaUpload = useProductMediaUpload();
  const { mutate: deleteMedia } = useProductMediaDelete();
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);

  const [isUpdateProduct, setIsUpdateProduct] = useState(false);
  const [updateProductId, setUpdateProductId] = useState<string>("");
  const [isTagDeleted, setIsTagDeleted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const addMoreMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
    console.log("Add more media");
  };

  // Handle browser back button, page reloads, and page leaves - mobile does not support this
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Standard message is often ignored by modern browsers, but this triggers the prompt
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
  
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Prevent pull-to-refresh on mobile devices
  useEffect(() => {
    let maybePreventPullToRefresh = false;
    let lastTouchY = 0;
  
    const touchstartHandler = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      lastTouchY = e.touches[0].clientY;
      maybePreventPullToRefresh = window.pageYOffset === 0;
    };
  
    const touchmoveHandler = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const touchYDelta = touchY - lastTouchY;
      lastTouchY = touchY;
  
      if (maybePreventPullToRefresh) {
        maybePreventPullToRefresh = false;
        if (touchYDelta > 0) e.preventDefault();
      }
    };
  
    document.addEventListener('touchstart', touchstartHandler, { passive: false });
    document.addEventListener('touchmove', touchmoveHandler, { passive: false });
  
    return () => {
      document.removeEventListener('touchstart', touchstartHandler);
      document.removeEventListener('touchmove', touchmoveHandler);
    };
  }, []);

  useEffect(() => {
    if (searchParams.get("step") === "Update") {
      setIsUpdateProduct(true);
    }
    const productId = searchParams.get("productId");
    if (productId) {
      setUpdateProductId(productId);
    }
  }, [searchParams]);

  // const [defaultTags, setDefaultTags] = useState<Tag[]>([]); // For what ui displays
  const [ogTags, setOgTags] = useState<Tag[]>([]); // For backend updates

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/onboarding");
      }
    });
    return () => {
      unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const fetchTagsFromShop = async () => {
      const user = auth.currentUser;
      if (!user) return;
      setIsLoading(false);
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

        // setDefaultTags(generatedTags);
        console.log("generatedTags", generatedTags);
        setOgTags(generatedTags);
        console.log("got OG:", ogTags);
      }
    };

    fetchTagsFromShop();
  }, [user]);

  function isString(value: unknown): value is string {
    return typeof value === "string";
  }

  const handlePost = async (isUpdate: boolean) => {
    try {
      if (!auth.currentUser) {
        console.error("No authenticated user found!");
        return;
      }

      const uploadedUrls: string[] = [];
      for (const file of mediaFiles) {
        if (isString(file) && file.startsWith("https://")) {
          // Already uploaded, keep it
          uploadedUrls.push(file);
          console.log("Already uploaded URL:", file);
        } else {
          const url = await handleFileUpload(file);
          if (url) uploadedUrls.push(url);
          console.log("Uploaded URL:", url);
        }
      }

      const shopsRef = collection(db, "shops");
      const q = query(
        shopsRef,
        where("creatorId", "==", auth.currentUser.uid),
      );
      const snapshot = await getDocs(q);

      if (isUpdate) {
        // Update existing product
        // console.log("tags", selectedTags.map((tag) => tag.name));
        console.log("ogTags", ogTags.map((tag) => tag.name));
        const productRef = doc(db, "products", updateProductId);
        const productSnap = await getDoc(productRef);
        const existingMediaUrls = productSnap.data()?.mediaUrls || [];
        console.log("existingMediaUrls", existingMediaUrls);
        const urlsToDelete = existingMediaUrls.filter(
          (url: string) => !uploadedUrls.includes(url)
        );
        console.log("urlsToDelete", urlsToDelete);
        for (const url of urlsToDelete) {
          deleteMedia(url, {
            onSuccess: () => {
              console.log("Deleted from Firebase:", url);
            },
            onError: (error) => {
              console.error("Error deleting from Firebase:", error);
            },
          });
        }
        await updateDoc(productRef, {
          name,
          description,
          price,
          shipping,
          inventory,
          tags: selectedTags.map((tag) => tag.name),
          mediaUrls: uploadedUrls,
          updatedAt: new Date(),
        });
        console.log("Product updated successfully");
        if (isTagDeleted) {
          console.log("Deleting unused tags");
          cleanupUnusedCategoriesForShop(auth.currentUser.uid || "");
        }
      }
      else {
        const productRef = collection(db, "products");
        await addDoc(productRef, {
          name,
          description,
          price,
          shipping,
          tags: selectedTags.map((tag) => tag.name),
          inventory,
          mediaUrls: uploadedUrls,
          isListed: true,
          createdBy: auth.currentUser.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        // send notification
        // TODO: chunk, check /search
        // TODO: images look bad
        if(snapshot.empty) return;
        const shopData = snapshot.docs[0].data();
        const followerIds = shopData.followers ? Object.keys(shopData.followers) : [];
        for (let followerId of followerIds) {
          followerId = followerId.split("|")[0];
          console.log("Sending follow notif to", followerId);
          try {
            const notifsRef = collection(db, "notifications");
            await addDoc(notifsRef, {
              toUser: followerId,
              fromUser: auth.currentUser?.uid,
              type: "post",
              content: name,
              target: "",
              timestamp: new Date().toISOString(),
              thumbnail: uploadedUrls[0] || "",
            });
            console.log("Notif sent successfully");
          } catch (error) {
            console.error("Failed to send follow notif:", error);
          }
        }
      }
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

      // Clear product cache
      const CACHE_KEY = `cachedProducts-${auth.currentUser.uid}`;
      sessionStorage.removeItem(CACHE_KEY);
      console.log(`Cleared cache key: ${CACHE_KEY}`);

      console.log("Product created successfully");
      setPage(Page.SUCCESS);
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleFileUpload = async (file: File): Promise<string | undefined> => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    try {
      const downloadURL = await mediaUpload.mutateAsync({
        file: file,
        userId: user.uid,
      });

      console.log("File available at", downloadURL);
      console.log("File type:", file.type);

      return downloadURL;
    } catch (error) {
      console.error("Error uploading file:", error);

      if (error instanceof Error) {
        console.log("Error name:", error.name);
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
      }

      alert("Upload failed. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  let content: JSX.Element;
  let nextPage: Page | null = null;
  let previousPage: Page | null = null;
  let backgroundImage: string | null = null;
  if (page == Page.MEDIA) {
    nextPage = Page.DESCRIPTION;
    content = (
      <MediaPicker
        isUpdateProduct={isUpdateProduct}
        updateProductId={updateProductId}
        mediaFiles={mediaFiles}
        setMediaFiles={setMediaFiles}
        mediaPreviews={mediaPreviews}
        setMediaPreviews={setMediaPreviews}
        fileInputRef={fileInputRef}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
      />
    );
  } else if (page == Page.DESCRIPTION) {
    previousPage = Page.MEDIA;
    nextPage = Page.PRICE;
    backgroundImage = mediaPreviews[0].url && mediaPreviews[0].type === 'image' ? `url(${mediaPreviews[0].url})` : ``;
    content = (
      <ProductDescription
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        // defaultTags={defaultTags}
        // setDefaultTags={setDefaultTags}
        ogTags={ogTags}
        isUpdateProduct={isUpdateProduct}
        updateProductId={updateProductId}
        setIsTagDeleted={setIsTagDeleted}
      />
    );
  } else if (page == Page.PRICE) {
    previousPage = Page.DESCRIPTION;
    nextPage = Page.SUCCESS;
    backgroundImage = mediaPreviews[0].url && mediaPreviews[0].type === 'image' ? `url(${mediaPreviews[0].url})` : ``;
    content = (
      <PriceAndShipping
        setPrice={setPrice}
        setShipping={setShipping}
        inventory={inventory}
        setInventory={setInventory}
        isUpdateProduct={isUpdateProduct}
        updateProductId={updateProductId}
      />
    );
  } else if (page == Page.SUCCESS) {
    previousPage = Page.PRICE;
    content = (
      <SuccessPage
        productType={mediaPreviews[0].type}
        productUrl={mediaPreviews[0].url || ""}
        name={name}
      />
    );
  } else {
    throw Error("Unknown page");
  }

  return (
    <Container backgroundImage={backgroundImage} nextPage={nextPage}>
      <TopNavigation 
        page={page} 
        isUpdateProduct={isUpdateProduct}
      />
      <PageIndicator page={page} />
      {content}
      <BottomNavigation
        previousPage={previousPage}
        nextPage={nextPage}
        setPage={setPage}
        page={page}
        onPost={handlePost}
        isUpdateProduct={isUpdateProduct}
        mediaPreviews={mediaPreviews}
        name={name}
        description={description}
        price={price}
        shipping={shipping}
        addMoreMedia={addMoreMedia}
        isEditMode={isEditMode}
      />
    </Container>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    }>
      <AddProductContent />
    </Suspense>
  );
}
