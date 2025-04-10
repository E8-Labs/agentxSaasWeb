import React, { useState } from 'react'
import NotficationsDrawer from '../notofications/NotficationsDrawer'
import moment from 'moment';
import Image from 'next/image';

function AgencyDashboard() {

    const [moreDropdown, setmoreDropdown] = useState(null)

    const subAcccounts = [
        {
            id: 1,
            name: 'ali',
            plan: 'abc',
            totalSpent: '5555',
            balance: '378',
            leads: '260',
            renewlDate: 'April 8, 2025',
            teamMembers: '21',
        }, {
            id: 2,
            name: 'ali',
            plan: 'abc',
            totalSpent: '5555',
            balance: '378',
            leads: '260',
            renewlDate: 'April 8, 2025',
            teamMembers: '21',
        }, {
            id: 3,
            name: 'ali',
            plan: 'abc',
            totalSpent: '5555',
            balance: '378',
            leads: '260',
            renewlDate: 'April 8, 2025',
            teamMembers: '21',
        }, {
            id: 4,
            name: 'ali',
            plan: 'abc',
            totalSpent: '5555',
            balance: '378',
            leads: '260',
            renewlDate: 'April 8, 2025',
            teamMembers: '21',
        }, {
            id: 5,
            name: 'ali',
            plan: 'abc',
            totalSpent: '5555',
            balance: '378',
            leads: '260',
            renewlDate: 'April 8, 2025',
            teamMembers: '21',
        }, {
            id: 6,
            name: 'ali',
            plan: 'abc',
            totalSpent: '5555',
            balance: '378',
            leads: '260',
            renewlDate: 'April 8, 2025',
            teamMembers: '21',
        }

    ]

    return (
        <div className='w-full flex flex-col items-center '>

            <div className='flex w-full flex-row items-center justify-between px-5 py-5 border-b'>

                <div style={{
                    fontSize: 22, fontWeight: '700'
                }}>
                    AgencyName
                </div>

                <div>
                    <NotficationsDrawer />
                </div>
            </div>

            <div className='w-[95%] h-[90vh] rounded-lg flex flex-col items-center  p-5 bg-white shadow-md'>

                <div
                    className="w-full h-[130px] flex flex-row items-center justify-between rounded-lg px-6"
                    style={{
                        backgroundImage: "url('/svgIcons/bg.svg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        // borderRadius:'20px'
                    }}
                >

                    <div style={{
                        fontSize: 29, fontWeight: '700', color: 'white'
                    }}>
                        Total Subaccounts: 6
                    </div>

                    <button
                        className='flex px-5 py-3 bg-white rounded-lg text-purple font-medium'
                    >
                        Create Subaccount
                    </button>


                </div>



                <div className="w-full flex flex-row justify-between mt-2 px-10 mt-10">
                    <div className="w-4/12">
                        <div style={styles.text}>Name</div>
                    </div>
                    <div className="w-1/12 ">
                        <div style={styles.text}>Plan</div>
                    </div>
                    <div className="w-1/12">
                        <div style={styles.text}>Total Spent</div>
                    </div>
                    <div className="w-1/12">
                        <div style={styles.text}>Balance</div>
                    </div>
                    <div className="w-1/12">
                        <div style={styles.text}>Leads</div>
                    </div>
                    <div className="w-1/12">
                        <div style={styles.text}>Renewal Date</div>
                    </div>
                    <div className="w-2/12">
                        <div style={styles.text}>Team Members</div>
                    </div>
                    <div className="w-1/12">
                        <div style={styles.text}>Action</div>
                    </div>
                </div>

                <div
                    className={`h-[71vh] border overflow-auto w-full`}
                    id="scrollableDiv1"
                    style={{ scrollbarWidth: "none" }}
                >
                    {subAcccounts?.length > 0 ? (
                        <div>
                            {subAcccounts.map((item) => (
                                <div
                                    key={item.id}
                                    style={{ cursor: "pointer" }}
                                    className="w-full flex flex-row justify-between items-center mt-5 px-10 hover:bg-[#402FFF05] py-2"
                                >
                                    <div
                                        className="w-4/12 flex flex-row gap-2 items-center cursor-pointer flex-shrink-0"
                                        onClick={() => {
                                            // // //console.log;
                                            // setselectedLeadsDetails(item);
                                            // setShowDetailsModal(true);
                                        }}
                                    >
                                        <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white">
                                            {item.name.slice(0, 1).toUpperCase()}
                                        </div>
                                        <div style={{ ...styles.text2, ...{ width: "80%", } }}>
                                            {item.name}
                                        </div>
                                    </div>
                                    <div className="w-1/12 ">
                                        <div style={styles.text2}>
                                            {item.plan}
                                        </div>
                                    </div>
                                    <div className="w-1/12">
                                        {/* (item.LeadModel?.phone) */}
                                        <div style={styles.text2}>
                                            ${item.totalSpent || 0}
                                        </div>
                                    </div>
                                    <div className="w-1/12">
                                        <div style={styles.text2}>
                                            {item.balance || 0} minutes
                                        </div>
                                    </div>
                                    <div className="w-1/12">
                                        <div style={styles.text2}>
                                            {item.leads}
                                        </div>
                                    </div>
                                    <div className="w-1/12">
                                        <div style={styles.text2}>
                                            {moment(item.renewlDate).format("MMMM DD,YYYY")}
                                        </div>
                                    </div>
                                    <div className="w-2/12">
                                        {item.teamMembers}
                                    </div>

                                    <div className="w-1/12 relative">
                                        <button
                                            id={`dropdown-toggle-${item.id}`}
                                            onClick={() =>
                                                setmoreDropdown(
                                                    moreDropdown === item.id ? null : item.id
                                                )
                                            }
                                        >
                                            <Image src={'/svgIcons/threeDotsIcon.svg'} height={24} width={24} alt="menu" />
                                        </button>

                                        {moreDropdown === item.id && (
                                            <div className="absolute top-8 right-0 bg-white border rounded-lg shadow-lg z-50 w-[200px]">
                                                <div
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800"
                                                    onClick={() => {
                                                        setmoreDropdown(null)
                                                    }}
                                                >
                                                    View Detail
                                                </div>
                                                <div
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800"
                                                    onClick={() => {
                                                        // Handle invite
                                                    }}
                                                >
                                                    Invite Team
                                                </div>
                                                <div
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800"
                                                    onClick={() => {
                                                        // Handle view plans
                                                    }}
                                                >
                                                    View Plans
                                                </div>
                                                <div
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800"
                                                    onClick={() => {
                                                        // Handle redirect
                                                    }}
                                                >
                                                    To the advertisement
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            className="text-center mt-4"
                            style={{ fontWeight: "bold", fontSize: 20 }}
                        >
                            No call log found
                        </div>
                    )}
                </div>

            </div>

        </div>
    )
}

export default AgencyDashboard


const styles = {
    text: {
        fontSize: 15,
        color: "#00000090",
        fontWeight: "600",
    },
    text2: {
        textAlignLast: "left",
        fontSize: 15,
        color: "#000000",
        fontWeight: "500",
        whiteSpace: "nowrap", // Prevent text from wrapping
        overflow: "hidden", // Hide overflow text
        textOverflow: "ellipsis", // Add ellipsis for overflow text
    },
}