
import ProfileNav from "@/components/dashboard/Navbar/ProfileNav";


export default function DashboardLayout({ children }) {
    return (
        // <html lang="en">
        //     <body className="antialiased">
        <div className="flex flex-row w-full">
            <div className="h-screen w-2/12" style={{ borderRight: "1px solid #00000010", backgroundColor: "white" }}>
                <ProfileNav />
            </div>
            <div className="w-10/12">
                <div>
                    {/* <NoPlanPopup /> */}
                </div>
                {children}
            </div>
        </div>
        //     </body>
        // </html>
    );
}
