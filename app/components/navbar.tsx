"use client";
import Link from "next/link";
import { IoIosSearch } from "react-icons/io";
import { MdHomeFilled } from "react-icons/md";
import { PiCoatHanger } from "react-icons/pi";
import { GoGear } from "react-icons/go";

interface NavItem {
  label: string;
  icon: JSX.Element;
  link: string;
}

export function NavigationBar() {
  const navItems: NavItem[] = [
    { label: "Shop", icon: <MdHomeFilled size={24} />, link: "/yourstore" },
    {
      label: "Search",
      icon: <IoIosSearch size={24} />,
      link: "/notifications",
    },
    {
      label: "Backrooms",
      icon: <PiCoatHanger size={24} />,
      link: "/new-product",
    },
    { label: "Settings", icon: <GoGear size={24} />, link: "/settings" },
  ];

  return (
    <nav className="sticky bottom-0 flex w-full items-center justify-around border-t border-gray-200 bg-white bg-opacity-95 py-3 shadow-md">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.link}
          className="flex flex-col items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <span className="mb-1">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
