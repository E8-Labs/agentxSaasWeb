// app/layout.js
import './globals.css'

import localFont from 'next/font/local'
import Script from 'next/script'
import { headers } from 'next/headers'

import { Toaster } from '../components/ui/sonner'

import { ReduxProvider } from '../components/providers/redux-provider'
import { AgentationProvider } from '../components/providers/agentation-provider'
import { BrandingProvider } from '../components/providers/branding-provider'
import { MuiModalThemeProvider } from '../components/providers/mui-modal-theme-provider'
import { AgentationDialogProvider } from '../components/providers/agentation-dialog-provider'
import { LayoutTracker } from '../components/providers/layout-tracker'
import DynamicTitle from '../components/common/DynamicTitle'
import { getServerBranding, getBrandingForMetadata } from '../lib/getServerBranding'

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
 * Uses agency logo and custom domain for Open Graph meta tags
 */
export async function generateMetadata() {
  // Get hostname from headers to determine current domain
  const headersList = await headers()
  const hostname = headersList.get('host') || ''
  
  // First try to get branding from middleware headers/cookies (faster, already available)
  let branding = await getServerBranding()
  
  // If not found, fetch directly from API (for social media crawlers that don't have cookies)
  if (!branding && hostname) {
    branding = await getBrandingForMetadata(hostname)
  }
  
  // Determine protocol (http for localhost, https for production)
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  const protocol = isLocalhost ? 'http' : 'https'
  
  // Build base URL using current hostname
  const baseUrl = hostname ? `${protocol}://${hostname}` : 'https://app.assignx.ai'
  
  // Use agency logo if available, otherwise fall back to default
  const logoUrl = branding?.logoUrl || `${baseUrl}/thumbOrbSmall.png`
  // Ensure logo URL is absolute (Open Graph requires absolute URLs)
  const absoluteLogoUrl = logoUrl.startsWith('http') 
    ? logoUrl 
    : `${baseUrl}${logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`}`
  
  // Use larger logo for Twitter card
  const twitterLogoUrl = branding?.logoUrl || `${baseUrl}/thumbOrb.png`
  const absoluteTwitterLogoUrl = twitterLogoUrl.startsWith('http')
    ? twitterLogoUrl
    : `${baseUrl}${twitterLogoUrl.startsWith('/') ? twitterLogoUrl : `/${twitterLogoUrl}`}`

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
      url: `${baseUrl}/createagent`,
      images: [
        {
          url: absoluteLogoUrl,
          width: 276,
          height: 276,
          alt: branding?.companyName 
            ? `${branding.companyName} Logo` 
            : 'Thumbnail Alt Text',
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
      images: [absoluteTwitterLogoUrl],
    },
  }
}

export default function RootLayout({ children }) {
  // No longer async - branding is handled client-side to prevent layout re-execution
  // This ensures the layout doesn't re-render on navigation
  // Note: Server components can't log client-side, so we track via LayoutTracker client component

  return (
    <html
      lang="en"
      data-branding-applied="client"
      className="bg-white"
      suppressHydrationWarning
    >
      <head>
        {/* Brand colors will be injected client-side by BrandingProvider */}
        {/* Default colors to prevent flash */}
        <style
          id="brand-colors-default"
          dangerouslySetInnerHTML={{ __html: `
            :root {
              --brand-primary: hsl(270, 91%, 65%);
              --brand-secondary: hsl(258, 90%, 66%);
              --primary: hsl(270, 91%, 65%);
              --secondary: hsl(258, 90%, 66%);
              --icon-filter: brightness(0) saturate(100%);
            }
          ` }}
        />
        
        {/* Blocking script to apply branding immediately before React hydrates */}
        {/* This prevents the purple flash on page refresh */}
        <Script
          id="apply-branding-immediate"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Function to apply branding
                function applyBranding() {
                  try {
                  // Helper function to convert hex to HSL (space-separated format)
                  function hexToHsl(hex) {
                    if (!hex || typeof hex !== 'string') return '270 75% 50%';
                    
                    // Remove # if present
                    let cleanHex = hex.replace('#', '');
                    
                    // Convert 3-digit hex to 6-digit
                    if (cleanHex.length === 3) {
                      cleanHex = cleanHex.split('').map(function(char) {
                        return char + char;
                      }).join('');
                    }
                    
                    // Validate hex
                    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
                      return '270 75% 50%';
                    }
                    
                    // Parse RGB values
                    var r = parseInt(cleanHex.substring(0, 2), 16) / 255;
                    var g = parseInt(cleanHex.substring(2, 4), 16) / 255;
                    var b = parseInt(cleanHex.substring(4, 6), 16) / 255;
                    
                    // Find min and max
                    var max = Math.max(r, g, b);
                    var min = Math.min(r, g, b);
                    var h, s, l;
                    
                    // Calculate lightness
                    l = (max + min) / 2;
                    
                    // Calculate saturation
                    if (max === min) {
                      s = 0;
                      h = 0;
                    } else {
                      var delta = max - min;
                      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
                      
                      // Calculate hue
                      if (max === r) {
                        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
                      } else if (max === g) {
                        h = ((b - r) / delta + 2) / 6;
                      } else {
                        h = ((r - g) / delta + 4) / 6;
                      }
                    }
                    
                    // Convert to degrees and percentages
                    h = Math.round(h * 360);
                    s = Math.round(s * 100);
                    l = Math.round(l * 100);
                    
                    return h + ' ' + s + '% ' + l + '%';
                  }
                  
                  // Helper function to calculate icon filter
                  function calculateIconFilter(brandColorHex) {
                    if (!brandColorHex) {
                      return 'brightness(0) saturate(100%)';
                    }
                    
                    var hsl = hexToHsl(brandColorHex);
                    var parts = hsl.split(' ');
                    var h = parseFloat(parts[0]);
                    var s = parseFloat(parts[1].replace('%', ''));
                    var l = parseFloat(parts[2].replace('%', ''));
                    
                    var defaultPurpleHue = 270;
                    var hueDiff = h - defaultPurpleHue;
                    
                    // Normalize hue difference
                    if (hueDiff > 180) hueDiff -= 360;
                    if (hueDiff < -180) hueDiff += 360;
                    
                    var defaultPurpleLightness = 50;
                    var lightnessDiff = l - defaultPurpleLightness;
                    var brightnessAdjust = 1 + lightnessDiff / 100;
                    
                    return 'brightness(0) saturate(100%) hue-rotate(' + hueDiff + 'deg) brightness(' + brightnessAdjust + ')';
                  }
                  
                  // Get branding from cookie (set by middleware)
                  function getCookie(name) {
                    var value = '; ' + document.cookie;
                    var parts = value.split('; ' + name + '=');
                    if (parts.length === 2) {
                      return parts.pop().split(';').shift();
                    }
                    return null;
                  }
                  
                  // Try to get branding from multiple sources (in order of priority)
                  var branding = null;
                  
                  // 1. Try cookie first (set by middleware - most up-to-date)
                  var brandingCookie = getCookie('agencyBranding');
                  
                  if (brandingCookie) {
                    try {
                      // Cookie may be double-encoded, try decoding twice
                      var decoded = decodeURIComponent(brandingCookie);
                      try {
                        branding = JSON.parse(decoded);
                      } catch (e) {
                        // If first decode fails, try decoding again (double-encoded)
                        branding = JSON.parse(decodeURIComponent(decoded));
                      }
                    } catch (e) {
                      // Ignore parse errors
                    }
                  }
                  
                  // 2. Try localStorage 'agencyBranding' key
                  if (!branding) {
                    try {
                      var storedBranding = localStorage.getItem('agencyBranding');
                      if (storedBranding) {
                        branding = JSON.parse(storedBranding);
                      }
                    } catch (e) {
                      // Ignore errors
                    }
                  }
                  
                  // 3. Try User object in localStorage (check multiple possible paths)
                  if (!branding) {
                    try {
                      var userData = localStorage.getItem('User');
                      if (userData) {
                        var parsedUser = JSON.parse(userData);
                        // Check multiple possible locations in User object (no optional chaining for compatibility)
                        branding = 
                          (parsedUser && parsedUser.user && parsedUser.user.agencyBranding) ||
                          (parsedUser && parsedUser.agencyBranding) ||
                          (parsedUser && parsedUser.user && parsedUser.user.agency && parsedUser.user.agency.agencyBranding) ||
                          (parsedUser && parsedUser.agency && parsedUser.agency.agencyBranding);
                      }
                    } catch (e) {
                      // Ignore errors
                    }
                  }
                  
                  // Apply branding if found
                  if (branding && branding.primaryColor) {
                    var primaryHsl = hexToHsl(branding.primaryColor);
                    var secondaryHsl = branding.secondaryColor 
                      ? hexToHsl(branding.secondaryColor) 
                      : '258 60% 60%';
                    var iconFilter = calculateIconFilter(branding.primaryColor);
                    
                    // Set CSS variables immediately on document.documentElement
                    // These will override the default purple values from the style tag
                    var root = document.documentElement;
                    root.style.setProperty('--brand-primary', primaryHsl);
                    root.style.setProperty('--brand-secondary', secondaryHsl);
                    root.style.setProperty('--primary', primaryHsl);
                    root.style.setProperty('--secondary', secondaryHsl);
                    root.style.setProperty('--icon-filter', iconFilter);
                    
                    // Also update the default style tag to match branding (prevents any flash)
                    var defaultStyle = document.getElementById('brand-colors-default');
                    if (defaultStyle && defaultStyle.sheet) {
                      // Update via stylesheet if possible
                      try {
                        var styleSheet = defaultStyle.sheet;
                        if (styleSheet.cssRules && styleSheet.cssRules[0]) {
                          styleSheet.cssRules[0].style.setProperty('--brand-primary', primaryHsl);
                          styleSheet.cssRules[0].style.setProperty('--brand-secondary', secondaryHsl);
                          styleSheet.cssRules[0].style.setProperty('--primary', primaryHsl);
                          styleSheet.cssRules[0].style.setProperty('--secondary', secondaryHsl);
                          styleSheet.cssRules[0].style.setProperty('--icon-filter', iconFilter);
                        }
                      } catch (e) {
                        // Fallback: replace the style tag content
                        defaultStyle.innerHTML = ':root { --brand-primary: ' + primaryHsl + '; --brand-secondary: ' + secondaryHsl + '; --primary: ' + primaryHsl + '; --secondary: ' + secondaryHsl + '; --icon-filter: ' + iconFilter + '; }';
                      }
                    }
                  }
                  } catch (e) {
                    // Silently fail - default colors will be used
                  }
                }
                
                // Run immediately if document is ready, otherwise wait for it
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', applyBranding);
                } else {
                  // Document is already ready, run immediately
                  applyBranding();
                }
              })();
            `,
          }}
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
                    // Send message to parent window
                    try {
                      if (window.opener && !window.opener.closed) {
                        window.opener.postMessage({
                          type: 'GHL_OAUTH_SUCCESS',
                          locationId: locationId || null
                        }, window.location.origin);
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
                        // If close doesn't work, focus parent as fallback
                        setTimeout(function() {
                          if (!window.closed && window.opener && !window.opener.closed) {
                            try {
                              window.opener.focus();
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <AgentationDialogProvider>
        <MuiModalThemeProvider>
        <ReduxProvider>
          <BrandingProvider>
            <LayoutTracker />
            <DynamicTitle />
            {children}
          </BrandingProvider>
        </ReduxProvider>
        <Toaster />
        <AgentationProvider />
        </MuiModalThemeProvider>
        </AgentationDialogProvider>

        {/* Step 2 – Signup tracking helper */}
        <Script id="agentx-signup-helper" strategy="afterInteractive">
          {`
            window.agentxTrackSignup = function(email, fullName, uid) {
              const trySignup = () => {
                if (window.affiliateManager && typeof window.affiliateManager.trackLead === "function") {
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
                    try {
                      const result = affiliateManager.trackLead(trackingData, function(result) {
                      });
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
