import AgencyDialerProvider from "@/components/common/AgencyDialerProvider";

export default function AgencyLayout({ children }) {
    return (
        <>
            {children}
            <AgencyDialerProvider />
        </>
    )
}