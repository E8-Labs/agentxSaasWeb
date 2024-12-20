
import ProfileNav from "@/components/dashboard/Navbar/ProfileNav";


export default function DashboardLayout({ children }) {
    return (
        // <html lang="en">
        //     <body className="antialiased">
        <div className="flex flex-row w-full">
            <div className="h-screen w-2/12" style={{ borderRight: "1px solid #00000010" }}>
                <ProfileNav />
            </div>
            <div className="w-10/12">
                {children}
            </div>
        </div>
        //     </body>
        // </html>
    );
}
