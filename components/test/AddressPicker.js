import React, { useState } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

const AddressPicker = () => {
    const [address, setAddress] = useState(null);

    return (
        <div>
            <GooglePlacesAutocomplete
                apiKey="YOUR_GOOGLE_MAPS_API_KEY"
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
