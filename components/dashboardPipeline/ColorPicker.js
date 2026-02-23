import React, { forwardRef, useEffect, useState } from 'react'

const ColorPicker = forwardRef(
  (
    {
      setStageColor,
      setStageColor2,
      stageColor,
      onlyShowColorBox,
      updateOnchange,
      handleUpdateColor,
    },
    ref,
  ) => {
    const [color, setColor] = useState('') // Default color
    const [showColorBox, setShowColorBox] = useState(true)

    const handleColorChange = (e) => {
      // //console.log;
      setColor(e.target.value)
      setStageColor(e.target.value)
      if (setStageColor2) {
        setStageColor2(e.target.value)
      }
      // //console.log;

      // setTimeout(() => {
      //    // //console.log;
      //     if (updateOnchange) {
      //         handleUpdateColor();
      //     }
      // }, 1000);

      // setShowColorBox(false);
      // if (updateOnchange) {
      //     handleUpdateColor();
      // }
    }

    useEffect(() => {
      if (stageColor) {
        setColor(stageColor)
      } else {
        setColor('#000000')
      }
    }, [])

    return (
      <div>
        {onlyShowColorBox ? (
          <div>
            <input
              ref={ref} //id="color-picker-input"
              type="color"
              value={color}
              onChange={handleColorChange}
              className="outline-none focus:ring-0"
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
        ) : (
          <div
            className="h-[40px] rounded-lg px-2 overflow-hidden border border-[#00000020] focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-colors"
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '',
              borderRadius: 8,
            }}
          >
            <input
              type="color"
              value={color}
              onChange={handleColorChange}
              className="outline-none focus:ring-0"
              style={{
                marginRight: '10px',
                padding: 0,
                border: '1px solid white',
                background: 'none',
                height: 24,
                width: 24,
                borderRadius: '50%',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                overflow: 'hidden',
              }}
            />
            <input
              type="text"
              value={color}
              onChange={handleColorChange}
              className="outline-none focus:ring-0"
              style={{
                width: '100px',
                textTransform: 'uppercase',
                border: 'none',
                fontSize: 14,
              }}
            />
          </div>
        )}
      </div>
    )
  },
)

ColorPicker.displayName = 'ColorPicker'
export default ColorPicker

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
