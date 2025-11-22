import { useMapsLibrary } from '@vis.gl/react-google-maps'
import React, { useEffect, useRef, useState } from 'react'

const AddressPicker2 = ({ onAddressSelect }) => {
  const [place, setPlace] = useState(null)
  const inputRef = useRef(null)
  const places = useMapsLibrary('places')

  useEffect(() => {
    if (!places || !inputRef.current) return

    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'name', 'formatted_address'],
    })

    autocomplete.addListener('place_changed', () => {
      const selectedPlace = autocomplete.getPlace()
      setPlace(selectedPlace)
      if (selectedPlace.geometry) {
        onAddressSelect(selectedPlace)
      }
    })
  }, [places, onAddressSelect])

  return (
    <div className="address-picker-container">
      <input
        ref={inputRef}
        placeholder="Enter an address"
        className="address-picker-input"
      />
    </div>
  )
}

export default AddressPicker2
