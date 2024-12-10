
import React, { forwardRef, useEffect, useState } from 'react';

const ColorPicker = forwardRef(({ setStageColor, setStageColor2, stageColor, onlyShowColorBox, updateOnchange, handleUpdateColor }, ref) => {


    const [color, setColor] = useState(''); // Default color
    const [showColorBox, setShowColorBox] = useState(true);

    const handleColorChange = (e) => {
        setColor(e.target.value);
        setStageColor(e.target.value);
        setStageColor2(e.target.value);
        console.log("Log 1");

        setTimeout(() => {
            if (updateOnchange) {
                handleUpdateColor();
            }
            console.log("Log 2");
        }, 1000);

        // setShowColorBox(false);
        // if (updateOnchange) {
        //     handleUpdateColor();
        // }
    };

    useEffect(() => {
        if (stageColor) {
            setColor(stageColor);
        } else {
            setColor("#FF4E4E");
        }
    }, []);


    return (
        <div>
            {
                onlyShowColorBox ?
                    <div>

                        <input
                            ref={ref} //id="color-picker-input"
                            type="color"
                            value={color}
                            onChange={handleColorChange}
                            className='outline-none focus:ring-0'
                            // style={{ marginRight: '10px', padding: '0', border: 'none', background: 'none', height: "30px", width: "36px", borderRadius: "5px" }}
                            style={{
                                marginRight: '10px',
                                padding: '0',
                                border: 'none',
                                background: 'none',
                                height: '30px',
                                width: '36px',
                                borderRadius: '50px',
                                appearance: 'none', // General appearance override
                                WebkitAppearance: 'none', // For Webkit-based browsers (Chrome, Safari, etc.)
                                MozAppearance: 'none', // For Firefox
                                overflow: 'hidden', // Ensures rounded corners work correctly
                            }}
                        />
                    </div>
                    :
                    <div className='h-[50px] rounded-lg px-2' style={{ display: 'flex', alignItems: 'center', border: "1px solid #00000020", width: "" }}>
                        <input
                            type="color"
                            value={color}
                            onChange={handleColorChange}
                            className='outline-none focus:ring-0'
                            // style={{ marginRight: '10px', padding: '0', border: 'none', background: 'none', height: "30px", width: "36px", borderRadius: "5px" }}
                            style={{
                                marginRight: '10px',
                                padding: '0',
                                border: 'none',
                                background: 'none',
                                height: '30px',
                                width: '36px',
                                borderRadius: '5px',
                                appearance: 'none', // General appearance override
                                WebkitAppearance: 'none', // For Webkit-based browsers (Chrome, Safari, etc.)
                                MozAppearance: 'none', // For Firefox
                                overflow: 'hidden', // Ensures rounded corners work correctly
                            }}
                        />
                        <input
                            type="text"
                            value={color}
                            onChange={handleColorChange}
                            className='outline-none focus:ring-0'
                            style={{ width: '100px', textTransform: 'uppercase', border: "none" }}
                        />
                    </div>
            }
        </div>
    );
});

ColorPicker.displayName = 'ColorPicker';
export default ColorPicker;


// import React, { useState } from 'react';
// import { ChromePicker } from 'react-color';

// const ColorPicker = () => {
//     const [color, setColor] = useState('#FF4E4E');

//     const handleChangeComplete = (newColor) => {
//         setColor(newColor.hex);
//     };

//     return (
//         <div>
//             <ChromePicker
//                 color={color}
//                 onChangeComplete={handleChangeComplete}
//             />
//             <p>Selected Color: <span style={{ color }}>{color}</span></p>
//         </div>
//     );
// };

// export default ColorPicker;

