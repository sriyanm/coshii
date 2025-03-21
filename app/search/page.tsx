"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Store, SearchIcon, PlusSquare, Shirt, Settings } from "lucide-react";
// import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

// Types
interface Shop {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isFollowing?: boolean;
  isFollower?: boolean;
}

// display all the shops based on search query real time

interface NavigationItem {
  name: string;
  icon: React.ComponentType;
  href: string;
}

// Sample data
const shops: Shop[] = [
  {
    id: "1",
    name: "Elizabeth's Shop",
    username: "@elizabee2024",
    avatar: "/placeholder.svg",
    isFollowing: true,
    isFollower: true,
  },
  {
    id: "2",
    name: "Melissa Ceramics",
    username: "@melissacormicceramics",
    avatar: "/placeholder.svg",
    isFollowing: true,
    isFollower: true,
  },
  {
    id: "3",
    name: "PopShoes",
    username: "@popshoes",
    avatar: "/placeholder.svg",
    isFollowing: true,
    isFollower: true,
  },
  {
    id: "4",
    name: "Mark's Handrolls",
    username: "@handrolls",
    avatar: "/placeholder.svg",
    isFollowing: true,
    isFollower: false,
  },
  {
    id: "5",
    name: "millibooth",
    username: "@millibooth",
    avatar: "/placeholder.svg",
    isFollowing: true,
    isFollower: false,
  },
  {
    id: "6",
    name: "sriyan",
    username: "@sriyan",
    avatar: "/placeholder.svg",
    isFollowing: false,
    isFollower: false,
  },
  {
    id: "7",
    name: "ajay",
    username: "@ajay",
    avatar: "/placeholder.svg",
    isFollowing: false,
    isFollower: false,
  },
  {
    id: "8",
    name: "srikar",
    username: "@srikar",
    avatar: "/placeholder.svg",
    isFollowing: false,
    isFollower: false,
  },
  {
    id: "9",
    name: "priyanshu",
    username: "@priyanshu",
    avatar: "/placeholder.svg",
    isFollowing: false,
    isFollower: false,
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

  // const handleBack = () => {
  //   setCurrentView("search");
  //   setSelectedShop(null);
  // };

  // const toggleFollow = (shop: Shop) => {
  //   // In a real app, this would make an API call
  //   console.log(`${shop.isFollowing ? "Unfollowed" : "Followed"} ${shop.name}`);
  // };

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
          {shops.map(
            (shop) =>
              shop.isFollowing && (
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
              ),
          )}
        </div>
        <h2 className="mb-4 text-xl font-bold">Followers</h2>
        <div className="space-y-4">
          {shops.map(
            (shop) =>
              shop.isFollower && (
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
              ),
          )}
        </div>
      </div>
    </div>
  );

  const renderProfileView = () => {
    if (!selectedShop) return null;

    return <div className="space-y-6">{selectedShop.name + " here!"}</div>;
    // TODO: window.location.href = "/" + selectedShop.username.slice(1);
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
