import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { db } from "./client/firebase";

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

/**
 * @param classes - space separated string of classes
 * @returns a single string with all classes
 */
// export const cn = (...classes: string[]) => {
//   return classes.filter(Boolean).join(" ")
// }

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Firebase utils

export async function cleanupUnusedCategoriesForShop(creatorId: string) {
  if (creatorId === "") return;
  const shopsRef = collection(db, "shops");
  const q = query(shopsRef, where("creatorId", "==", creatorId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const shopDoc = snapshot.docs[0];
  const shopData = shopDoc.data();
  const existingCategories: string[] = shopData.categories || [];

  // Get all products by this creator/shop
  const productsRef = collection(db, "products");
  const productQuery = query(productsRef, where("createdBy", "==", creatorId));
  const productSnapshot = await getDocs(productQuery);

  // Accumulate all used tag names from products
  const usedTagNames = new Set<string>();
  productSnapshot.forEach((doc) => {
    const productData = doc.data();
    const tags = productData.tags || [];
    tags.forEach((tag: string) => usedTagNames.add(tag));
  });

  // Keep only categories that are still used in any product
  const filteredCategories = existingCategories.filter(
    (category) => category === "All" || usedTagNames.has(category)
  );

  await updateDoc(shopDoc.ref, {
    categories: filteredCategories,
  });

  console.log("Cleaned up categories:", filteredCategories);
}
