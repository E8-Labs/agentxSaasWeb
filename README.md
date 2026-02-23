This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Agentation (Design Feedback Tool)

Agentation is a visual feedback toolbar that allows designers and developers to annotate UI elements directly in the browser during development. Annotations are saved to `AGENTATION_NOTES.md` and can be processed by an LLM to make the requested changes.

### Enabling Agentation

Agentation only works in development mode and requires an environment variable to be set:

1. Set `NEXT_PUBLIC_DESIGN_FRIENDLY_DEBUG=true` in your `.env.local` file
2. Run the development server: `npm run dev`
3. Look for the Agentation toolbar (floating button in the bottom-right corner)

### Using Agentation with Claude Code

Two skills are available for working with Agentation:

#### `/agentation` - Setup Skill
Use this skill to set up Agentation in a new Next.js project. It will:
- Check if the package is installed
- Detect your framework (App Router or Pages Router)
- Add the component to your layout

#### `/process-agentation` - Process Feedback Skill
Use this skill to process UI feedback from annotations. The workflow:
1. Make annotations in the browser using the Agentation toolbar
2. Run `/process-agentation` in Claude Code
3. Claude will read the annotations from `AGENTATION_NOTES.md`
4. Review and approve the suggested changes
5. Annotations are cleared after processing

Modals and popups are configured to allow focus to leave so you can type in the annotation field while a modal is open (MUI `disableEnforceFocus`, Radix `trapFocus={false}`). If a specific modal still traps focus, add a manual entry to `AGENTATION_NOTES.md` or describe the change in chat.
