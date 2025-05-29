"use client";

import React from "react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, Mail, Pencil } from "lucide-react";
import { SiFacebook, SiX, SiInstagram } from "react-icons/si";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Shop } from "../types/index";
import { auth } from "@/app/lib/client/firebase";
import { useProfilePictureUpload } from "@/app/hooks/firebase";

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
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const profilePictureUpload = useProfilePictureUpload();

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

  const handleFileUpload = async (file: File): Promise<string | null> => {
    if (!auth.currentUser) {
      console.error("No authenticated user found");
      return null;
    }
    console.log("Uploading file:", file);
    try {
      const profilePictureDownloadURL = await profilePictureUpload.mutateAsync({
        file: file,
        userId: auth.currentUser.uid,
      });
      console.log("Uploaded to:", profilePictureDownloadURL);
      return profilePictureDownloadURL;
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
      return null;
    } finally {
      console.log("Done trying to upload file");
    }
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

    let updatedSocialLinks;

    if (value === "") {
      // Remove the entry for the platform
      updatedSocialLinks = existingLinks.filter(
        (link) => link.platform !== platform,
      );
    } else {
      const platformExists = existingLinks.some(
        (link) => link.platform === platform,
      );
      updatedSocialLinks = platformExists
        ? existingLinks.map((link) =>
            link.platform === platform
              ? {
                  ...link,
                  username: value,
                  url: `${urlPrefixes[platform]}${value}`,
                }
              : link,
          )
        : [
            ...existingLinks,
            {
              platform,
              username: value,
              url: `${urlPrefixes[platform]}${value}`,
            },
          ];
    }

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
      <div className="mx-auto h-4/5 w-[90%] max-w-md overflow-y-auto rounded-lg bg-white shadow-lg">
        <form onSubmit={handleSubmit}>
          {/* Header — No padding issues */}
          <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white p-4">
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

          {/* Body*/}
          <div className="space-y-4 p-4 sm:p-6">
            <div className="space-y-4 p-4">
              {/* Profile Image */}
              <div className="flex justify-center">
                <input
                  type="file"
                  accept="image/*"
                  ref={profilePicInputRef}
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      const uploadedUrl = await handleFileUpload(
                        e.target.files[0],
                      );
                      if (uploadedUrl) {
                        setShopInfo((prev) => ({
                          ...prev,
                          profilePic: uploadedUrl,
                        }));
                      }
                    }
                  }}
                />

                {/* Group wrapper required for hover to work */}
                <div
                  className="group relative cursor-pointer"
                  onClick={() => profilePicInputRef.current?.click()}
                >
                  <Image
                    src={shopInfo.profilePic || "/placeholder.svg"}
                    alt="Profile"
                    width={100}
                    height={100}
                    className="mx-auto size-20 rounded-full object-cover"
                  />

                  {/* Pencil icon overlay */}
                  <div className="absolute bottom-1 right-1 flex size-6 items-center justify-center rounded-full bg-black bg-opacity-70 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Pencil size={14} />
                  </div>
                </div>
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
                      onChange={(e) =>
                        handleSocialUsernameChange(e, "Instagram")
                      }
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
                      onChange={(e) =>
                        handleSocialUsernameChange(e, "Facebook")
                      }
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
          </div>
        </form>
      </div>
    </div>
  );
}
