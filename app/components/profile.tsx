"use client";

import Link from "next/link";
import { CiBellOn } from "react-icons/ci"; // Import CiBellOn

// Subcomponent for Profile Header
function ProfileHeader({
  profilePic,
  shopName,
  username,
  description,
  sellerView,
}: {
  profilePic: string;
  shopName: string;
  username: string;
  description: string;
  sellerView: boolean;
}) {
  return (
    <div className="relative p-5 text-center">
      {" "}
      {/* Added relative positioning */}
      {/* Bell Icon (Top-Right Corner) */}
      {sellerView && (
        <div className="absolute right-5 top-5">
          <CiBellOn
            className="size-6 cursor-pointer text-gray-500 hover:text-gray-800"
            title="Notifications"
          />
        </div>
      )}
      {/* Profile Picture */}
      <img
        src={profilePic}
        alt="Profile"
        className="mx-auto size-24 rounded-full object-cover"
      />
      {/* Shop Name with Optional Edit Button */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <h1 className="text-2xl font-semibold">{shopName}</h1>
        {sellerView && (
          <button
            title="Edit Shop Name"
            className="text-gray-500 hover:text-gray-800"
            aria-label="Edit Shop Name"
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
        )}
      </div>
      {/* Username and Description */}
      <p className="text-gray-600">@{username}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function SocialLinksBar({
  socialLinks,
}: {
  socialLinks: { platform: string; url: string; icon: JSX.Element }[]; // Added the `icon` prop to the array type
}) {
  return (
    <div className="flex justify-center gap-4">
      {socialLinks.map(({ platform, url, icon }) => (
        <Link
          key={platform}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title={platform}
          className="flex items-center"
        >
          {icon ? (
            <span className="flex size-5 items-center">{icon}</span> // Display the SVG icon
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
  profilePic,
  shopName,
  username,
  description,
  socialLinks,
  sellerView,
}: {
  profilePic: string;
  shopName: string;
  username: string;
  description: string;
  socialLinks: { platform: string; url: string; icon: JSX.Element }[]; // Added the `icon` prop to the array type
  sellerView: boolean;
}) {
  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-lg bg-white p-5">
      <ProfileHeader
        profilePic={profilePic}
        shopName={shopName}
        username={username}
        description={description}
        sellerView={sellerView}
      />
      <SocialLinksBar socialLinks={socialLinks} />
    </div>
  );
}
