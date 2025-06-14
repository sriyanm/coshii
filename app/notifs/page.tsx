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
import { collection, query, where, getDocs, doc, getDoc, orderBy, 
  limit, startAfter, QueryDocumentSnapshot } from "firebase/firestore";
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
  const [ourShopHandle, setOurShopHandle] = useState<string | null>(null);
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
      // fetch shop data from user id creator id
      const shopsRef = collection(db, "shops");
      const q = query(shopsRef, where("creatorId", "==", user.uid));
      const shopQuery = getDocs(q);
      shopQuery
        .then((snapshot) => {
          if (snapshot.empty) {
            console.error("No shop found for user:", user.uid);
          } else {
            const shopData = snapshot.docs[0].data();
            const ourShopHandle = shopData.username;
            setOurShopHandle(ourShopHandle);
          }
        })
        .catch((error) => {
          console.error("Error fetching shop data:", error);
        }
      );
    });

    return () => unsubscribe();
  }, [auth, router]);

  useEffect(() => {
    const fetchAllNotifications = async () => {
      if (!user) {
        setNotifs([]);
        setIsLoading(false);
        return;
      }

      try {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const twoWeeksAgoISO = twoWeeksAgo.toISOString();

        const notifsRef = collection(db, "notifications");
        let q = query(notifsRef, where("toUser", "==", user.uid), 
        where("timestamp", ">=", twoWeeksAgoISO), orderBy("timestamp", "desc"), 
        limit(10));

        const allNotifs: Notification[] = [];
        let lastDoc: QueryDocumentSnapshot | null = null;
        let hasMore = true;
  
        while (hasMore) {
          const snapshot = await getDocs(q);
          if (snapshot.empty) break;
  
          for (const notifDoc of snapshot.docs) {
            const data = notifDoc.data();
  
            // Fetch shop info
            const shopQuery = query(collection(db, "shops"), where("creatorId", "==", data.fromUser));
            const shopSnapshot = await getDocs(shopQuery);
            if (shopSnapshot.empty) continue;
  
            const shopData = shopSnapshot.docs[0].data();
            const profilePic = shopData.profilePic || "/placeholder.svg";
            const shopHandle = shopData.username || "";
  
            // Fetch user info
            const userRef = doc(db, "users", data.fromUser);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) continue;
  
            const userData = userSnap.data();
            const creatorName = userData?.creatorName || "";
  
            allNotifs.push({
              id: notifDoc.id,
              type: data.type || "",
              user: {
                name: creatorName,
                avatar: profilePic,
              },
              content: data.content || "",
              target: data.target || "",
              timestamp: data.timestamp || "",
              thumbnail: data.thumbnail || "",
              shopHandle,
              productId: data.productId || "",
            });
          }
  
          lastDoc = snapshot.docs[snapshot.docs.length - 1];
          if (snapshot.size < 10) {
            hasMore = false;
          } else {
            // Prepare next page query using startAfter
            q = query(
              notifsRef,
              where("toUser", "==", user.uid),
              where("timestamp", ">=", twoWeeksAgoISO),
              orderBy("timestamp", "desc"),
              startAfter(lastDoc),
              limit(10)
            );
          }
        }

        // allNotifs.sort((a, b) => {
        //   if (a.timestamp && b.timestamp) {
        //     return b.timestamp.localeCompare(a.timestamp); // descending order
        //   }
        //   return 0;
        // });
  
        setNotifs(allNotifs);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (!userLoading) {
      fetchAllNotifications();
    }
  }, [user, userLoading]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "like":
        return <Heart className="fill-orange text-white size-6" />;
      case "comment":
        return <MessageSquare className="fill-orange text-white size-6" />;
      case "follow":
        return <UserPlus className="fill-orange text-orange size-6" />
      default:
        return <div className="size-6" />;
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

  const getLink = (notification: Notification): string => {
    switch (notification.type) {
      case "like":
        return `/${notification.shopHandle}`;
      case "comment":
        return `/${ourShopHandle}#product-${notification.productId || ""}`; 
      case "follow":
        return `/${notification.shopHandle}`;
      case "post":
        return `/${notification.shopHandle}#product-${notification.productId || ""}`;
      default:
        return `/${notification.shopHandle}`;
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
          {notifs.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No notifications yet!
            </div>
          )}
          {notifs.map((notification) => (
            <Link 
              key={notification.id}
              href={getLink(notification)}
              className="block"
            >
            <div className="flex gap-6 p-4 hover:bg-gray-50 rounded-md">
              {/* Avatar + Icon Container */}
              <div className="relative w-10 h-10">
                <Image
                  src={notification.user.avatar || "/placeholder.svg"}
                  alt={notification.user.name}
                  width={40}
                  height={40}
                  className="rounded-full w-10 h-10"
                />
                <div className="absolute -top-2 -right-3 rounded-full">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>

              {/* Main Text + Thumbnail */}
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
                <p className="text-xs text-gray-500">
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
