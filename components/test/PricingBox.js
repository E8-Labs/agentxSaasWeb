// components/PricingBox.js

import Image from 'next/image';
import React from 'react';

const PricingBox = () => {
    const styles = {
        pricingBox: {
            position: 'relative',
            padding: '20px',
            border: '2px solid #4A4EFF',
            borderRadius: '10px',
            backgroundColor: '#f9f9ff',
            display: 'inline-block',
            width: "100%"
        },
        triangleLabel: {
            position: 'absolute',
            top: '0',
            right: '0',
            width: '0',
            height: '0',
            borderTop: '50px solid #4A4EFF', // Increased height again for more padding
            borderLeft: '50px solid transparent',
        },
        labelText: {
            position: 'absolute',
            top: '10px', // Adjusted to keep the text centered within the larger triangle
            right: '5px',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            transform: 'rotate(45deg)',
        },
        content: {
            textAlign: 'left',
            paddingTop: '10px',
        },
        originalPrice: {
            textDecoration: 'line-through',
            color: '#402FFF70',
            fontSize: 20,
            fontWeight: "700"
        },
        discountedPrice: {
            color: '#000000',
            fontWeight: 'bold',
            fontSize: 24,
            marginLeft: '5px',
        },
    };

    return (
        <div style={styles.pricingBox}>
            <div style={styles.triangleLabel}></div>
            <span style={styles.labelText}>FREE</span>
            <div className='flex flex-row items-start gap-1' style={styles.content}>
                <div className='mt-2'>
                    <div>
                        <Image src={"/assets/checkMark.png"} height={24} width={24} alt='*' />
                    </div>
                </div>
                <div>
                    <div style={{ color: "#151515", fontSize: 24, fontWeight: "700" }}>30mins | Approx 250 Calls</div>
                    <div className='flex flex-row items-center justify-between'>
                        <div style={{ color: "#15151590", fontSize: 15 }}>Perfect for getting started! Free for the first 30 mins then $45 to continue.</div>
                        <div className='flex flex-row items-center'>
                            <div style={styles.originalPrice}>$45</div>
                            <div style={styles.discountedPrice}>$0</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingBox;
