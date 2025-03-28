import React, { useEffect, useRef } from "react";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";

const API_KEY = process.env.NEXT_PUBLIC_AddressPickerApiKey;

const AddressPicker = ({ onPlaceSelect }) => {
  const inputRef = useRef(null);
  const places = useMapsLibrary("places");

 // //console.log;
  // Initialize Places Autocomplete
  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ["geometry", "name", "formatted_address"],
    });

    autocomplete.addListener("place_changed", () => {
      const selectedPlace = autocomplete.getPlace();
     // //console.log;
      if (selectedPlace.geometry) {
        onPlaceSelect(selectedPlace);
      }
    });
  }, [places, onPlaceSelect]);

  return (
    <div className="address-picker-container">
      <input
        ref={inputRef}
        autoFocus={true}
        placeholder="Enter an address"
        className="address-picker-input"
      />
    </div>
  );
};

// Parent component to provide the API key context
const AddressPickerWithProvider = ({ onPlaceSelect }) => {
  return (
    <APIProvider apiKey={API_KEY} libraries={["places"]}>
      <AddressPicker onPlaceSelect={onPlaceSelect} />
    </APIProvider>
  );
};

export default AddressPickerWithProvider;
