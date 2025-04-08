This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. Install nvm from [Github](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script)

1. Switch to project dir.

1. Use the project's node version:

   ```bash
   nvm install
   nvm use
   ```

1. Enable and install the project's `pnpm` version

   ```bash
   corepack enable pnpm
   pnpm setup
   pnpm install
   ```

1. Install firebase tools

   ```bash
   pnpm install -g firebase-tools@latest
   ```

1. (If necessary) Install java for firebase emulators

   ```bash
   sudo apt install openjdk-21-jre-headless
   ```

1. Create an `.env.local` file with any required vars (see `.env.example`)

1. Run the firebase emulators:

   ```bash
   pnpm run emulators
   ```

1. Run the development server:

   ```bash
   pnpm run dev
   ```

1. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

1. You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## VSCode Extensions

1. [Firebase Data Connect](https://marketplace.visualstudio.com/items?itemName=GoogleCloudTools.firebase-dataconnect-vscode)
1. [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
1. [Node Essentials](https://marketplace.visualstudio.com/items?itemName=afractal.node-essentials)
1. [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
1. [GraphQL: Syntax Highlighting](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql-syntax)

## Learn More

To learn more about Next.js and Firebase, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Data Connect](https://firebase.google.com/docs/data-connect)
