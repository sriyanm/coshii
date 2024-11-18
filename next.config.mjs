/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignorePatterns: [
      "dataconnect-generated/",
      "functions/lib/",
      "**/node_modules/",
    ],
  },
};

export default nextConfig;
