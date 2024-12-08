import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';

const components = {
    DropdownIndicator: null, // Remove dropdown indicator
};

const createOption = (label) => ({
    label,
    value: label,
});

const TagsInput = ({ setTags }) => {
    const [inputValue, setInputValue] = useState('');
    const [value, setValue] = useState([]);

    useEffect(() => {
        console.log("tags", value);
        const updatedTagsArray = value.map(tag => tag.value);
        console.log("Updated tags array is:", updatedTagsArray);
        setTags(updatedTagsArray);
    }, [value])



    //   const handleKeyDown = (event) => {
    //     if (!inputValue) return;
    //     switch (event.key) {
    //       case 'Enter':
    //       case 'Tab':
    //         setValue((prev) => [...prev, createOption(inputValue)]);
    //         setInputValue('');
    //         event.preventDefault();
    //         break;
    //       default:
    //         break;
    //     }
    //   };

    const handleKeyDown = (event) => {
        if (!inputValue) return;
        let isDuplicate = null;
        // Prevent adding duplicates
        setTimeout(() => {
            isDuplicate = value.some((option) => option.value === inputValue);
        }, 500);
        if (isDuplicate) {
            setInputValue(''); // Clear input if duplicate
            event.preventDefault();
            return;
        }

        switch (event.key) {
            case 'Enter':
            case 'Tab':
                setValue((prev) => [...prev, createOption(inputValue)]);
                setInputValue('');
                event.preventDefault();
                break;
            default:
                break;
        }
    };

    return (
        <CreatableSelect
            components={components}
            inputValue={inputValue}
            isClearable
            isMulti
            menuIsOpen={false} // Prevent dropdown from opening
            onChange={(newValue) => setValue(newValue || [])} // Update value
            onInputChange={(newValue) => setInputValue(newValue)} // Update input text
            onKeyDown={handleKeyDown} // Handle key presses (Enter, Tab)
            placeholder="Type something and press enter..."
            value={value}
        />
    );
};

export default TagsInput;
