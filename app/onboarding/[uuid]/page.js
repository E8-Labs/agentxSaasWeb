"use client";
import { saveAgencyUUID } from "@/utilities/AgencyUtility";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function Page() {
  const params = useParams();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Save agency UUID when component loads and redirect to main onboarding
  useEffect(() => {
    console.log('[Agency Onboarding] Component mounted');
    console.log('[Agency Onboarding] Params:', params);
    console.log('[Agency Onboarding] UUID from params:', params.uuid);
    
    const handleUUID = async () => {
      if (params.uuid && !isRedirecting) {
        console.log('[Agency Onboarding] Processing UUID:', params.uuid);
        
        // Save the UUID
        try {
          saveAgencyUUID(params.uuid);
          console.log('[Agency Onboarding] UUID saved successfully');
          
          // Verify it was saved
          const saved = localStorage.getItem('AgencyUUID');
          console.log('[Agency Onboarding] Verified saved UUID:', saved);
        } catch (error) {
          console.error('[Agency Onboarding] Error saving UUID:', error);
        }
        
        setIsRedirecting(true);
        
        // Add a small delay to ensure localStorage is updated
        setTimeout(() => {
          console.log('[Agency Onboarding] Redirecting to /onboarding');
          router.replace('/onboarding');
        }, 10); // Increased delay to see the page
      } else {
        console.log('[Agency Onboarding] No UUID found or already redirecting');
      }
    };

    handleUUID();
  }, [params.uuid, router, isRedirecting]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        {/* <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 text-lg">Preparing your onboarding experience...</p>
        <p className="mt-2 text-sm text-gray-500">Agency UUID: {params.uuid}</p>
        {isRedirecting && (
          <p className="mt-2 text-sm text-green-600">✓ UUID saved, redirecting...</p>
        )} */}
      </div>
    </div>
  );
}

export default Page;