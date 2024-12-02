"use client";
import Link from "next/link";

interface NavItem {
  label: string;
  icon: string;
  link: string;
}

export function NavigationBar() {
  const navItems: NavItem[] = [
    { label: "Shop", icon: "🛍️", link: "/shop" },
    { label: "Notification", icon: "🔔", link: "/notifications" },
    { label: "New Product", icon: "➕", link: "/new-product" },
    { label: "Fan Club", icon: "🌟", link: "/fan-club" }, //prob will get taken out in MVP
    { label: "Settings", icon: "⚙️", link: "/settings" },
  ];

  return (
    <nav className="bg-white border-gray-200 sticky bottom-0 flex w-full items-center justify-around border-t py-3 shadow-md">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.link}
          className="text-gray-600 hover:text-gray-900 flex flex-col items-center text-sm"
        >
          <span className="mb-1 text-xl">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
