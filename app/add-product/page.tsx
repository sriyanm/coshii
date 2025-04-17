"use client";

import { Suspense } from "react";
import InventoryInput from "@/app/components/inventory-input";
import MoneyInput, { MoneyInputValues } from "@/app/components/money-input";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowLeft, ArrowRight, ImagePlus, Wand, Plus } from "lucide-react";
import Link from "next/link";
import {
  Dispatch,
  JSX,
  ReactNode,
  SetStateAction,
  useState,
  useEffect,
  useRef,
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
import { useFirebaseAuth, useProductMediaUpload } from "@/app/hooks/firebase";

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
      className="mx-auto max-w-md bg-amber-400/75 bg-cover bg-blend-overlay"
      style={{
        backgroundImage,
      }}
    >
      <div className="flex min-h-screen flex-col p-4 backdrop-blur-md">
        {children}
      </div>
    </div>
  ) : nextPage ? (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-[#FED15B] p-4">
      {children}
    </div>
  ) : (
    <div className="mx-auto max-w-md bg-gradient-to-b from-[#FF5640] to-[#FFC640]">
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
    <div className="mt-2 flex flex-row items-center justify-end">
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
}: {
  handleFileUpload: (file: File) => Promise<string | undefined>;
  mediaUrls: string[];
  isUploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("File selected:", files[0].name);
      try {
        const result = await handleFileUpload(files[0]);
        console.log("Upload result:", result);
      } catch (error) {
        console.error("Error in handleFileChange:", error);
      }
    }
  };

  return (
    <div
      className="mx-auto mb-auto mt-5 flex h-[500px] w-80 cursor-pointer flex-col items-center justify-center rounded-lg bg-black/20 px-8 text-white/90 hover:bg-black/30"
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*"
        className="hidden"
      />
      {mediaUrls.length > 0 ? (
        <div className="relative size-full">
          {mediaUrls.map((url, index) => {
            const fileExtension = url
              .split(".")
              .pop()
              ?.toLowerCase()
              .split("?")[0];
            console.log("File extension:", fileExtension);
            console.log("File URL:", url);
            const isVideo = fileExtension === "mp4" || fileExtension === "mov";

            const isImage =
              fileExtension === "jpg" ||
              fileExtension === "jpeg" ||
              fileExtension === "png" ||
              fileExtension === "gif" ||
              fileExtension === "bmp";

            if (isVideo) {
              return (
                <div key={index} className="video-container">
                  <video
                    src={url}
                    autoPlay
                    loop
                    // muted={false}
                    playsInline
                    className="inline-block size-full rounded-lg object-cover"
                    // onClick={togglePlayPause}
                  />
                  <source src={url} type={`video/${fileExtension}`} />
                </div>
              );
            }

            if (isImage) {
              return (
                <Image
                  key={index}
                  src={url}
                  alt="Uploaded media"
                  fill
                  className="object-contain"
                />
              );
            }
            alert("File type not supported");
            console.error("Unsupported file type:", fileExtension);
            return null;
          })}
        </div>
      ) : isUploading ? (
        <>
          <div className="animate-pulse">
            <ImagePlus className="size-10" />
          </div>
          <p className="text-wrap text-center text-xl">Uploading...</p>
        </>
      ) : (
        <>
          <ImagePlus className="size-10" />
          <p className="text-wrap text-center text-xl">
            Add up to 60 seconds of video or photo
          </p>
        </>
      )}
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
      <Button className="mb-2 h-6 text-sm" variant="addProduct">
        Write with AI <Wand />
      </Button>
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

function SuccessPage() {
  return (
    <div className="mx-auto flex h-screen grow flex-col items-start justify-start">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-8 mt-12 space-y-2">
          <h1 className="text-xl font-bold text-white">
            You&apos;re on the market!
          </h1>
          <p className="text-2xl font-bold text-white">Item Name</p>
          <p className="text-xl font-semibold text-white">
            is up on your store.
          </p>
        </div>

        <div className="mx-auto mb-12 flex h-auto w-40 items-center justify-center overflow-hidden">
          <Image
            src="/ajay-product.png"
            alt="Product showcase"
            width={160}
            height={250}
            className="size-full object-cover"
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
      />
    );
  } else if (page == Page.DESCRIPTION) {
    previousPage = Page.MEDIA;
    nextPage = Page.PRICE;
    backgroundImage = `url(/ajay-product.png)`;
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
    backgroundImage = `url(/ajay-product.png)`;
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
    content = <SuccessPage />;
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
