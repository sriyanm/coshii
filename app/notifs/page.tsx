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
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/client/firebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Notification, NotificationType } from "../types";
import { useRouter } from "next/navigation";

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
  const [isLoading, setIsLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true); // New state to track user loading
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth();
  const router = useRouter();

  function timeAgo(timestamp: string): string {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
  
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours   = Math.floor(minutes / 60);
    const days    = Math.floor(hours / 24);
  
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/onboarding");
        return;
      }
      setUser(user);
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifs([]);
        setIsLoading(false);
        return;
      }

      try {
        const notifsRef = collection(db, "notifications");
        const q = query(notifsRef, where("toUser", "==", user.uid));

        const querySnapshot = await getDocs(q);
        const fetchedNotifs: Notification[] = [];

        for (const notifDoc of querySnapshot.docs) {
          const data = notifDoc.data();
          // console.log("Notif data:", data);

          // Check if mediaUrls exists and has valid entries
          // const mediaUrl =
          //   data.mediaUrls && data.mediaUrls.length > 0
          //     ? data.mediaUrls[0]
          //     : null;
          // console.log("Using mediaUrl:", mediaUrl);

          // fetch profilePic and shopHandle from shops db
          const shopsRef = collection(db, "shops");
          // console.log("Fetching shop data for user:", data.fromUser);
          const shopQuery = query(shopsRef, where("creatorId", "==", data.fromUser));

          const shopQuerySnapshot = await getDocs(shopQuery);
          if (shopQuerySnapshot.empty) {
            // console.log("No shop found for user:", data.fromUser);
            continue; // Skip this notification if no shop found
          }
          const shopData = shopQuerySnapshot.docs[0].data();
          const profilePic = shopData.profilePic;
          const shopHandle = shopData.username;

          const userRef = doc(db, "users", data.fromUser);
          const userSnapshot = await getDoc(userRef);
          if (!userSnapshot.exists()) {
            // console.log("No user data found for:", data.fromUser);
            continue; // Skip this notification if no user data found
          }
          const userData = userSnapshot.exists() ? userSnapshot.data() : {};
          const creatorName = userData.creatorName;

          fetchedNotifs.push({
            id: notifDoc.id,
            type: data.type || "",
            user: {
              name: creatorName || "",
              avatar: profilePic || "/placeholder.svg",
            },
            content: data.content || "",
            target: data.target || "",
            timestamp: data.timestamp || "",
            thumbnail: data.thumbnail || "",
            shopHandle: shopHandle || "",
          });

          // console.log(
          //   "Fetched notification:",
          //   data.type,
          //   data.fromUser,
          //   data.content,
          //   data.target,
          //   data.timestamp,
          //   data.thumbnail,
          //   creatorName,
          //   profilePic,
          //   shopHandle
          // );
        }

        // TODO: Sort notifs by earliest to latest timestamp
        fetchedNotifs.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return b.timestamp.localeCompare(a.timestamp);
          }
          return 0;
        });

        setNotifs(fetchedNotifs);
      } catch (error) {
        console.error("Error fetching notifs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if(!userLoading) {
      fetchNotifications();
    }
  }, [user, userLoading]);

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

  function getMediaTypeFromUrl(url: string): 'image' | 'video' {
    const extension = url.split('.').pop()?.split("?")[0].toLowerCase() || '';
    const videoExtensions = ['mp4', 'mov', 'avi', 'webm'];
    return videoExtensions.includes(extension) ? 'video' : 'image';
  }

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <div className="flex-1">
        <div className="mt-4 flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <Link href="/">
            <X className="size-6" />
          </Link>
        </div>

        {isLoading || userLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-b-2 border-gray-900" />
        </div>
        ) : (
        <div className="divide-y">
          {notifs.map((notification) => (
            <Link 
              key={notification.id}
              href={`/${notification.shopHandle}`}
              className="block"
            >
            <div key={notification.id} className="flex gap-3 p-4 hover:bg-gray-50 rounded-md">
              <Image
                src={notification.user.avatar || "/placeholder.svg"}
                alt={notification.user.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
              {getNotificationIcon(notification.type)}
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <span className="flex-1">
                    {getNotificationText(notification)}
                  </span>
                  <div className="flex items-center justify-between">
                    {notification.thumbnail && getMediaTypeFromUrl(notification.thumbnail) === 'image' && (
                      <Image
                        src={notification.thumbnail || "/placeholder.svg"}
                        alt={notification.content || ""}
                        width={48}
                        height={48}
                        className="ml-2 h-12 w-12 rounded-md object-cover shrink-0"
                      />
                    )}
                    {notification.thumbnail && getMediaTypeFromUrl(notification.thumbnail) === 'video' && (
                      <video
                        src={notification.thumbnail || "/placeholder.svg"}
                        width={48}
                        height={48}
                        className="ml-2 h-12 w-12 rounded-md object-cover shrink-0"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {timeAgo(notification.timestamp)}
                </p>
              </div>
            </div>
            </Link>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
