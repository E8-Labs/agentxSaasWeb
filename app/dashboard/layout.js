
import ProfileNav from "@/components/dashboard/Navbar/ProfileNav";


export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased">
                <div className="flex flex-row w-full">
                    <div className="w-2/12">
                        <ProfileNav />
                    </div>
                    <div className="w-10/12">
                        {children}
                    </div>
                </div>
            </body>
        </html>
    );
}
