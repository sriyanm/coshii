"use client";

import InventoryInput from "@/app/components/inventory-input";
import MoneyInput, { MoneyInputValues } from "@/app/components/money-input";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowLeft, ArrowRight, ImagePlus, Wand, Plus } from "lucide-react";
import Link from "next/link";
import { Dispatch, JSX, ReactNode, SetStateAction, useState } from "react";
import { Input } from "../components/ui/input";
import { useSearchParams } from "next/navigation";
import { Facebook, Share2 } from "lucide-react";
import Image from "next/image";

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

const defaultTags: Tag[] = [
  { id: "1", name: "Ceramic Pieces", color: "rgb(220, 252, 231)" },
  { id: "2", name: "Cups", color: "rgb(254, 215, 170)" },
  { id: "3", name: "Plates", color: "rgb(233, 213, 255)" },
];

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
  return page !== Page.SUCCESS ? (
    <div className="flex flex-row items-center justify-between">
      <Button
        className="basis-1/3 justify-start text-lg font-bold text-[#703600]/50"
        variant="addProductSecondary"
        asChild
      >
        <Link href="/">Cancel</Link>
      </Button>
      <h1 className="text-center text-lg font-bold text-black">New Product</h1>
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

function MediaPicker() {
  return (
    <div className="mx-auto mb-auto mt-5 flex h-[500px] w-80 flex-col items-center justify-center rounded-lg bg-black/20 px-8 text-white/90 hover:bg-black/30">
      <ImagePlus className="size-10" />
      <p className="text-wrap text-center text-xl">
        Add up to 60 seconds of video or photo
      </p>
    </div>
  );
}

function ProductDescription() {
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

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
      <div className="mt-0 flex w-full max-w-[calc(100%-2rem)] items-center gap-4">
        {/* 'Item Name' input field */}
        <Input
          placeholder="Item Name"
          className="border-0 bg-transparent px-0 text-xl font-bold text-black/75 placeholder:text-black/50 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
        />

        {/* 'Tags' button, only show when the dropdown is closed */}
        {!isTagsOpen && (
          <Button
            variant="outline"
            className="ml-auto block bg-white/90 hover:bg-white/95"
            onClick={() => setIsTagsOpen(true)}
          >
            Tags
          </Button>
        )}

        {/* Dropdown for tags selection, show when the button is clicked */}
        {isTagsOpen && (
          <div className="right-0 mt-2 w-full rounded-md shadow-lg">
            <div className="p-4">
              <div className="flex flex-nowrap gap-2 overflow-x-auto">
                {" "}
                {/* Prevent wrap and allow scrolling */}
                {defaultTags.map((tag) => {
                  const isSelected = selectedTags.some((t) => t.id === tag.id);
                  return (
                    <Button
                      key={tag.id}
                      variant="outline"
                      className="rounded-full px-2 py-1 transition-all duration-200" // No extra padding
                      style={{
                        backgroundColor: tag.color,
                        boxShadow: isSelected
                          ? "0 4px 12px rgba(0,0,0,0.15)"
                          : "none",
                        filter: isSelected ? "saturate(1.2)" : "saturate(1)",
                        border: "none", // Remove border
                      }}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag.name}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    console.log("Add new tag");
                  }}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Display selected tags
      {selectedTags.length > 0 && (
        <div className="left-4 right-4 top-16 flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <div
              key={tag.id}
              className="rounded-full px-4 py-1 text-sm"
              style={{
                backgroundColor: tag.color,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                filter: "saturate(1.2)",
              }}
            >
              {tag.name}
            </div>
          ))}
        </div>
      )} */}
      </div>

      {/* Textarea for description */}
      <Textarea
        placeholder="Write a short description or have Coshii AI write one based on the photos you've uploaded..."
        className="grow border-0 bg-transparent px-0 text-black/75 placeholder:text-black/50 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
      />

      {/* AI suggestion button */}
      <Button className="mb-2 h-6 text-sm" variant="addProduct">
        Write with AI <Wand />
      </Button>
    </div>
  );
}

function PriceAndShipping() {
  const [price, setPrice] = useState<MoneyInputValues | null>(null);
  const [shipping, setShipping] = useState<MoneyInputValues | null>(null);
  const [inventory, setInventory] = useState(1);

  return (
    <div className="mt-32 flex grow flex-col items-center justify-start">
      <MoneyInput
        className="text-8xl"
        values={price}
        onValuesChange={setPrice}
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
            <Link href="/shop">View Shop</Link>
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

export default function AddProductPage() {
  const searchParams = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || Page.MEDIA;

  const [page, setPage] = useState(initialPage);

  let content: JSX.Element;
  let nextPage: Page | null = null;
  let previousPage: Page | null = null;
  let backgroundImage: string | null = null;
  if (page == Page.MEDIA) {
    nextPage = Page.DESCRIPTION;
    content = <MediaPicker />;
  } else if (page == Page.DESCRIPTION) {
    previousPage = Page.MEDIA;
    nextPage = Page.PRICE;
    backgroundImage = `url(/ajay-product.png)`;
    content = <ProductDescription />;
  } else if (page == Page.PRICE) {
    previousPage = Page.DESCRIPTION;
    nextPage = Page.SUCCESS;
    backgroundImage = `url(/ajay-product.png)`;
    content = <PriceAndShipping />;
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
        onPost={function () {
          console.log("posted!");
        }}
      />
    </Container>
  );
}
