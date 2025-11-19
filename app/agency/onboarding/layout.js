const baseUrl =
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
    ? "https://app.assignx.ai"
    : "https://dev.assignx.ai";

export const metadata = {
  title: "Agency Partner",
  description: "Sign up or login to your agency account.",
  openGraph: {
    title: "Agency Partner",
    description: "Sign up or login to your agency account.",
    url: `${baseUrl}/agency/onboarding`,
    images: [
      {
        url: `${baseUrl}/thumbOrbSmall.png`,
        width: 276,
        height: 276,
        alt: "Thumbnail Alt Text",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agency Partner",
    description: "Sign up or login to your agency account.",
    images: [`${baseUrl}/thumbOrb.png`],
  },
};

export default function OnboardingLayout({ children }) {
  return <>{children}</>;
}

