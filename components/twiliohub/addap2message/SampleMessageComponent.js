import React, { useState } from 'react';
import ExamplesComponent from './ExamplesComponent';

const SampleMessageComponent = ({
    title,
    subTitle,
    warning,
    value,
    setValue,
    compulsory = false,
    minRequiredLength = 20,
    maxRequiredLength = 1024,
    examples
}) => {


    const styles = {
        normalFont: {
            fontWeight: "500",
            fontSize: 15,
        },
        smallFont: {
            fontWeight: "400",
            fontSize: 13,
            color: "#00000060"
        }
    }

    return (
        <div className='flex flex-col items-center justify-between w-full'>
            <div className="w-full flex flex-row items-center justify-between">
                <div style={styles.normalFont}>
                    {title}<span className="text-red">{compulsory && "*"}</span>
                </div>
                <div>
                    <ExamplesComponent
                        examples={examples}
                    />
                </div>
            </div>
            <div className="mt-2 w-full" style={styles.smallFont}>
                {subTitle}
            </div>
            <div className="border rounded-lg w-full mt-4 p-2">
                <textarea
                    className='border-none outline-none focus:ring-0 w-full'
                    style={{ ...styles.normalFont, resize: "none" }}
                    placeholder='Enter your message here'
                    rows={5}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                    maxLength={maxRequiredLength}
                />
            </div>
            <div className="w-full">
                {
                    (value.length > 0 && value.length < minRequiredLength || value.length >= maxRequiredLength) && (
                        <div className="mt-2 w-full" style={styles.smallFont}>
                            {warning}
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default SampleMessageComponent;