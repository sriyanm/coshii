"use client";

import React from "react";
import { useEffect } from "react";
import Image from "next/image";
import { X, Mail } from "lucide-react";
import { SiFacebook, SiX, SiInstagram } from "react-icons/si";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Shop } from "../types/index";

interface EditShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopData: Shop;
  onShopUpdate: (updatedShopData: Shop) => void;
}

export default function EditShopModal({
  isOpen,
  onClose,
  shopData,
  onShopUpdate,
}: EditShopModalProps) {
  const [shopInfo, setShopInfo] = React.useState<Shop>({
    createdAt: "",
    creatorId: "",
    profilePic: "",
    shopName: "",
    username: "",
    email: "",
    description: "",
    socialLinks: [
      { platform: "Facebook", url: "https://facebook.com", username: "" },
      { platform: "X", url: "https://x.com", username: "" },
      { platform: "Instagram", url: "https://instagram.com", username: "" },
    ],
    categories: [
      "All",
      "Reposts",
      "Cups",
      "Ashtrays",
      "Sculptures",
      "Scroll Past This",
    ],
    isPremium: false,
  });

  // Initialize state with shopData when modal opens
  useEffect(() => {
    if (isOpen) {
      setShopInfo(shopData);
    }
  }, [isOpen, shopData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setShopInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    platform: "Instagram" | "Facebook" | "X",
  ) => {
    const value = e.target.value.trim();

    const urlPrefixes: Record<string, string> = {
      Instagram: "https://instagram.com/",
      Facebook: "https://facebook.com/",
      X: "https://x.com/",
    };

    const existingLinks = Array.isArray(shopInfo.socialLinks)
      ? shopInfo.socialLinks
      : [];

    const updatedSocialLinks = existingLinks.some(
      (link) => link.platform === platform,
    )
      ? existingLinks.map((link) =>
          link.platform === platform
            ? {
                ...link,
                username: value,
                url: `${urlPrefixes[platform]}${value || ""}`,
              }
            : link,
        )
      : [
          ...existingLinks,
          {
            platform,
            username: value,
            url: `${urlPrefixes[platform]}${value || ""}`,
          },
        ];

    setShopInfo((prev) => ({
      ...prev,
      socialLinks: updatedSocialLinks,
    }));
  };

  // Safe access of Instagram username
  const instagramUsername = Array.isArray(shopInfo.socialLinks)
    ? shopInfo.socialLinks.find((link) => link.platform === "Instagram")
        ?.username || ""
    : "";
  const XUsername = Array.isArray(shopInfo.socialLinks)
    ? shopInfo.socialLinks.find((link) => link.platform === "X")?.username || ""
    : "";
  const facebookUsername = Array.isArray(shopInfo.socialLinks)
    ? shopInfo.socialLinks.find((link) => link.platform === "Facebook")
        ?.username || ""
    : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Shop info updated:", shopInfo);
    onShopUpdate(shopInfo);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b bg-white p-4">
            <h1 className="flex-1 text-center text-xl font-bold">
              Edit shop info
            </h1>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4"
            >
              <X className="size-6" />
            </button>
          </div>

          <div className="space-y-4 p-4">
            {/* Profile Image */}
            <div className="flex justify-center">
              <Image
                src={shopInfo.profilePic || "/placeholder.svg"}
                alt="Profile"
                width={100}
                height={100}
                className="mx-auto size-20 rounded-full object-cover"
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm">Shop name:</label>
                <Input
                  name="shopName"
                  value={shopInfo.shopName}
                  onChange={handleInputChange}
                  className="bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">Username:</label>
                <Input
                  name="username"
                  value={shopInfo.username}
                  onChange={handleInputChange}
                  className="bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">Bio:</label>
                <Textarea
                  name="description"
                  value={shopInfo.description}
                  onChange={handleInputChange}
                  className="min-h-[150px] bg-gray-100"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <SiInstagram className="size-6" />
                  <Input
                    name="instagramUsername"
                    value={instagramUsername} // Display Instagram username from socialLinks
                    onChange={(e) => handleSocialUsernameChange(e, "Instagram")}
                    placeholder="username"
                    className="bg-gray-100"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <SiX className="size-6" />
                  <Input
                    name="XUsername"
                    value={XUsername} // Display X username from socialLinks
                    onChange={(e) => handleSocialUsernameChange(e, "X")}
                    placeholder="username"
                    className="bg-gray-100"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <SiFacebook className="size-6" />
                  <Input
                    name="facebookUsername"
                    value={facebookUsername} // Display Instagram username from socialLinks
                    onChange={(e) => handleSocialUsernameChange(e, "Facebook")}
                    placeholder="username"
                    className="bg-gray-100"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="size-6" />
                  <Input
                    name="email"
                    type="email"
                    value={shopInfo.email}
                    onChange={handleInputChange}
                    placeholder="email address"
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="flex items-center justify-center">
              <Button
                type="submit"
                className="w-1/4 bg-gray-300 font-bold text-black hover:bg-gray-300"
              >
                Confirm
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
