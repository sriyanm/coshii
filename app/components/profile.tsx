"use client";

import Link from "next/link";

// Subcomponent for Profile Header
function ProfileHeader({
  profilePic,
  shopName,
  username,
  description,
}: {
  profilePic: string;
  shopName: string;
  username: string;
  description: string;
}) {
  return (
    <div className="p-5 text-center">
      <img
        src={profilePic}
        alt="Profile"
        className="mx-auto size-24 rounded-full object-cover"
      />
      <h1 className="mt-3 text-2xl font-semibold">{shopName}</h1>
      <p className="text-gray-600">@{username}</p>
      <p className="text-gray-500 mt-2 text-sm">{description}</p>
    </div>
  );
}

function SocialLinksBar({
  magicPagesUrl,
  socialLinks,
}: {
  magicPagesUrl: string;
  socialLinks: { platform: string; url: string; icon: JSX.Element }[]; // Added the `icon` prop to the array type
}) {
  return (
    <div className="my-1 flex justify-center gap-4">
      <Link href={magicPagesUrl} passHref>
        <button className="!bg-red-400 rounded-md px-5 py-2 text-black">
          Magic Pages
        </button>
      </Link>
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
            <span className="flex items-center">{icon}</span> // Display the SVG icon
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
  magicPagesUrl,
  socialLinks,
}: {
  profilePic: string;
  shopName: string;
  username: string;
  description: string;
  magicPagesUrl: string;
  socialLinks: { platform: string; url: string; icon: JSX.Element }[]; // Added the `icon` prop to the array type
}) {
  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-lg bg-white p-5 shadow-lg">
      <ProfileHeader
        profilePic={profilePic}
        shopName={shopName}
        username={username}
        description={description}
      />
      <SocialLinksBar magicPagesUrl={magicPagesUrl} socialLinks={socialLinks} />
    </div>
  );
}
