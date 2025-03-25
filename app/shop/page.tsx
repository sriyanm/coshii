// this is the notifications page, not the actual shop page

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Store,
  Search,
  PlusSquare,
  Shirt,
  Settings,
  X,
  Heart,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import type { NavigationItem } from "../types";

const navigation: NavigationItem[] = [
  { name: "Shop", icon: Store, href: "/shop" },
  { name: "Search", icon: Search, href: "/search" },
  { name: "New Product", icon: PlusSquare, href: "/add-product" },
  { name: "Backrooms", icon: Shirt, href: "/inventory" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

type NotificationType = "like" | "comment" | "follow" | "post";

interface Notification {
  id: string;
  type: NotificationType;
  user: {
    name: string;
    avatar: string;
  };
  content?: string;
  target?: string;
  timestamp: string;
  thumbnail?: string;
}

const notifications: Notification[] = [
  {
    id: "1",
    type: "like",
    user: {
      name: "Sarah",
      avatar: "/placeholder.svg",
    },
    target: "Million Glaze Vase",
    timestamp: "14h",
  },
  {
    id: "2",
    type: "comment",
    user: {
      name: "Emma",
      avatar: "/placeholder.svg",
    },
    content: "Lovely work, babes<3",
    target: "Glass Chandelier Sculpture",
    timestamp: "2h",
  },
  {
    id: "3",
    type: "follow",
    user: {
      name: "Jessy K",
      avatar: "/placeholder.svg",
    },
    timestamp: "3d",
  },
  {
    id: "4",
    type: "post",
    user: {
      name: "Elizabeth",
      avatar: "/placeholder.svg",
    },
    content: "Set of 5 ceramic plates",
    timestamp: "2h",
    thumbnail: "/placeholder.svg",
  },
];

export default function ShopPage() {
  const [currentTab] = useState("Shop");

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "like":
        return <Heart className="fill-orange-500 text-orange-500 size-4" />;
      case "comment":
        return <MessageSquare className="text-orange-500 size-4" />;
      case "follow":
        return <UserPlus className="text-orange-500 size-4" />;
      default:
        return <div className="size-4" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case "like":
        return (
          <>
            Liked <span className="font-semibold">{notification.target}</span>
          </>
        );
      case "comment":
        return (
          <>
            Commented on{" "}
            <span className="font-semibold">{notification.target}</span>
            <p className="text-gray-500">&quot;{notification.content}&quot;</p>
          </>
        );
      case "follow":
        return (
          <>
            <span className="font-semibold">
              {notification.user.name + " "}
            </span>
            Followed you!
          </>
        );
      case "post":
        return (
          <>
            <span className="font-semibold">
              {notification.user.name + " "}
            </span>
            just posted
            <p className="text-gray-500">{notification.content}</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <div className="flex-1">
        <div className="mt-4 flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <button>
            <X className="size-6" />
          </button>
        </div>

        <div className="divide-y">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex gap-3 p-4">
              <Image
                src={notification.user.avatar || "/placeholder.svg"}
                alt={notification.user.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              {getNotificationIcon(notification.type)}
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <span className="flex-1">
                    {getNotificationText(notification)}
                  </span>
                  <div className="flex items-center justify-between">
                    {notification.thumbnail && (
                      <Image
                        src={notification.thumbnail || "/placeholder.svg"}
                        alt={notification.content || ""}
                        width={48}
                        height={48}
                        className="ml-28 rounded-md"
                      />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {notification.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
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
            <item.icon /*className="h-6 w-6"*/ />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
