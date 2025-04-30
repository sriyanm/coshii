"use client";

import type React from "react";

import { useState, useEffect } from "react";
// import Image from "next/image";
import Link from "next/link";
import { Store, SearchIcon, PlusSquare, Shirt, Settings } from "lucide-react";
// import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { collection, query, getDocs } from "firebase/firestore";
import Fuse from "fuse.js";
import { db } from "@/app/lib/client/firebase";
import { auth } from "@/app/lib/client/firebase";

// Types
// interface Shop {
//   id: string;
//   name: string;
//   username: string;
//   avatar: string;
//   isFollowing?: boolean;
//   isFollower?: boolean;
// }

// display all the shops based on search query real time

interface NavigationItem {
  name: string;
  icon: React.ComponentType;
  href: string;
}

// Sample data
// const shops: Shop[] = [
//   {
//     id: "1",
//     name: "Elizabeth's Shop",
//     username: "@elizabee2024",
//     avatar: "/placeholder.svg",
//     isFollowing: true,
//     isFollower: true,
//   },
//   {
//     id: "2",
//     name: "Melissa Ceramics",
//     username: "@melissacormicceramics",
//     avatar: "/placeholder.svg",
//     isFollowing: true,
//     isFollower: true,
//   },
//   {
//     id: "3",
//     name: "PopShoes",
//     username: "@popshoes",
//     avatar: "/placeholder.svg",
//     isFollowing: true,
//     isFollower: true,
//   },
//   {
//     id: "4",
//     name: "Mark's Handrolls",
//     username: "@handrolls",
//     avatar: "/placeholder.svg",
//     isFollowing: true,
//     isFollower: false,
//   },
//   {
//     id: "5",
//     name: "millibooth",
//     username: "@millibooth",
//     avatar: "/placeholder.svg",
//     isFollowing: true,
//     isFollower: false,
//   },
//   {
//     id: "6",
//     name: "sriyan",
//     username: "@sriyan",
//     avatar: "/placeholder.svg",
//     isFollowing: false,
//     isFollower: false,
//   },
//   {
//     id: "7",
//     name: "ajay",
//     username: "@ajay",
//     avatar: "/placeholder.svg",
//     isFollowing: false,
//     isFollower: false,
//   },
//   {
//     id: "8",
//     name: "srikar",
//     username: "@srikar",
//     avatar: "/placeholder.svg",
//     isFollowing: false,
//     isFollower: false,
//   },
//   {
//     id: "9",
//     name: "priyanshu",
//     username: "@priyanshu",
//     avatar: "/placeholder.svg",
//     isFollowing: false,
//     isFollower: false,
//   },
// ];

const navigation: NavigationItem[] = [
  { name: "Shop", icon: Store, href: "/" },
  { name: "Search", icon: SearchIcon, href: "/search" },
  { name: "New Product", icon: PlusSquare, href: "/add-product" },
  { name: "Backrooms", icon: Shirt, href: "/inventory" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

// Update the ShopSearchResult type to include id and all needed fields
type ShopSearchResult = {
  id: string;
  email: string;
  shopName: string | null;
  username: string | null;
  creatorId: string | null;
  // You can add other fields as needed
};

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab] = useState("Search");
  const [searchResults, setSearchResults] = useState<ShopSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Add this effect to handle debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300); // Wait 300ms after user stops typing before searching

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const shopsRef = collection(db, "shops");

      // Use the search term as is, without converting to lowercase
      const searchTerm = searchQuery;

      console.log("Searching for:", searchTerm);

      // Try a more permissive query first
      const q = query(shopsRef);

      const querySnapshot = await getDocs(q);
      console.log("Total docs found:", querySnapshot.size);

      const shops: ShopSearchResult[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Document data:", data);

        // Check if username exists and contains search term (case insensitive)
        if (data.username) {
          shops.push({
            id: doc.id,
            email: data.email || "",
            shopName: data.shopName || "",
            username: data.username || "",
            creatorId: data.creatorId || "",
          });
        }
      });

      const fuse = new Fuse(shops, {
        keys: ["shopName", "username", "email"],
        threshold: 0.3, // Adjust for strictness
      });

      const results = fuse.search(searchQuery).map((result) => result.item);

      console.log("Filtered results:", results.length);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching shops:", error);
    } finally {
      setIsSearching(false);
    }
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
      {!searchQuery && (
        <div className="justify-left flex flex-col items-start space-y-4 p-4 text-left">
          <h2 className="text-lg font-semibold">Followers</h2>
          {/* query and display followers */}
          <h2 className="text-lg font-semibold">Following</h2>
          {/* query and display following */}
        </div>
      )}
      {isSearching ? (
        <div className="flex justify-center p-4">
          <div className="size-8 animate-spin rounded-full border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="divide-y">
          {searchResults.map(
            (shop) =>
              shop.creatorId !== auth.currentUser?.uid && (
                <Link
                  key={shop.id}
                  href={`/${shop.username}`}
                  className="block"
                >
                  <div className="cursor-pointer p-4 hover:bg-gray-50">
                    <div className="font-medium">{shop.shopName}</div>
                    <div className="text-sm text-gray-500">{shop.email}</div>
                  </div>
                </Link>
              ),
          )}
          {searchResults.length === 0 && searchQuery && (
            <div className="p-4 text-center text-gray-500">
              No shops found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">{renderSearchView()}</div>

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
