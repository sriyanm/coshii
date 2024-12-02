"use client";

import { useState } from "react";
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
        className="rounded-full mx-auto size-24 object-cover"
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
        <button className="!bg-red-400 text-black rounded-md px-5 py-2">
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

function Toggle({
  options,
  selectedOption,
  onOptionSelect,
  font = "SF Pro",
  underline = false,
}: {
  options: string[];
  selectedOption: string;
  onOptionSelect: (option: string) => void;
  font?: string; // Default font is sans-serif
  underline?: boolean; // Whether the selected option should be underlined
}) {
  return (
    <div
      className="my-1 flex justify-start gap-4 overflow-x-auto"
      style={{
        fontFamily: font,
        whiteSpace: "nowrap", // Prevent line breaks for horizontal scroll
        scrollBehavior: "smooth", // Smooth scrolling
        justifyContent: options.length <= 3 ? "center" : "flex-start", // Center if there are few options
      }}
    >
      {options.map((option) => (
        <button
          key={option}
          className={`rounded-md px-5 py-2 ${
            selectedOption === option
              ? `text-black bg-gray-200 font-bold ${underline ? "underline" : ""}`
              : "text-gray-500 bg-gray-100"
          }`}
          onClick={() => onOptionSelect(option)}
        >
          {option}
        </button>
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
  categories,
}: {
  profilePic: string;
  shopName: string;
  username: string;
  description: string;
  magicPagesUrl: string;
  socialLinks: { platform: string; url: string; icon: JSX.Element }[]; // Added the `icon` prop to the array type
  categories: string[];
}) {
  const [activeTab, setActiveTab] = useState("Shop");
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="bg-white mx-auto max-w-md overflow-hidden rounded-lg p-5 shadow-lg">
      <ProfileHeader
        profilePic={profilePic}
        shopName={shopName}
        username={username}
        description={description}
      />
      <SocialLinksBar magicPagesUrl={magicPagesUrl} socialLinks={socialLinks} />

      {/* Shop or Activity Toggle */}
      <Toggle
        options={["Shop", "Activity"]}
        selectedOption={activeTab}
        onOptionSelect={setActiveTab}
        font="SF Pro"
        underline={true}
      />

      {/* Categories Toggle */}
      <Toggle
        options={categories}
        selectedOption={selectedCategory}
        onOptionSelect={setSelectedCategory}
        font="SF Pro"
        underline={false}
      />
    </div>
  );
}
