import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
