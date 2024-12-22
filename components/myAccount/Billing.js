import React, { useState } from 'react';
import Image from 'next/image';

function Billing() {
    const cards = [
        { id: 1, number: '****3021' },
        { id: 2, number: '****5678' },
        { id: 3, number: '****1234' },
        { id: 4, number: '****9876' },
        { id: 5, number: '****4321' },
    ];

    const callDetails = [
        {
            id: 1, name: "360 mins", date: 'jul 19,2024',
            status: 'Paid', amount: '$290'
        },
        {
            id: 2, name: "360 mins", date: 'jul 19,2024',
            status: 'Paid', date: 'jul 19,2024', amount: '$230'
        },
        {
            id: 3, name: "360 mins", date: 'jul 19,2024',
            status: 'Paid', amount: '$290'
        },
        {
            id: 4, name: "360 mins", date: 'jul 19,2024',
            status: 'Paid', amount: '$290'
        },
        {
            id: 5, name: "360 mins", date: 'jul 19,2024',
            status: 'Paid', amount: '$290'
        },
    ];

    const [selectedCard, setSelectedCard] = useState(cards[0]);

    return (
        <div
            className="w-full flex flex-col items-start px-8 py-2 h-screen overflow-y-auto"
            style={{
                paddingBottom: '50px',
                scrollbarWidth: 'none', // For Firefox
                WebkitOverflowScrolling: 'touch',
            }}
        >
            <div className="w-full flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <div
                        style={{ fontSize: 22, fontWeight: '700', color: '#000' }}
                    >
                        Billing
                    </div>

                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: '500',
                            color: '#00000090',
                        }}
                    >
                        {'Account > Billing'}
                    </div>
                </div>

                <button className="">
                    <div
                        style={{
                            fontSize: 15,
                            fontWeight: '500',
                            color: '#7902DF',
                            textDecorationLine: 'underline',
                        }}
                    >
                        Add New Card
                    </div>
                </button>
            </div>

            <div
                className="w-full flex flex-row gap-4"
                style={{
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    display: 'flex',
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch',
                    height: '',
                    marginTop: 20,
                    // border:'2px solid red'
                    scrollbarWidth: "none", overflowY: 'hidden',
                    height: "", // Ensures the height is always fixed
                    flexShrink: 0,
                }}
            >
                {cards.map((item) => (
                    <div
                        className="flex-shrink-0 w-5/12"
                        key={item.id}
                    >
                        <button
                            className='w-full outline-none'
                            onClick={() => setSelectedCard(item)}
                        >
                            <div
                                className={`flex items-center justify-between w-full p-4 border rounded-lg `}
                                style={{
                                    backgroundColor: selectedCard.id === item.id ? "#4011FA05" : 'transparent',
                                    borderColor: selectedCard.id === item.id ? '#7902DF' : '#15151510'
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-5 h-5 rounded-full border ${selectedCard.id === item.id
                                            ? 'border-blue-500'
                                            : 'border-gray-400'
                                            } flex items-center justify-center`}
                                    >
                                        {selectedCard.id === item.id && (
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor: '#0000ff', // Inner circle color
                                                }}
                                            ></div>
                                        )}
                                    </div>

                                    {/* Card Details */}
                                    <div className="flex flex-col">
                                        <div
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: '700',
                                                color: '#000',
                                            }}
                                        >
                                            {item.number}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#909090',
                                            }}
                                        >
                                            Visa Card Edit
                                        </div>
                                    </div>
                                </div>

                                {/* Card Logo */}
                                <div>
                                    <Image
                                        src="/otherAssets/cardLogo.png"
                                        alt="Card Logo"
                                        width={32}
                                        height={32}
                                    />
                                </div>
                            </div>
                        </button>
                    </div>
                ))}
            </div>
            <button
                className='text-white bg-purple rounded-xl w-8/12 mt-8'
                style={{ height: "50px", fontSize: 16, fontWeight: '700', }}
            // onClick={handleVerifyCode}
            >
                Continue
            </button>

            <button
                className='text-black  outline-none rounded-xl w-8/12 mt-3'
                style={{ fontSize: 16, fontWeight: '700', height: "50px", textDecorationLine: 'underline' }}
            // onClick={handleVerifyCode}
            >
                Cancel AgentX
            </button>


            <div style={{ fontSize: 16, fontWeight: '700', marginTop: 40 }}>
                My Billing History
            </div>

            <div className='w-full flex flex-row justify-between mt-10 px-10'>
                <div className='w-3/12'>
                    <div style={styles.text}>Name</div>
                </div>
                <div className='w-3/12'>
                    <div style={styles.text}>Amount</div>
                </div>
                <div className='w-3/12'>
                    <div style={styles.text}>Status</div>
                </div>
                <div className='w-3/12'>
                    <div style={styles.text}>Date</div>
                </div>


            </div>
            {
                callDetails.map((item) => (
                    <div key={item.id} className='w-full flex flex-row justify-between mt-10 px-10'>
                        <div className='w-2/12 flex flex-row gap-2'>
                            <div style={styles.text2}>{item.name}</div>
                        </div>
                        <div className='w-3/12'>
                            <div style={styles.text2}>{item.amount}</div>
                        </div>
                        <div className='w-3/12 items-start'>
                            <div className='p-2 flex flex-row gap-2 items-center'
                                style={{ backgroundColor: '#01CB7610', borderRadius: 20, width: "5vw" }}>
                                <div style={{ height: 8, width: 8, borderRadius: 5, background: '#01CB76' }}></div>
                                <div style={{
                                    fontSize: 15,
                                    color: '#01CB76',
                                    fontWeight: 500,
                                }}>{item.status}</div>
                            </div>
                        </div>
                        <div className='w-3/12'>
                            <div style={styles.text2}>{item.date}</div>
                        </div>

                    </div>
                ))
            }



        </div>
    );
}

export default Billing;
const styles = {
    text: {
        fontSize: 12,
        color: '#00000090'
    },
    text2: {
        textAlignLast: 'left',
        fontSize: 15,
        color: '#000000',
        fontWeight: 500,
        whiteSpace: 'nowrap',  // Prevent text from wrapping
        overflow: 'hidden',    // Hide overflow text
        textOverflow: 'ellipsis'  // Add ellipsis for overflow text
    }
}