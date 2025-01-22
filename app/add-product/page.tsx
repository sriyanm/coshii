"use client";

import InventoryInput from "@/app/components/inventory-input";
import MoneyInput, { MoneyInputValues } from "@/app/components/money-input";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowLeft, ArrowRight, ImagePlus, Wand } from "lucide-react";
import Link from "next/link";
import { Dispatch, JSX, ReactNode, SetStateAction, useState } from "react";
import { Input } from "../components/ui/input";

enum Page {
  MEDIA = 1,
  DESCRIPTION,
  PRICE,
}

function Container({
  backgroundImage,
  children,
}: {
  backgroundImage: string | null;
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
  ) : (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-amber-400 p-4">
      {children}
    </div>
  );
}

function TopNavigation() {
  return (
    <div className="flex flex-row items-center justify-between">
      <Button
        className="basis-1/3 text-lg"
        variant="addProductSecondary"
        asChild
      >
        <Link href="/">Cancel</Link>
      </Button>
      <h1 className="text-center text-lg font-bold text-black">New Product</h1>
      <div className="basis-1/3"></div>
    </div>
  );
}

function BottonNavigation({
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
  return (
    <div className="mt-2 flex flex-row items-center justify-end">
      {previousPage && (
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
      {nextPage ? (
        <Button
          className={"text-lg"}
          variant="addProduct"
          onClick={function () {
            setPage(nextPage);
          }}
        >
          Next <ArrowRight className="ml-1 size-4" />
        </Button>
      ) : (
        <Button className="text-lg" variant="addProduct" onClick={onPost}>
          Post <ArrowRight className="ml-1 size-4" />
        </Button>
      )}
    </div>
  );
}

function PageIndicator({ page }: { page: Page }) {
  return (
    <div className="mb-4 flex space-x-2">
      {[Page.MEDIA, Page.DESCRIPTION, Page.PRICE].map((item) =>
        item == page ? (
          <div key={item} className="h-1 grow bg-amber-100"></div>
        ) : (
          <div key={item} className="h-1 grow bg-black/80"></div>
        ),
      )}
    </div>
  );
}

function MediaPicker() {
  return (
    <div className="mb-auto flex h-80 flex-col items-center justify-center rounded-lg bg-black/20 px-8 text-white/90 hover:bg-black/30">
      <ImagePlus className="size-10" />
      <p className="text-center text-sm">
        Add up to 60 seconds of video or photo
      </p>
    </div>
  );
}

function ProductDescription() {
  return (
    <div className="flex grow flex-col items-start justify-start">
      <Input
        placeholder="Item Name"
        className="border-0 bg-transparent px-0 text-xl font-bold text-black/75 placeholder:text-black/50 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
      />
      <Textarea
        placeholder="Write a short description or have Coshii AI write one based on the
        photos youve uploaded..."
        className="grow border-0 bg-transparent px-0 text-black/75 placeholder:text-black/50 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
      />
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
    <div className="flex grow flex-col items-center justify-start">
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

export default function AddProductPage() {
  const [page, setPage] = useState(Page.MEDIA);

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
    backgroundImage = `url(/ajay-product.png)`;
    content = <PriceAndShipping />;
  } else {
    throw Error("Unknown page");
  }

  return (
    <Container backgroundImage={backgroundImage}>
      <TopNavigation />
      <PageIndicator page={page} />
      {content}
      <BottonNavigation
        previousPage={previousPage}
        nextPage={nextPage}
        setPage={setPage}
        onPost={function () {
          console.log("post!");
        }}
      />
    </Container>
  );
}
