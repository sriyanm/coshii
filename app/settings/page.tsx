"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Store,
  Search,
  PlusSquare,
  Shirt,
  Settings,
  Clock,
  Check,
} from "lucide-react";
import Link from "next/link";
import { Switch } from "../components/ui/switch";
import type { NavigationItem } from "../types";

const navigation: NavigationItem[] = [
  { name: "Shop", icon: Store, href: "/shop" },
  { name: "Search", icon: Search, href: "/search" },
  { name: "New Product", icon: PlusSquare, href: "/add-product" },
  { name: "Backrooms", icon: Shirt, href: "/inventory" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

type View =
  | "main"
  | "profile"
  | "subscription"
  | "editName"
  | "editPhone"
  | "editEmail"
  | "editShopName";

// This would normally come from your auth/user context
const userProfile = {
  name: "Ajay Gokhale",
  phone: "2487035531",
  email: "ajaygokhale1@gmail.com",
  shopName: "GOKHS STUDIO",
  plan: "Free",
};

export default function SettingsPage() {
  const [currentTab] = useState("Settings");
  const [currentView, setCurrentView] = useState<View>("main");
  const [binarySetting, setBinarySetting] = useState(false);
  const [choiceOption, setChoiceOption] = useState("Option 1");

  const renderMainView = () => (
    <div className="space-y-4">
      <h1 className="mx-3 text-2xl font-bold">Settings</h1>

      {/* Plan Card */}
      {userProfile.plan === "Free" && (
        <div className="mx-3 rounded-md bg-black p-6 text-white">
          <p className="mb-2">Your Plan</p>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-4xl font-bold">Free Plan</h2>
            <Clock className="size-6" />
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

      {/* Menu Items */}
      <div className="mx-3 space-y-2">
        <button
          onClick={() => setCurrentView("profile")}
          className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-4"
        >
          <span className="font-bold">PROFILE INFORMATION</span>
          <ChevronRight className="size-5 text-gray-400" />
        </button>

        <button
          onClick={() => setCurrentView("subscription")}
          className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-4"
        >
          <span className="font-bold">COSHII SUBSCRIPTION PLAN</span>
          <ChevronRight className="size-5 text-gray-400" />
        </button>

        <button className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-4">
          <span className="font-bold">[Placeholder]</span>
          <ChevronRight className="size-5 text-gray-400" />
        </button>

        <button className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-4">
          <span className="font-bold">[Placeholder]</span>
          <ChevronRight className="size-5 text-gray-400" />
        </button>
      </div>
    </div>
  );

  const renderProfileView = () => (
    <div className="space-y-4">
      <div className="mx-3">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <div className="mx-3 flex items-center gap-2">
        <button onClick={() => setCurrentView("main")} className="-ml-2 p-2">
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="text-xl font-bold">PROFILE INFORMATION</h1>
      </div>

      <div className="mx-3 space-y-2">
        <button
          onClick={() => setCurrentView("editName")}
          className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-4"
        >
          <div className="flex w-full flex-col">
            <span className="text-left text-sm font-bold">Name</span>
            <span className="text-left text-base text-gray-900">
              {userProfile.name}
            </span>
          </div>

          <ChevronRight className="ml-auto size-5 text-gray-400" />
        </button>

        <button
          onClick={() => setCurrentView("editPhone")}
          className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-4"
        >
          <div className="flex w-full flex-col">
            <span className="text-left text-sm font-bold">Phone Number</span>
            <span className="text-left text-base text-gray-900">
              {userProfile.phone}
            </span>
          </div>

          <ChevronRight className="ml-auto size-5 text-gray-400" />
        </button>

        <button
          onClick={() => setCurrentView("editEmail")}
          className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-4"
        >
          <div className="flex w-full flex-col">
            <span className="text-left text-sm font-bold">Email</span>
            <span className="text-left text-base text-gray-900">
              {userProfile.email}
            </span>
          </div>

          <ChevronRight className="ml-auto size-5 text-gray-400" />
        </button>

        <button
          onClick={() => setCurrentView("editShopName")}
          className="flex w-full items-center justify-between rounded-lg bg-gray-100 p-4"
        >
          <div className="flex w-full flex-col">
            <span className="text-left text-sm font-bold">Shop Name</span>
            <span className="text-left text-base text-gray-900">
              {userProfile.shopName}
            </span>
          </div>

          <ChevronRight className="ml-auto size-5 text-gray-400" />
        </button>

        <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4">
          <div>
            <div className="text-sm font-bold">binary setting</div>
            <div className="text-sm text-gray-500">subtext</div>
          </div>
          <Switch
            checked={binarySetting}
            onCheckedChange={setBinarySetting}
            className="data-[state=checked]:bg-black"
            onCheckedColor="bg-black"
          />
        </div>

        <div className="space-y-4 rounded-lg bg-gray-100 p-4">
          <div>
            <div className="font-medium">Choice list setting</div>
            <div className="text-sm text-gray-500">Subtext</div>
          </div>
          <div className="space-y-2 border-t pt-2">
            {["Option 1", "Option 2", "Option 3"].map((option) => (
              <button
                key={option}
                className="flex w-full items-center justify-between py-2"
                onClick={() => setChoiceOption(option)}
              >
                {option}
                {choiceOption === option && <Check className="size-6" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubscriptionView = () => (
    <div className="space-y-4">
      <div className="mx-3">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <div className="mx-3 flex items-center gap-2">
        <button onClick={() => setCurrentView("main")} className="-ml-2 p-2">
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="text-xl font-bold">COSHII SUBSCRIPTION PLAN</h1>
      </div>

      <div className="mx-3 space-y-4">
        <div
          className={`rounded-lg bg-gray-100 p-6 ${userProfile.plan === "Free" ? "relative border-8 border-black" : ""}`}
        >
          <h3 className="mb-2 text-lg font-bold">FREE PLAN</h3>
          <ul className="space-y-1">
            <li>- list products for sale easily</li>
            <li>- interact with other sellers</li>
            <li>-</li>
          </ul>
          {userProfile.plan === "Free" && (
            <div className="absolute right-6 top-6">
              <Check className="size-16 text-[#C6A052]" />
            </div>
          )}
        </div>

        <div
          className={`rounded-lg bg-gray-100 p-6 ${userProfile.plan === "Paid" ? "relative border-8 border-black" : ""}`}
        >
          <h3 className="mb-2 text-lg font-bold">COSHII PRO ($9.99 / Month)</h3>
          <p className="mb-2">All the benefits of the free plan plus:</p>
          <ul className="space-y-1">
            <li>- enable full checkout experience for customers</li>
            <li>- keep track of sold inventory from backroom</li>
          </ul>
          {userProfile.plan === "Paid" && (
            <div className="absolute right-6 top-6">
              <Check className="size-16 text-[#C6A052]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEditView = (field: string, value: string) => (
    <div className="space-y-4">
      <div className="mx-3">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <div className="mx-3 flex items-center gap-2">
        <button onClick={() => setCurrentView("profile")} className="-ml-2 p-2">
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="text-xl font-bold">{field}</h1>
      </div>

      <div className="mx-3 rounded-lg bg-gray-100 p-4">
        <input
          type="text"
          defaultValue={value}
          className="w-full bg-transparent text-lg"
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case "profile":
        return renderProfileView();
      case "subscription":
        return renderSubscriptionView();
      case "editName":
        return renderEditView("Name", userProfile.name);
      case "editPhone":
        return renderEditView("Phone Number", userProfile.phone);
      case "editEmail":
        return renderEditView("Email", userProfile.email);
      case "editShopName":
        return renderEditView("Shop Name", userProfile.shopName);
      default:
        return renderMainView();
    }
  };

  return (
    <div className="fixed inset-0 mx-auto flex min-h-screen max-w-md flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>

      {/*     <div className="fixed inset-0 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div> */}

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
