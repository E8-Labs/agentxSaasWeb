import Image from 'next/image'
import React, { useEffect, useState } from 'react'

const PurchaseNumberSuccess = ({ handleContinue, selectedNumber }) => {

    const [purchaseNumber, setPurchaseNumber] = useState(null);

    useEffect(() => {
       // //console.log
        const Data = localStorage.getItem("numberPurchased");
        if (Data) {
            const localData = JSON.parse(Data);
            setPurchaseNumber(localData);
           // //console.log;
        }
    }, []);

    const styles = {
        heading: {
            fontSize: 15,
            fontWeight: "500",
            color: "#00000060"
        },
        details: {
            fontSize: 16,
            fontWeight: "500"
        }
    }

    return (
        <div>
            <div style={{
                fontSize: 24,
                fontWeight: "700",
                textAlign: "center"
            }}>
                Success!
            </div>
            <div className='' style={{
                fontSize: 20,
                fontWeight: "400", textAlign: "center"
            }}>
                {`You've claimed a number!`}
            </div>
            <div className='border-2 border-green text-green p-2 rounded-lg mt-6 flex flex-row items-center gap-4'>
                <Image src={"/assets/successTick.png"} height={18} width={18} alt='*' />
                <div style={{ fontWeight: "600", fontSize: 17 }}>
                    Number purchase successful!
                </div>
            </div>

            <div className='flex flex-row justify-between items-center mt-8 w-full'>
                <div style={styles.heading}>Selected State</div>
                <div style={styles.details}>{purchaseNumber?.locality} {purchaseNumber?.region}</div>
            </div>

            <div className='flex flex-row justify-between items-center mt-12 w-full'>
                <div style={styles.heading}>Number Choosen</div>
                <div style={styles.details}>{selectedNumber.phoneNumber}</div>
            </div>

            <div className='flex flex-row justify-between items-center mt-12 w-full'>
                <div style={styles.heading}>Amount</div>
                <div style={styles.details}>$1.15/Mo</div>
            </div>

            <button
                className='w-full bg-purple rounded-xl h-[50px] mt-8'
                style={{ ...styles.heading, color: "white" }}
                onClick={() => {
                    handleContinue();
                }}
            >
                Continue
            </button>

        </div>
    )
}

export default PurchaseNumberSuccess
