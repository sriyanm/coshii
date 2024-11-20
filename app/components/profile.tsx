"use client";

import React from "react";

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
    <div style={{ textAlign: "center", padding: "20px" }}>
      <img
        src={profilePic}
        alt="Profile"
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          objectFit: "cover",
          margin: "0 auto",
        }}
      />
      <h1 style={{ fontSize: "24px", margin: "10px 0" }}>{shopName}</h1>
      <p style={{ fontSize: "16px", color: "#555" }}>@{username}</p>
      <p style={{ fontSize: "14px", color: "#777", marginTop: "10px" }}>
        {description}
      </p>
    </div>
  );
}

// Subcomponent for Social Links Bar
function SocialLinksBar({
  magicPagesUrl,
  socialLinks,
}: {
  magicPagesUrl: string;
  socialLinks: { platform: string; url: string; iconSrc: string }[];
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        margin: "10px 0",
      }}
    >
      <button
        style={{
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={() => (window.location.href = magicPagesUrl)}
      >
        Magic Pages
      </button>
      {socialLinks.map(({ platform, url, iconSrc }) => (
        <a
          key={platform}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title={platform}
        >
          <img
            src={iconSrc}
            alt={platform}
            style={{ width: "30px", height: "30px" }}
          />
        </a>
      ))}
    </div>
  );
}

// Subcomponent for Shop or Activity Toggle
function ShopOrActivityToggle({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        margin: "20px 0",
      }}
    >
      <button
        style={{
          padding: "10px 20px",
          backgroundColor: activeTab === "Shop" ? "#007BFF" : "#f0f0f0",
          color: activeTab === "Shop" ? "#fff" : "#000",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={() => onTabChange("Shop")}
      >
        Shop
      </button>
      <button
        style={{
          padding: "10px 20px",
          backgroundColor: activeTab === "Activity" ? "#007BFF" : "#f0f0f0",
          color: activeTab === "Activity" ? "#fff" : "#000",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={() => onTabChange("Activity")}
      >
        Activity
      </button>
    </div>
  );
}

// Subcomponent for Categories
function Categories({
  selectedCategory,
  categories,
  onCategorySelect,
}: {
  selectedCategory: string;
  categories: string[];
  onCategorySelect: (category: string) => void;
}) {
  return (
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      {categories.map((category) => (
        <button
          key={category}
          style={{
            padding: "10px 15px",
            margin: "5px",
            backgroundColor:
              selectedCategory === category ? "#007BFF" : "#f8f8f8",
            color: selectedCategory === category ? "#fff" : "#000",
            border: "1px solid #ddd",
            borderRadius: "20px",
            cursor: "pointer",
          }}
          onClick={() => onCategorySelect(category)}
        >
          {category}
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
  socialLinks: { platform: string; url: string; iconSrc: string }[];
  categories: string[];
}) {
  const [activeTab, setActiveTab] = React.useState("Shop");
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "20px auto",
        backgroundColor: "#fff",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      <ProfileHeader
        profilePic={profilePic}
        shopName={shopName}
        username={username}
        description={description}
      />
      <SocialLinksBar magicPagesUrl={magicPagesUrl} socialLinks={socialLinks} />
      <ShopOrActivityToggle activeTab={activeTab} onTabChange={setActiveTab} />
      <Categories
        selectedCategory={selectedCategory}
        categories={categories}
        onCategorySelect={setSelectedCategory}
      />
    </div>
  );
}
