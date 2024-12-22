import React, { useState } from 'react'
import Image from 'next/image'

function SendFeedback() {

    const [feedbackTitle, setFeedbackTitle] = useState("");
    const [feedbackDescription, setFeedbackDescription] = useState("");

    return (
        <div className='w-full flex flex-col items-start px-8 py-2' style={{ paddingBottom: '50px', height: '100%', overflow: 'auto', scrollbarWidth: 'none' }}>

            <div style={{ fontSize: 22, fontWeight: "700", color: '#000' }}>
                Send Feedback
            </div>

            <div style={{ fontSize: 12, fontWeight: "500", color: '#00000090' }}>
                {"Account > Send Feedback"}
            </div>

            <div className='w-full flex justify-center items-cetner flex-col mt-20'>
                <div style={{ alignSelf: 'center' }} className="flex flex-col items-center w-8/12 p-2 rounded-xl border bg-white">
                    <div
                        className="sm:w-full w-full p-4"
                        style={{
                            backgroundColor: "#ffffff",

                            borderRadius: "13px",
                        }}
                    >
                        <div style={{ fontSize: 24, fontWeight: '700', color: '#000' }}>
                            {`{What's your feedback}`}
                        </div>


                        <div className='pt-5' style={styles.headingStyle}>
                            Title
                        </div>
                        <input
                            placeholder="In a few words what's this about? "
                            className='w-full rounded p-2 outline-none rounded-lg focus:ring-0'
                            style={styles.inputStyle}
                            value={feedbackTitle}
                            onChange={(e) => { setFeedbackTitle(e.target.value) }}
                        />

                        <div className='pt-5' style={styles.headingStyle}>
                            Tell us more
                        </div>
                        <textarea
                            placeholder="Describe your feedback in detail"
                            className='w-full rounded-lg p-2 outline-none focus:ring-0'
                            style={{
                                fontSize: 15,
                                fontWeight: "500",
                                marginTop: 10,
                                height: "150px",
                                resize: "none",
                                border: "1px solid #00000010",
                            }}
                            value={feedbackDescription}
                            onChange={(e) => { setFeedbackDescription(e.target.value) }}
                        />


                        <button style={{ marginTop: 20 }} className='w-full flex bg-purple p-3 rounded-lg items-center justify-center outline-none'>
                            <div style={{ fontSize: 16, fontWeight: '500', color: '#fff' }}>
                                Test AI
                            </div>
                        </button>



                        {/* Can be use full to add shadow */}
                        {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SendFeedback


const styles = {
    modalsStyle: {
        height: "auto",
        bgcolor: "transparent",
        // p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-55%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
    headingStyle: {
        fontSize: 16,
        fontWeight: "700"
    },
    inputStyle: {
        fontSize: 15,
        fontWeight: "500",
        marginTop: 10,
        border: "1px solid #00000010"
    }
}