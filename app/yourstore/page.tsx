"use client";

import { NavigationBar } from "@/app/components/navbar";
import { Profile } from "@/app/components/profile";

export default function ProfilePage() {
  return (
    <div>
      {/* Hard Coding for now, will prob get a backend call for props */}
      <Profile
        profilePic="/tempImages/basketWeaver.jpg"
        shopName="Mike's Shop"
        username="basketweaver"
        description="Hey this is my basketweaving description! It'd be funny if this was left in prod"
        magicPagesUrl="/magic-pages"
        socialLinks={[
          {
            platform: "Facebook",
            url: "https://facebook.com",
            iconSrc: "/tempImages/icons/facebook.jpg",
          },
          {
            platform: "Twitter",
            url: "https://twitter.com",
            iconSrc: "/tempImages/icons/X.png",
          },
          {
            platform: "Instagram",
            url: "https://instagram.com",
            iconSrc: "/tempImages/icons/instagram.png",
          },
        ]}
        categories={["All", "Reposts", "Cups", "Ashtrays"]}
      />
      <NavigationBar />
    </div>
  );
}
