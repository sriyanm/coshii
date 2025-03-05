"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Store,
  SearchIcon,
  PlusSquare,
  Shirt,
  Settings,
  ChevronLeft,
  Instagram,
  Facebook,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

// Types
interface Shop {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  isFollowing?: boolean;
}

interface NavigationItem {
  name: string;
  icon: React.ComponentType;
  href: string;
}

// Sample data
const followingShops: Shop[] = [
  {
    id: "1",
    name: "Elizabeth's Shop",
    username: "@elizabee2024",
    avatar: "/placeholder.svg",
    isFollowing: true,
  },
  {
    id: "2",
    name: "Melissa Ceramics",
    username: "@melissacormicceramics",
    avatar: "/placeholder.svg",
    isFollowing: true,
  },
  {
    id: "3",
    name: "PopShoes",
    username: "@popshoes",
    avatar: "/placeholder.svg",
    isFollowing: true,
  },
  {
    id: "4",
    name: "Mark's Handrolls",
    username: "@handrolls",
    avatar: "/placeholder.svg",
    isFollowing: true,
  },
  {
    id: "5",
    name: "millibooth",
    username: "@millibooth",
    avatar: "/placeholder.svg",
    isFollowing: true,
  },
];

const navigation: NavigationItem[] = [
  { name: "Shop", icon: Store, href: "/shop" },
  { name: "Search", icon: SearchIcon, href: "/search" },
  { name: "New Product", icon: PlusSquare, href: "/add-product" },
  { name: "Backrooms", icon: Shirt, href: "/inventory" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

type View = "search" | "profile";

export default function SearchPage() {
  const [currentView, setCurrentView] = useState<View>("search");
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab] = useState("Search");

  const handleShopClick = (shop: Shop) => {
    setSelectedShop(shop);
    setCurrentView("profile");
  };

  const handleBack = () => {
    setCurrentView("search");
    setSelectedShop(null);
  };

  const toggleFollow = (shop: Shop) => {
    // In a real app, this would make an API call
    console.log(`${shop.isFollowing ? "Unfollowed" : "Followed"} ${shop.name}`);
  };

  const renderSearchView = () => (
    <div className="space-y-6">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-none bg-gray-100 pl-10"
        />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">Following</h2>
        <div className="space-y-4">
          {followingShops.map((shop) => (
            <button
              key={shop.id}
              className="flex w-full items-center gap-3 text-left"
              onClick={() => handleShopClick(shop)}
            >
              <Image
                src={shop.avatar || "/placeholder.svg"}
                alt={shop.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <h3 className="font-medium">{shop.name}</h3>
                <p className="text-sm text-gray-500">{shop.username}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfileView = () => {
    if (!selectedShop) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button onClick={handleBack} className="-ml-2 p-2">
            <ChevronLeft className="size-6" />
          </button>
        </div>

        <div className="text-center">
          <Image
            src={selectedShop.avatar || "/placeholder.svg"}
            alt={selectedShop.name}
            width={100}
            height={100}
            className="mx-auto mb-4 rounded-full"
          />
          <h1 className="mb-1 text-2xl font-bold">{selectedShop.name}</h1>
          <p className="mb-4 text-gray-500">{selectedShop.username}</p>
          <p className="mb-4">Welcome to my shop!</p>

          {selectedShop.isFollowing ? (
            <button
              onClick={() => toggleFollow(selectedShop)}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2"
            >
              <span className="sr-only">Following</span>👤
            </button>
          ) : (
            <Button
              onClick={() => toggleFollow(selectedShop)}
              className="rounded-full bg-[#FED15B] px-8 text-black hover:bg-[#FED15B]/90"
            >
              Follow
            </Button>
          )}

          <div className="mt-4 flex justify-center gap-4">
            <button className="p-2">
              <Instagram className="size-6" />
            </button>
            <button className="p-2">
              <Facebook className="size-6" />
            </button>
          </div>

          <div className="mt-4 flex justify-center gap-4 border-b">
            <button className="border-b-2 border-black px-4 py-2 font-bold">
              Shop
            </button>
            <button className="px-4 py-2 text-gray-500">Activity</button>
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto p-4">
            <button className="rounded-full bg-[#FED15B] px-4 py-1 text-sm font-medium">
              All
            </button>
            {["Reposts", "Cups", "Ashtrays", "Bowls"].map((category) => (
              <button
                key={category}
                className="whitespace-nowrap rounded-full bg-gray-100 px-4 py-1 text-sm font-medium"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        {currentView === "search" ? renderSearchView() : renderProfileView()}
      </div>

      <nav className="flex h-16 items-center justify-around border-t bg-white px-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 ${
              currentTab === item.name ? "text-black" : "text-black/50"
            }`}
          >
            <item.icon />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
