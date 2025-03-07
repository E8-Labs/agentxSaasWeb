"use client"; // Ensure this runs on the client side
import { useSearchParams, useRouter } from "next/navigation"; // Use correct hook
import { useEffect, useState } from "react";
import SelectedUserDetails from "@/components/admin/users/SelectedUserDetails";
import AdminGetProfileDetails from "@/components/admin/AdminGetProfileDetails";

export default function Page() {
  const searchParams = useSearchParams(); // Get search params from the URL
  const router = useRouter(); // For navigation
  const userId = searchParams.get("userId"); // Extract userId from the URL

  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (userId) {
      console.log('userID', userId)
      fetchUserDetails(userId);
    }
  }, [userId]);

  const fetchUserDetails = async (userId) => {
    try {
      const data = await AdminGetProfileDetails(userId);
      if (data) {
        setSelectedUser(data);
        console.log("Fetched user data:", data);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      {selectedUser ? (
        <SelectedUserDetails
          open={true} // Always open in fullscreen
          close={() => {
            router.push("/admin"); // Redirect back to admin on close
          }}
          selectedUser={selectedUser&&selectedUser}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
