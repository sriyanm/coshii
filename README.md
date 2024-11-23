This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. Install nvm from [Github](https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script)

2. Switch to project dir

3. Use the project's node version:

```bash
nvm use
```

4. Enable and install the project's `pnpm` version

```bash
corepack enable pnpm
```

5. Install firebase tools

```bash
pnpm install -g firebase-tools@latest
```

6. (If necessary) Install java for firebase emulators

```bash
sudo apt install openjdk-21-jre-headless
```

7. Create an `.env.local` file with any required vars (see `.env.example`)

8. Run the firebase emulators:

```bash
pnpm run emulators
```

9. Run the development server:

```bash
pnpm run dev
```

10. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

11. You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## VSCode Extensions

1. [Firebase Data Connect](https://marketplace.visualstudio.com/items?itemName=GoogleCloudTools.firebase-dataconnect-vscode)
2. [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
3. [Node Essentials](https://marketplace.visualstudio.com/items?itemName=afractal.node-essentials)
4. [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
5. [GraphQL: Syntax Highlighting](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql-syntax)

## Learn More

To learn more about Next.js and Firebase, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Data Connect](https://firebase.google.com/docs/data-connect)
