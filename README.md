This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Publish the eSIM client

This repository contains the Next.js storefront and a framework-agnostic npm client. Consumers should install the published client rather than importing the `app/` directory:

```bash
npm login
npm run publish:private
```

The package is configured as an npm scoped private package. Customers must be granted read access from your npm organization before they can install it. See [PRIVATE_PACKAGE_GUIDE.md](PRIVATE_PACKAGE_GUIDE.md) for the partner workflow.

Example consumer usage:

```ts
import { createEsimClient } from "@goy/esim-client";

const esim = createEsimClient({
	baseUrl: "https://api.example.com",
	token: () => localStorage.getItem("token"),
});

const marketplace = await esim.get("/api/marketplace");
```

The package uses the browser/Node `fetch` API and has no Next.js dependency. Keep secrets and privileged operations on the server; do not publish private backend credentials in a browser consumer.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
