import React, { useEffect, useState } from 'react';
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";

const GoogleAddressPicker = () => {
    const {
        placesService,
        placePredictions,
        getPlacePredictions,
        isPlacePredictionsLoading,
    } = usePlacesService({
        apiKey: process.env.NEXT_PUBLIC_AddressPickerApiKey,
    });

    const [addressValue, setAddressValue] = useState(""); // Holds the input field value
    const [selectedPlace, setSelectedPlace] = useState(null); // Holds the selected place details
    const [showDropdown, setShowDropdown] = useState(false); // Controls dropdown visibility

    const handleSelectAddress = (placeId, description) => {
        // Set the input field to the selected place's description
        setAddressValue(description);
        setShowDropdown(false); // Hide dropdown on selection

        // Fetch place details if required
        if (placesService) {
            placesService.getDetails(
                { placeId },
                (details) => {
                    setSelectedPlace(details);
                    console.log("Selected Place Details:", details);
                }
            );
        }
    };

    const renderItem = (item) => {
        return (
            <div
                key={item.place_id}
                className="prediction-item"
                onClick={() => handleSelectAddress(item.place_id, item.description)}
                style={{
                    cursor: "pointer",
                    padding: "8px",
                    borderBottom: "1px solid #ddd",
                }}
            >
                {item.description}
            </div>
        );
    };

    return (
        <div>
            <div>
                <input
                    className='w-full'
                    placeholder="Enter location"
                    value={addressValue}
                    onChange={(evt) => {
                        setAddressValue(evt.target.value); // Update input field value
                        getPlacePredictions({ input: evt.target.value });
                        setShowDropdown(true); // Show dropdown on input
                    }}
                />
                {isPlacePredictionsLoading && <p>Loading...</p>}
                {showDropdown && placePredictions.map((item) => renderItem(item))}
            </div>
        </div>
    );
};

export default GoogleAddressPicker;
