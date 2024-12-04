import React, { useEffect, useRef, useState } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

const AddressPicker = ({ userAddress }) => {
    const addressKey = process.env.NEXT_PUBLIC_AddressPickerApiKey;

    const bottomToAddress = useRef(null); // Ref for scrolling
    const [address, setAddress] = useState(null);

    useEffect(() => {
        userAddress(address?.label);
    }, [address]);

    const handleInputChange = (inputValue) => {
        console.log("Value of address (typing):", inputValue);

        // Scroll to bottom of dropdown
        if (bottomToAddress.current) {
            bottomToAddress.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div>
            <GooglePlacesAutocomplete
                apiKey={addressKey}
                selectProps={{
                    value: address,
                    onChange: setAddress,
                    onInputChange: handleInputChange, // Trigger scroll when typing
                }}
                style={{ borderColor: "red" }}
            />
            {/* Hidden div to scroll to */}
            <div ref={bottomToAddress} style={{ height: '1px' }}></div>
        </div>
    );
};

export default AddressPicker;
