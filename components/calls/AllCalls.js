import React from 'react'
import Image from 'next/image';
import moment from 'moment';
function AllCalls({ callDetails }) {

    return (
        <div className='w-full items-start'>
            <div className='w-full flex flex-row justify-between mt-10 px-10'>
                <div className='w-2/12'>
                    <div style={styles.text}>Name</div>
                </div>
                <div className='w-2/12 '>
                    <div style={styles.text}>Email Address</div>
                </div>
                <div className='w-2/12'>
                    <div style={styles.text}>Contact Number</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Stage</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Status</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Date</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Time stamp</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>More</div>
                </div>
            </div>
            <div className='h-[67vh] overflow-auto' style={{ scrollbarWidth: "none" }}>
                {
                    callDetails.map((item) => (
                        <div key={item.id} className='w-full flex flex-row justify-between items-center mt-10 px-10'>
                            <div className='w-2/12 flex flex-row gap-2 items-center'>
                                <div className='h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white'>
                                    {item.LeadModel?.firstName.slice(0, 1).toUpperCase()}
                                </div>
                                <div style={styles.text2}>{item.LeadModel?.firstName}</div>
                            </div>
                            <div className='w-2/12 '>
                                <div style={styles.text2}>{item.LeadModel?.email}</div>
                            </div>
                            <div className='w-2/12'>
                                <div style={styles.text2}>{item.LeadModel?.phone}</div>
                            </div>
                            <div className='w-1/12'>
                                <div style={styles.text2}>{item.LeadModel?.stage ? (item.LeadModel?.stage) : "N/A"}</div>
                            </div>
                            <div className='w-1/12'>
                                <div style={styles.text2}>{item.LeadModel?.status ? (item.LeadModel?.status) : "N/A"}</div>
                            </div>
                            <div className='w-1/12'>
                                <div style={styles.text2}>{moment(item.LeadModel?.createdAt).format('MM/DD/YYYY')}</div>
                            </div>
                            <div className='w-1/12'>
                                <div style={styles.text2}>{moment(item.LeadModel?.createdAt).format('HH:mm:ss A')}</div>
                            </div>
                            <div className='w-1/12'>
                                <button>
                                    <div style={{ fontSize: 12, color: '#7902DF', textDecorationLine: 'underline' }}>
                                        Details
                                    </div>
                                </button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default AllCalls
const styles = {
    text: {
        fontSize: 15,
        color: '#00000090',
        fontWeight: "600"
    },
    text2: {
        textAlignLast: 'left',
        fontSize: 15,
        color: '#000000',
        fontWeight: "500",
        whiteSpace: 'nowrap',  // Prevent text from wrapping
        overflow: 'hidden',    // Hide overflow text
        textOverflow: 'ellipsis'  // Add ellipsis for overflow text
    }
}