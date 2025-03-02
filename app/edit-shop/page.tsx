"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { Pencil, X, Instagram, Mail } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

interface ShopInfo {
  shopName: string;
  username: string;
  bio: string;
  instagramUsername: string;
  tiktokUsername: string;
  email: string;
}

export default function EditShopPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shopInfo, setShopInfo] = useState<ShopInfo>({
    shopName: "",
    username: "",
    bio: "",
    instagramUsername: "",
    tiktokUsername: "",
    email: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setShopInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Shop info updated:", shopInfo);
    setIsModalOpen(false);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <div className="p-4">
        <button onClick={() => setIsModalOpen(true)}>
          <Pencil className="size-6" />
        </button>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-[400px] overflow-y-auto rounded-lg bg-white">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between border-b bg-white p-4">
                <h1 className="flex-1 text-center text-xl font-bold">
                  Edit shop info
                </h1>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-4"
                >
                  <X className="size-6" />
                </button>
              </div>

              <div className="space-y-4 p-4">
                {/* Profile Image */}
                <div className="flex justify-center">
                  <Image
                    src="/placeholder.svg"
                    alt="Profile"
                    width={100}
                    height={100}
                    className="rounded-full"
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
                      name="bio"
                      value={shopInfo.bio}
                      onChange={handleInputChange}
                      className="min-h-[150px] bg-gray-100"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Instagram className="size-6" />
                      <Input
                        name="instagramUsername"
                        value={shopInfo.instagramUsername}
                        onChange={handleInputChange}
                        placeholder="username"
                        className="bg-gray-100"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <svg viewBox="0 0 24 24" className="size-6 fill-current">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                      <Input
                        name="tiktokUsername"
                        value={shopInfo.tiktokUsername}
                        onChange={handleInputChange}
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
      )}
    </div>
  );
}
