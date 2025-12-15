// app/layout.js
import './globals.css'

import localFont from 'next/font/local'
import Script from 'next/script'

import { Toaster } from '@/components/ui/sonner'

import { ReduxProvider } from '../components/providers/redux-provider'
import DynamicTitle from '../components/common/DynamicTitle'
import { getServerBranding } from '@/lib/getServerBranding'
import {
  hexToHsl,
  getDefaultPrimaryColor,
  getDefaultSecondaryColor,
  calculateIconFilter,
} from '@/utilities/colorUtils'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

/**
 * Dynamic Metadata Generator
 * Reads branding from cookies to set page title and favicon references
 */
export async function generateMetadata() {
  const branding = await getServerBranding()

  // Create a cache-busting hash from faviconUrl to force browser refetch when branding changes
  const faviconHash = branding?.faviconUrl
    ? Buffer.from(branding.faviconUrl).toString('base64').slice(0, 8)
    : 'default'

  return {
    title: branding?.companyName || 'AssignX',
    description: 'AI Agents Platform',
    manifest: '/manifest.json',
    icons: {
      icon: `/icon?v=${faviconHash}`, // Cache-busting query param based on faviconUrl
      apple: `/apple-icon?v=${faviconHash}`, // Cache-busting query param based on faviconUrl
    },
    openGraph: {
      title: branding?.companyName
        ? `${branding.companyName} - AI Agents`
        : 'Code AI for Sales & Support',
      description:
        'Create your AI agent to operate across your sales and support team. Gets more done than coffee. Cheaper too.',
      url: 'https://app.assignx.ai/createagent',
      images: [
        {
          url: 'https://app.assignx.ai/thumbOrbSmall.png',
          width: 276,
          height: 276,
          alt: 'Thumbnail Alt Text',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: branding?.companyName
        ? `${branding.companyName} - AI Agents`
        : 'Code AI for Sales & Support - AssignX',
      description:
        'Create your AI agent to operate across your sales and support team. Gets more done than coffee. Cheaper too.',
      images: ['https://app.assignx.ai/thumbOrb.png'],
    },
  }
}

export default async function RootLayout({ children }) {
  // Fetch branding server-side to inject CSS variables before hydration
  const branding = await getServerBranding()

  // Calculate CSS variables server-side (eliminates FOUC)
  const primaryHsl = branding?.primaryColor
    ? hexToHsl(branding.primaryColor)
    : getDefaultPrimaryColor()
  const secondaryHsl = branding?.secondaryColor
    ? hexToHsl(branding.secondaryColor)
    : getDefaultSecondaryColor()
  const iconFilter = branding?.primaryColor
    ? calculateIconFilter(branding.primaryColor)
    : 'brightness(0) saturate(100%)'

  // Inline CSS for brand colors - injected before React hydrates
  const brandStyles = `
    :root {
      --brand-primary: ${primaryHsl};
      --brand-secondary: ${secondaryHsl};
      --primary: ${primaryHsl};
      --secondary: ${secondaryHsl};
      --icon-filter: ${iconFilter};
    }
  `

  return (
    <html
      lang="en"
      style={{ backgroundColor: '#ffffff', background: '#ffffff' }}
      data-branding-applied={branding ? 'server' : 'none'}
    >
      <head>
        {/* Brand colors injected server-side to prevent flash */}
        <style
          id="brand-colors"
          dangerouslySetInnerHTML={{ __html: brandStyles }}
        />
        <link rel="manifest" href="/manifest.json" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Edu+AU+VIC+WA+NT+Arrows:wght@400..700&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />

        {/* Step 1 – Visitor tracking script */}
        {/*<Script
          id="agentx-visitor-tracking"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){
            console.log("[AgentX Tracking] Injecting am.js...");
            var t=document.createElement("script");
            t.type="text/javascript";
            t.async=!0;
            t.src='https://set.myagentx.com/js/am.js';
            t.onload=t.onreadystatechange=function(){
              var s=this.readyState;
              if(!s||"complete"==s||"loaded"==s){
                try{
                  console.log("[AgentX Tracking] am.js loaded, initializing affiliateManager...");
                  affiliateManager.init(
                    'UoIYax6ZF0P9Ds6xa6mC',
                    'https://backend.leadconnectorhq.com',
                    '.myagentx.com'
                  );
                  console.log("[AgentX Tracking] affiliateManager initialized:", affiliateManager);
                }catch(e){
                  console.error("[AgentX Tracking] Initialization error:", e);
                }
              }
            };
            var e=document.getElementsByTagName("script")[0];
            e.parentNode.insertBefore(t,e);
          })();`,
          }}
        />*/}

        <Script
          id="agentx-visitor-tracking"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function() {
                var t = document.createElement("script");
                t.type = "text/javascript", t.async = !0, t.src = 'https://set.myagentx.com/js/am.js', t.onload = t.onreadystatechange = function() {
                    var t = this.readyState;
                    if (!t || "complete" == t || "loaded" == t) try {
                      affiliateManager.init('UoIYax6ZF0P9Ds6xa6mC', 'https://backend.leadconnectorhq.com', '.dev.assignx.ai')
                    } catch (t) {}
                };
                var e = document.getElementsByTagName("script")[0];
                e.parentNode.insertBefore(t, e)
            })();`,
          }}
        />

        {/* GHL OAuth Popup Handler - Must run before React to preserve popup context */}
        <Script
          id="ghl-oauth-popup-handler"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function() {
              // Run immediately when script loads
              (function checkAndClosePopup() {
                try {
                  // Check if we're in a popup window
                  var isPopup = window.opener !== null && window.opener !== window;
                  var hasOpener = typeof window.opener !== 'undefined' && window.opener !== null;
                  
                  if (!isPopup && !hasOpener) {
                    return; // Not a popup, exit early
                  }
                  
                  // Get URL parameters
                  var params = new URLSearchParams(window.location.search);
                  var ghlOauthSuccess = params.get('ghl_oauth');
                  var locationId = params.get('locationId');
                  
                  // If GHL OAuth success detected in popup, close immediately
                  if (ghlOauthSuccess === 'success') {
                    console.log('🚨 [GHL Popup Handler] GHL OAuth success detected in popup, closing immediately');
                    
                    // Send message to parent window
                    try {
                      if (window.opener && !window.opener.closed) {
                        window.opener.postMessage({
                          type: 'GHL_OAUTH_SUCCESS',
                          locationId: locationId || null
                        }, window.location.origin);
                        console.log('🚨 [GHL Popup Handler] Message sent to parent');
                      }
                    } catch (e) {
                      console.error('🚨 [GHL Popup Handler] Error sending message:', e);
                    }
                    
                    // Close popup immediately - try multiple times
                    var closeAttempts = 0;
                    var maxAttempts = 5;
                    
                    var tryClose = function() {
                      closeAttempts++;
                      try {
                        window.close();
                        console.log('🚨 [GHL Popup Handler] Popup close attempted (' + closeAttempts + ')');
                        
                        // If close doesn't work, focus parent as fallback
                        setTimeout(function() {
                          if (!window.closed && window.opener && !window.opener.closed) {
                            try {
                              window.opener.focus();
                              console.log('🚨 [GHL Popup Handler] Focused parent as fallback');
                            } catch (e) {
                              console.error('🚨 [GHL Popup Handler] Error focusing parent:', e);
                            }
                          }
                        }, 50);
                      } catch (e) {
                        console.error('🚨 [GHL Popup Handler] Error closing popup:', e);
                        try {
                          if (window.opener && !window.opener.closed) {
                            window.opener.focus();
                          }
                        } catch (e2) {
                          console.error('🚨 [GHL Popup Handler] Error focusing parent:', e2);
                        }
                      }
                    };
                    
                    // Try closing immediately
                    tryClose();
                    
                    // Try again with delays (some browsers need this)
                    if (closeAttempts < maxAttempts) {
                      setTimeout(tryClose, 100);
                    }
                    if (closeAttempts < maxAttempts) {
                      setTimeout(tryClose, 300);
                    }
                    if (closeAttempts < maxAttempts) {
                      setTimeout(tryClose, 500);
                    }
                    if (closeAttempts < maxAttempts) {
                      setTimeout(tryClose, 1000);
                    }
                  }
                } catch (e) {
                  console.error('🚨 [GHL Popup Handler] Error:', e);
                }
              })();
            })();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ 
          fontFamily: 'Inter',
          backgroundColor: '#ffffff',
          background: '#ffffff',
        }}
      >
        <ReduxProvider>
          <DynamicTitle />
          {children}
        </ReduxProvider>
        <Toaster />

        {/* Step 2 – Signup tracking helper */}
        <Script id="agentx-signup-helper" strategy="afterInteractive">
          {`
            console.log("[DEBUG] Loading agentxTrackSignup function...");
            window.agentxTrackSignup = function(email, fullName, uid) {
              console.log("[AgentX Tracking] agentxTrackSignup called with:", { email, fullName, uid });
              const trySignup = () => {
                console.log("[AgentX Tracking] trySignup function executing");
                console.log("[AgentX Tracking] window.affiliateManager exists:", !!window.affiliateManager);
                console.log("[AgentX Tracking] trackLead function exists:", !!(window.affiliateManager && typeof window.affiliateManager.trackLead === "function"));
                
                if (window.affiliateManager && typeof window.affiliateManager.trackLead === "function") {
                  console.log("[AgentX Tracking] Sending signup event...", { email, fullName, uid });
                  
                  // Split fullName into firstName and lastName
                  const nameParts = (fullName || '').trim().split(' ');
                  const firstName = nameParts[0] || '';
                  const lastName = nameParts.slice(1).join(' ') || '';
                  
                  const trackingData = { 
                    firstName: firstName,
                    lastName: lastName,
                    email: email 
                  };
                  // Note: uid should be Stripe Customer ID, not user database ID
                  // Removing until Stripe integration is available
                  // if (uid) trackingData.uid = uid;
                  
                  setTimeout(() => {
                    console.log("[AgentX Tracking] Calling trackLead with:", trackingData);
                    try {
                      const result = affiliateManager.trackLead(trackingData, function(result) {
                        console.log("[AgentX Tracking] Callback result:", result);
                      });
                      console.log("[AgentX Tracking] trackLead returned:", result);
                    } catch (e) {
                      console.error("[AgentX Tracking] Exception:", e);
                    }
                  }, 1000);
                } else {
                  console.warn("[AgentX Tracking] trackLead method not found on affiliateManager", window.affiliateManager);
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
      </body>
    </html>
  )
}
