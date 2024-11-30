import React, { useState } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

const AddressPicker = () => {

    let addressKey = process.env.NEXT_PUBLIC_AddressPickerApiKey;

    const [address, setAddress] = useState(null);

    return (
        <div>
            <GooglePlacesAutocomplete
                apiKey={addressKey}
                selectProps={{
                    address,
                    onChange: setAddress,
                }}
            />
            {address && <p>Selected Address: {address.label}</p>}
        </div>
    );
};

export default AddressPicker;
