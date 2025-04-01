"use client";

import Link from "next/link";
import { CiBellOn } from "react-icons/ci"; // Import CiBellOn
import { SiFacebook, SiX, SiInstagram } from "@icons-pack/react-simple-icons";
import EditShopModal from "../components/EditShopModal";
import { useState } from "react";
import { Shop } from "../types/index";

// Subcomponent for Profile Header
function ProfileHeader({
  shopData,
  sellerView,
  onShopUpdate,
}: {
  shopData: Shop;
  sellerView: boolean;
  onShopUpdate: (updatedShopData: Shop) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="relative p-5 text-center">
      {" "}
      {/* Added relative positioning */}
      {/* Bell Icon (Top-Right Corner) */}
      {sellerView && (
        <div className="absolute right-5 top-5">
          <Link href="/yourstore">
            <CiBellOn
              className="size-6 cursor-pointer font-bold text-gray-500 hover:text-gray-800"
              title="Notifications"
            />
          </Link>
        </div>
      )}
      {/* Profile Picture */}
      <img
        src={shopData.profilePic}
        alt="Profile"
        className="mx-auto size-24 rounded-full object-cover"
      />
      {/* Shop Name with Optional Edit Button */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <h1 className="text-2xl font-semibold">{shopData.shopName}</h1>
        {sellerView && (
          <div>
            {/* Floating Edit Button */}
            <button
              title="Edit Shop Name"
              className="text-gray-500 hover:text-gray-800"
              aria-label="Edit Shop Name"
              onClick={() => setIsModalOpen(true)}
            >
              {/* Pencil SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
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
          </div>
        )}
      </div>
      {/* Username and Description */}
      <p className="text-gray-600">@{shopData.username}</p>
      <p className="mt-2 text-sm text-gray-500">{shopData.description}</p>
    </div>
  );
}

function SocialLinksBar({
  socialLinks,
}: {
  socialLinks: { platform: string; url: string }[]; // Added the `icon` prop to the array type
}) {
  const SOCIAL_ICONS: Record<string, JSX.Element> = {
    Facebook: <SiFacebook size={30} />,
    Twitter: <SiX size={30} />,
    Instagram: <SiInstagram size={30} />,
  };

  return (
    <div className="flex justify-center gap-4">
      {socialLinks.map(({ platform, url }) => (
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
            </span> // Display the SVG icon
          ) : (
            <span>{platform}</span> // Fallback text if no icon is provided
          )}
        </Link>
      ))}
    </div>
  );
}

// Main Profile Component
export function Profile({
  shopData,
  sellerView,
  onShopUpdate,
}: {
  shopData: Shop;
  sellerView: boolean;
  onShopUpdate: (updatedShopData: Shop) => void;
}) {
  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-lg bg-white p-5">
      <ProfileHeader
        shopData={shopData}
        sellerView={sellerView}
        onShopUpdate={onShopUpdate}
      />
      <SocialLinksBar socialLinks={shopData.socialLinks} />
    </div>
  );
}
