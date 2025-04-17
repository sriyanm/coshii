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

type View = "search" | "profile";

// Update the UserSearchResult type to include id and all needed fields
type UserSearchResult = {
  id: string;
  email: string;
  shopName: string | null;
  // You can add other fields as needed
};

export default function SearchPage() {
  const [currentView, setCurrentView] = useState<View>("search");
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab] = useState("Search");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Add this effect to handle debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300); // Wait 300ms after user stops typing before searching

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Update to handle clicking on a search result
  const handleUserClick = (user: UserSearchResult) => {
    setSelectedUser(user);
    setCurrentView("profile");
  };

  const handleBack = () => {
    setCurrentView("search");
    setSelectedUser(null);
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const usersRef = collection(db, "users");

      // Use the search term as is, without converting to lowercase
      const searchTerm = searchQuery;

      console.log("Searching for:", searchTerm);

      // Try a more permissive query first
      const q = query(usersRef);

      const querySnapshot = await getDocs(q);
      console.log("Total docs found:", querySnapshot.size);

      const users: UserSearchResult[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Document data:", data);

        // Check if shopName exists and contains search term (case insensitive)
        if (data.shopName) {
          users.push({
            id: doc.id,
            email: data.email || "",
            shopName: data.shopName || "",
          });
        }
      });

      const fuse = new Fuse(users, {
        keys: ["shopName", "email"],
        threshold: 0.3, // Adjust for strictness
      });

      const results = fuse.search(searchQuery).map((result) => result.item);

      console.log("Filtered results:", results.length);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
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

      {isSearching ? (
        <div className="flex justify-center p-4">
          <div className="size-8 animate-spin rounded-full border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="divide-y">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="cursor-pointer p-4 hover:bg-gray-50"
              onClick={() => handleUserClick(user)}
            >
              <div className="font-medium">
                {user.shopName || "No shop name"}
              </div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          ))}
          {searchResults.length === 0 && searchQuery && (
            <div className="p-4 text-center text-gray-500">
              No users found matching your search
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderProfileView = () => {
    if (!selectedUser) return null;

    return (
      <div className="space-y-6">
        <button
          onClick={handleBack}
          className="mb-4 flex items-center text-sm font-medium text-gray-600"
        >
          ← Back to search
        </button>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 text-xl font-bold">
            {selectedUser.shopName || "Shop"}
          </h2>
          <p className="text-gray-600">{selectedUser.email}</p>
          {/* Add more user details here as needed */}
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
