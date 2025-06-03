"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CiBellOn } from "react-icons/ci"; // Import CiBellOn
import { HiOutlineUserCircle } from "react-icons/hi";
import { SiFacebook, SiX, SiInstagram } from "react-icons/si";
import EditShopModal from "../components/EditShopModal";
import { useState } from "react";
import { Shop } from "../types/index";
import Image from "next/image";
import { JSX } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { db, auth } from "@/app/lib/client/firebase";
import { ChevronDown } from "lucide-react";
import { addDoc } from "firebase/firestore";

// Subcomponent for Profile Header
function ProfileHeader({
  shopData,
  buyerView,
  sellerView,
  onShopUpdate,
}: {
  shopData: Shop;
  buyerView: boolean;
  sellerView: boolean;
  onShopUpdate: (updatedShopData: Shop) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollowStatus, setLoadingFollowStatus] = useState(true);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  useEffect(() => {
    const checkFollowing = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const currentShopId = currentUser.uid;
        const visitedShopId = shopData.creatorId;

        if (currentShopId === visitedShopId) return;

        const shopsRef = collection(db, "shops");
        const snapshot = await getDocs(
          query(shopsRef, where("creatorId", "==", currentShopId)),
        );

        if (!snapshot.empty) {
          const currDoc = snapshot.docs[0];
          const data = currDoc.data();
          setIsFollowing(
            !!data.following?.[visitedShopId + "|" + shopData.username],
          );
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setLoadingFollowStatus(false);
      }
    };

    checkFollowing();
  }, [shopData.creatorId]);

  const handleFollow = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn("User not authenticated.");
        return;
      }

      const currentShopId = currentUser.uid;
      const visitedShopId = shopData.creatorId;

      const shopsRef = collection(db, "shops");

      const currSnapshot = await getDocs(
        query(shopsRef, where("creatorId", "==", currentShopId)),
      );
      const visitedSnapshot = await getDocs(
        query(
          shopsRef,
          where("creatorId", "==", visitedShopId),
          where("username", "==", shopData.username),
        ),
      );

      if (currSnapshot.empty || visitedSnapshot.empty) {
        console.warn("Could not find shop documents.");
        return;
      }

      const currDoc = currSnapshot.docs[0];
      const visitedDoc = visitedSnapshot.docs[0];

      if (isFollowing) {
        await updateDoc(currDoc.ref, {
          [`following.${visitedShopId + "|" + shopData.username}`]:
            deleteField(),
        });
        await updateDoc(visitedDoc.ref, {
          [`followers.${currentShopId + "|" + currDoc.data().username}`]:
            deleteField(),
        });
      } else {
        await updateDoc(visitedDoc.ref, {
          [`followers.${currentShopId + "|" + currDoc.data().username}`]: true,
        });
        await updateDoc(currDoc.ref, {
          [`following.${visitedShopId + "|" + shopData.username}`]: true,
        });
        // send notification
        if (visitedShopId !== auth.currentUser?.uid) {
          try {
            const notifsRef = collection(db, "notifications");
            await addDoc(notifsRef, {
              toUser: visitedShopId,
              fromUser: auth.currentUser?.uid,
              type: "follow",
              content: "",
              target: "",
              timestamp: new Date().toISOString(),
              thumbnail: "",
            });
  
            console.log("Notif sent successfully");
          } catch (error) {
            console.error("Failed to send follow notif:", error);
          }
        }
      }

      console.log(
        `${currDoc.data().username} ${isFollowing ? "unfollowed" : "followed"} ${visitedDoc.data().username}`,
      );
      setIsFollowing(!isFollowing);
      setShowUnfollowModal(false);
    } catch (error) {
      console.error("Error handling follow/unfollow:", error);
    }
  };
  return (
    <div className="relative p-5 text-center">
      {" "}
      {/* Bell Icon (Top-Right Corner) */}
      {sellerView && (
        <div className="absolute -right-5 top-6">
          <Link href="/notifs">
            <CiBellOn
              className="size-6 cursor-pointer font-bold text-gray-600 hover:text-gray-800"
              title="Notifications"
              style={{ strokeWidth: "0.6" }}
            />
          </Link>
        </div>
      )}
      {/* Login Button (also Top-Right) */}
      {buyerView && (
        <div className="absolute -right-5 top-6">
          <Link href="/signin">
            <HiOutlineUserCircle
              className="size-6 cursor-pointer font-bold text-gray-600 hover:text-gray-800"
              title="Sign in"
              style={{ strokeWidth: "1.5" }}
            />
          </Link>
        </div>
      )}
      {/* Profile Picture */}
      <Image
        width={100}
        height={100}
        src={shopData.profilePic || "/tempImages/blank.jpg"}
        alt="Profile"
        className="mx-auto size-24 rounded-full object-cover"
      />
      {/* Shop Name with Optional Edit Button */}
      <div className="mt-3 flex justify-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{shopData.shopName}</h1>
          {sellerView && (
            <>
              <button
                title="Edit Shop Name"
                className="flex items-center justify-center text-gray-500 hover:text-gray-800"
                aria-label="Edit Shop Name"
                onClick={() => setIsModalOpen(true)}
              >
                {/* Pencil SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 3.487a2.25 2.25 0 013.182 3.182L8.622 18.09a1.5 1.5 0 01-.53.35l-4.877 1.95a.375.375 0 01-.49-.49l1.95-4.876a1.5 1.5 0 01.35-.531L16.862 3.487z"
                  />
                </svg>
              </button>

              {/* Modal (Controlled Externally) */}
              <EditShopModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                shopData={shopData}
                onShopUpdate={onShopUpdate}
              />
            </>
          )}
        </div>
      </div>
      {/* Username and Description */}
      <p className="text-gray-600">@{shopData.username}</p>
      <p className="mt-2 text-sm text-gray-500">{shopData.description}</p>
      {auth.currentUser?.uid !== shopData.creatorId && !buyerView && (
        <div className="relative mt-4">
          {!isFollowing ? (
            <button
              className="rounded-lg bg-[#FED15B] px-4 py-2 text-black"
              onClick={handleFollow}
              disabled={loadingFollowStatus}
            >
              {loadingFollowStatus ? "" : "Follow"}
            </button>
          ) : (
            <div className="relative inline-block">
              <button
                className="flex items-center gap-1 rounded-lg bg-[#FED15B] px-4 py-2 text-black"
                onClick={() => setShowUnfollowModal((prev) => !prev)}
                disabled={loadingFollowStatus}
              >
                {loadingFollowStatus ? "" : "Following"}
                <ChevronDown className="size-4" />
              </button>

              {showUnfollowModal && (
                <div className="absolute left-0 top-full mt-2 w-32 rounded-md border bg-white shadow-lg">
                  <button
                    onClick={handleFollow}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                    disabled={loadingFollowStatus}
                  >
                    Unfollow
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SocialLinksBar({
  socialLinks,
}: {
  socialLinks: { platform: string; url: string }[];
}) {
  const SOCIAL_ICONS: Record<string, JSX.Element> = {
    Facebook: <SiFacebook size={30} />,
    X: <SiX size={30} />,
    Instagram: <SiInstagram size={30} />,
  };

  const SOCIAL_BASE_URLS: Record<string, string> = {
    Facebook: "https://facebook.com/",
    X: "https://X.com/",
    Instagram: "https://instagram.com/",
  };

  return (
    <div className="flex justify-center gap-4">
      {socialLinks
        ?.filter(({ platform, url }) => {
          const baseUrl = SOCIAL_BASE_URLS[platform];
          return baseUrl && url !== baseUrl;
        })
        .map(({ platform, url }) => (
          <Link
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={platform}
            className="flex items-center"
          >
            {SOCIAL_ICONS[platform] ? (
              <span className="flex size-5 items-center">
                {SOCIAL_ICONS[platform]}
              </span>
            ) : (
              <span>{platform}</span>
            )}
          </Link>
        ))}
    </div>
  );
}

// Main Profile Component
export function Profile({
  shopData,
  buyerView,
  sellerView,
  onShopUpdate,
}: {
  shopData: Shop;
  buyerView: boolean;
  sellerView: boolean;
  onShopUpdate: (updatedShopData: Shop) => void;
}) {
  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-lg bg-white p-5">
      <ProfileHeader
        shopData={shopData}
        buyerView={buyerView}
        sellerView={sellerView}
        onShopUpdate={onShopUpdate}
      />
      <SocialLinksBar socialLinks={shopData.socialLinks} />
    </div>
  );
}
