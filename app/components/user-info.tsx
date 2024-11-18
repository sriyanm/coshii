"use client";

import { User } from "firebase/auth";

export default function UserInfo({ user }: { user: User }) {
  return (
    <ul>
      <li>
        <b>Email:</b> {user.email || "unknown"}
      </li>
      <li>
        <b>UID:</b> {user.uid || "unknown"}
      </li>
      <li>
        <b>Refresh token:</b> {user.refreshToken || "unknown"}
      </li>
    </ul>
  );
}
