"use client";

import type React from "react";

import { useState, useEffect } from "react";
// import Image from "next/image";
import Link from "next/link";
import { Store, SearchIcon, PlusSquare, Shirt, Settings } from "lucide-react";
// import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { collection, query, getDocs, where } from "firebase/firestore";
import Fuse from "fuse.js";
import { db } from "@/app/lib/client/firebase";
import { auth } from "@/app/lib/client/firebase";
import { Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface NavigationItem {
  name: string;
  icon: React.ComponentType;
  href: string;
}

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
  profilePic?: string | null;
};

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab] = useState("Search");
  const [searchResults, setSearchResults] = useState<ShopSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingFollowStatus, setLoadingFollowStatus] = useState(true);
  const [followers, setFollowers] = useState<ShopSearchResult[]>([]);
  const [following, setFollowing] = useState<ShopSearchResult[]>([]);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [showFollowers, setShowFollowers] = useState(true);
  const [showFollowing, setShowFollowing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  // const [showMockButton, setShowMockButton] = useState(true);
  // const [showMockButton2, setShowMockButton2] = useState(true);
  // const generateMockShops = (count: number): ShopSearchResult[] => {
  //   return Array.from({ length: count }, (_, i) => ({
  //     id: `mock-id-${i}`,
  //     email: `mockuser${i}@example.com`,
  //     shopName: `Mock Shop ${i}`,
  //     username: `mockuser${i}`,
  //     creatorId: `creator-${i}`,
  //   }));
  // };

  const router = useRouter();
  useEffect(() => {
    let unsubscribed = false;

    const fetchFollowersAndFollowing = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (unsubscribed) return;

        if (!user) {
          router.replace("/onboarding");
          return;
        }
        setIsLoading(false);
        await fetchData(user.uid);
      });
    };

    const fetchData = async (currentShopId: string) => {
      setLoadingFollowStatus(true);
      const shopsRef = collection(db, "shops");

      const snapshot = await getDocs(
        query(shopsRef, where("creatorId", "==", currentShopId)),
      );

      if (snapshot.empty) {
        setLoadingFollowStatus(false);
        return;
      }

      const currDoc = snapshot.docs[0];
      const data = currDoc.data();

      const fetchChunkedShops = async (
        ids: string[],
      ): Promise<ShopSearchResult[]> => {
        const result: ShopSearchResult[] = [];
        for (let i = 0; i < ids.length; i += 10) {
          const chunk = ids.slice(i, i + 10);
          const creatorIds = chunk.map((id) => id.split("|")[0]);
          const usernames = chunk.map((id) => id.split("|")[1]);
          const chunkSnapshot = await getDocs(
            query(
              shopsRef,
              where("creatorId", "in", creatorIds),
              where("username", "in", usernames),
            ),
          );
          chunkSnapshot.forEach((doc) => {
            const shopData = doc.data();
            result.push({
              id: doc.id,
              email: shopData.email || "",
              shopName: shopData.shopName || "",
              username: shopData.username || "",
              creatorId: shopData.creatorId || "",
              profilePic: shopData.profilePic || "",
            });
          });
        }
        return result;
      };

      const followerIds = data.followers ? Object.keys(data.followers) : [];
      const followingIds = data.following ? Object.keys(data.following) : [];

      if (followerIds.length > 0) {
        const followersData = await fetchChunkedShops(followerIds);
        setFollowers(followersData);
      }

      if (followingIds.length > 0) {
        const followingData = await fetchChunkedShops(followingIds);
        setFollowing(followingData);
      }

      setLoadingFollowStatus(false);
    };

    fetchFollowersAndFollowing();

    return () => {
      unsubscribed = true;
    };
  }, [router]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      // Clear search results immediately if query is empty
      setSearchResults([]);
      setSearchTriggered(false);
      return;
    }
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchTriggered(false);
      setSearchResults([]);
      return;
    }

    setSearchTriggered(true);
    setIsSearching(true);
    try {
      const shopsRef = collection(db, "shops");

      const q = query(shopsRef);
      const querySnapshot = await getDocs(q);

      const shops: ShopSearchResult[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.username) {
          shops.push({
            id: doc.id,
            email: data.email || "",
            shopName: data.shopName || "",
            username: data.username || "",
            creatorId: data.creatorId || "",
            profilePic: data.profilePic || "",
          });
        }
      });

      const fuse = new Fuse(shops, {
        keys: ["shopName", "username", "email"],
        threshold: 0.3,
      });

      const results = fuse.search(searchQuery).map((result) => result.item);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching shops:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const renderSearchView = () => {
    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-b-2 border-gray-900" />
        </div>
      );
    }

    // if (!user) {
    //   return null;
    // }

    return (
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
          <div className="flex flex-col space-y-4 p-4">
            {/* FOLLOWERS */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Followers</h2>
                <button
                  className="text-sm text-blue-500 hover:underline"
                  onClick={() => setShowFollowers((prev) => !prev)}
                >
                  {showFollowers ? (
                    <Minus className="size-6" color="black" />
                  ) : (
                    <Plus className="size-6" color="black" />
                  )}
                </button>
              </div>

              {loadingFollowStatus ? (
                <div className="flex justify-center">
                  <div className="size-6 animate-spin rounded-full border-b-2 border-gray-900" />
                </div>
              ) : !showFollowers ? null : followers.length === 0 ? (
                <div className="px-4 text-start text-gray-500">
                  No followers found.
                </div>
              ) : (
                <div className="max-h-64 divide-y overflow-y-auto rounded-md">
                  {followers.map((shop) => (
                    <Link
                      key={shop.id}
                      href={`/${shop.username}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 cursor-pointer py-4 hover:bg-gray-50">
                        <div className="relative h-10 w-10">
                          <Image
                            src={shop.profilePic || "/default-avatar.png"}
                            alt={`${shop.shopName} profile`}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{shop.shopName}</div>
                          <div className="text-sm text-gray-500">@{shop.username}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* FOLLOWING */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Following</h2>
                <button
                  className="text-sm text-blue-500 hover:underline"
                  onClick={() => setShowFollowing((prev) => !prev)}
                >
                  {showFollowing ? (
                    <Minus className="size-6" color="black" />
                  ) : (
                    <Plus className="size-6" color="black" />
                  )}
                </button>
              </div>

              {loadingFollowStatus ? (
                <div className="flex justify-center">
                  <div className="size-6 animate-spin rounded-full border-b-2 border-gray-900" />
                </div>
              ) : !showFollowing ? null : following.length === 0 ? (
                <div className="px-4 text-start text-gray-500">
                  No following found.
                </div>
              ) : (
                <div className="max-h-64 divide-y overflow-y-auto rounded-md">
                  {following.map((shop) => (
                    <Link
                      key={shop.id}
                      href={`/${shop.username}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 cursor-pointer py-4 hover:bg-gray-50">
                        <div className="relative h-10 w-10">
                          <Image
                            src={shop.profilePic || "/default-avatar.png"}
                            alt={`${shop.shopName} profile`}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{shop.shopName}</div>
                          <div className="text-sm text-gray-500">@{shop.username}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEARCH RESULTS */}
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
                      <div className="flex items-center gap-4 cursor-pointer p-4 hover:bg-gray-50">
                        <div className="relative h-10 w-10">
                          <Image
                            src={shop.profilePic || "/default-avatar.png"}
                            alt={`${shop.shopName} profile`}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{shop.shopName}</div>
                          <div className="text-sm text-gray-500">@{shop.username}</div>
                        </div>
                      </div>
                  </Link>
                ),
            )}
            {searchResults.length === 0 && searchQuery && searchTriggered && (
              <div className="p-4 text-center text-gray-500">
                No shops found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">{renderSearchView()}</div>
      {/* {showMockButton && (
      <button
          className="p-2 bg-blue-600 text-white rounded"
          onClick={() => {
            setFollowers(generateMockShops(50));
            setShowMockButton(false);
          }}
        >
          Load Mock Followers
        </button>
      )}

      {showMockButton2 && (
        <button
          className="p-2 bg-blue-600 text-white rounded"
          onClick={() => {
            setFollowing(generateMockShops(50));
            setShowMockButton2(false);
          }}
        >
          Load Mock Following
        </button>
      )} */}
      {!isLoading && (
      <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2">
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
      )}
    </div>
  );
}
