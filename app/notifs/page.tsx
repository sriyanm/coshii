// this is the notifications page, not the actual shop page

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  // Store,
  // Search,
  // PlusSquare,
  // Shirt,
  // Settings,
  X,
  Heart,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/client/firebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Notification, NotificationType } from "../types";

// const notifications: Notification[] = [
//   {
//     id: "1",
//     type: "like",
//     user: {
//       name: "Sarah",
//       avatar: "/placeholder.svg",
//     },
//     target: "Million Glaze Vase",
//     timestamp: "14h",
//   },
//   {
//     id: "2",
//     type: "comment",
//     user: {
//       name: "Emma",
//       avatar: "/placeholder.svg",
//     },
//     content: "Lovely work, babes<3",
//     target: "Glass Chandelier Sculpture",
//     timestamp: "2h",
//   },
//   {
//     id: "3",
//     type: "follow",
//     user: {
//       name: "Jessy K",
//       avatar: "/placeholder.svg",
//     },
//     timestamp: "3d",
//   },
//   {
//     id: "4",
//     type: "post",
//     user: {
//       name: "Elizabeth",
//       avatar: "/placeholder.svg",
//     },
//     content: "Set of 5 ceramic plates",
//     timestamp: "2h",
//     thumbnail: "/placeholder.svg",
//   },
// ];

export default function Notifs() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifs([]);
        // setIsLoading(false);
        return;
      }

      try {
        const notifsRef = collection(db, "notifications");
        const q = query(notifsRef, where("toUser", "==", user.uid));

        const querySnapshot = await getDocs(q);
        const fetchedNotifs: Notification[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Notif data:", data);

          // Check if mediaUrls exists and has valid entries
          // const mediaUrl =
          //   data.mediaUrls && data.mediaUrls.length > 0
          //     ? data.mediaUrls[0]
          //     : null;
          // console.log("Using mediaUrl:", mediaUrl);

          fetchedNotifs.push({
            id: doc.id,
            type: data.type || "",
            user: {
              name: data.fromUser || "",
              avatar: "/placeholder.svg",
            },
            content: data.content || "",
            target: data.target || "",
            timestamp: data.timestamp || "",
            thumbnail: data.thumbnail || "",
          });

          console.log(
            "Fetched notification:",
            data.type,
            data.fromUser,
            data.content,
            data.target,
            data.timestamp,
            data.thumbnail,
          );
        });

        // TODO: Sort notifs by earliest to latest timestamp
        fetchedNotifs.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return a.timestamp.localeCompare(b.timestamp);
          }
          return 0;
        });

        setNotifs(fetchedNotifs);
      } catch (error) {
        console.error("Error fetching notifs:", error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

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
          <Link href="/yourstore">
            <X className="size-6" />
          </Link>
        </div>

        <div className="divide-y">
          {notifs.map((notification) => (
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
    </div>
  );
}
