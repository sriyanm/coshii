"use client";

import { useState } from "react";
import {
  Store,
  Search,
  PlusSquare,
  Shirt,
  Settings,
  CircleArrowUpIcon,
  StarIcon,
} from "lucide-react";
import Link from "next/link";
import type { NavigationItem } from "../types";

const navigation: NavigationItem[] = [
  { name: "Shop", icon: Store, href: "/" },
  { name: "Search", icon: Search, href: "/search" },
  { name: "New Product", icon: PlusSquare, href: "/add-product" },
  { name: "Backrooms", icon: Shirt, href: "/inventory" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

// This would normally come from your auth/user context
const userProfile = {
  name: "Ajay Gokhale",
  phone: "646-726-0864",
  email: "ajaygokhale@google.net",
  shopName: "Ajay's Ceramics",
  plan: "free", // or "paid"
};

export default function SettingsPage() {
  const [currentTab] = useState("Settings");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <div className="flex-1 space-y-4 p-4">
        <h1 className="mx-3 text-2xl font-bold">Settings</h1>

        {/* Plan Card */}
        {userProfile.plan === "paid" ? (
          <div className="rounded-2xl mx-3 rounded-md bg-gradient-to-r from-orange-400 to-amber-400 p-6">
            <p className="mb-2 text-white">Your Plan</p>
            <div className="flex items-center gap-2">
              <h2 className="text-4xl font-bold text-white">Paid Plan</h2>
              <StarIcon className="size-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl mx-3 rounded-md bg-black p-6 text-white">
            <p className="mb-2">Your Plan</p>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-4xl font-bold">Free Plan</h2>
              <CircleArrowUpIcon className="size-6" />
            </div>
            <p className="text-sm">
              Upgrade now to unlock Coshii&apos;s full set of shop tools!
            </p>
            <ul className="text-xs text-gray-300">
              <li>• Connect with Stripe Payments</li>
              <li>• Fulfill orders all within Coshii</li>
              <li>• Track frequent buyers and build your fanclub</li>
              <li>• Access Coshii&apos;s A.I. video editor</li>
            </ul>
          </div>
        )}

        {/* Profile Information */}
        <div className="rounded-2xl mx-3 rounded-md bg-gray-50 p-6">
          <h2 className="mb-4 text-lg font-bold">Profile Information</h2>

          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <label className="block text-sm text-gray-500">Name</label>
              <input
                type="text"
                value={userProfile.name}
                readOnly
                className="w-full bg-transparent text-base"
              />
            </div>

            <div className="border-b border-gray-200 pb-3">
              <label className="block text-sm text-gray-500">
                Phone Number
              </label>
              <input
                type="tel"
                value={userProfile.phone}
                readOnly
                className="w-full bg-transparent text-base"
              />
            </div>

            <div className="border-b border-gray-200 pb-3">
              <label className="block text-sm text-gray-500">Email</label>
              <input
                type="email"
                value={userProfile.email}
                readOnly
                className="w-full bg-transparent text-base"
              />
            </div>

            <div className="pb-3">
              <label className="block text-sm text-gray-500">Shop Name</label>
              <input
                type="text"
                value={userProfile.shopName}
                readOnly
                className="w-full bg-transparent text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="flex h-16 items-center justify-around border-t bg-white px-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 ${
              currentTab === item.name ? "text-black" : "text-black/50"
            }`}
          >
            <item.icon /*className="h-6 w-6"*/ />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
