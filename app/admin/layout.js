// app/layout.js
import localFont from 'next/font/local'
import Script from 'next/script'

// import "./globals.css";
import GhlOauthWatcher from '@/components/dashboard/oAuthWatcher/GhlOauthWatcher'
import AgencyDialerProvider from '@/components/common/AgencyDialerProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: 'Inter' }}
      >
        <div>
          <GhlOauthWatcher />
        </div>
        {children}

        {/* Step 2 – Signup tracking helper */}
        <Script id="agentx-signup-helper" strategy="afterInteractive">
          {`
            window.agentxTrackSignup = function(email, firstName, lastName) {
              const trySignup = () => {
                if (window.affiliateManager && typeof window.affiliateManager.signup === "function") {
                  affiliateManager.signup(email, { firstname: firstName || '', lastname: lastName || '' });
                } else if (window.affiliateManager && typeof window.affiliateManager.signUp === "function") {
                  affiliateManager.signUp(email, { firstname: firstName || '', lastname: lastName || '' });
                } else {
                  console.warn("[AgentX Tracking] Signup method not found on affiliateManager");
                }
              };

              if (document.readyState === "complete") {
                trySignup();
              } else {
                window.addEventListener("load", trySignup);
              }
            };

          `}
        </Script>
        <AgencyDialerProvider />
      </body>
    </html>
  )
}
