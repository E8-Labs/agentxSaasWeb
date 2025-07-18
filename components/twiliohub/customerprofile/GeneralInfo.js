import React, { useEffect, useState } from 'react';

const GeneralInfo = ({
  legalBusinessNameP,
  profileFriendlyNameP,
  countryP,
  street1P,
  street2P,
  cityP,
  provienceP,
  postalCodeP,
  handleContinue
}) => {

  const [legalBusinessName, setLegalBusinessName] = useState("");
  const [profileFriendlyName, setProfileFriendlyName] = useState("");
  //physical business address
  const [country, setCountry] = useState("");
  const [street1, setStreet1] = useState("");
  const [street2, setStreet2] = useState("");
  const [city, setCity] = useState("");
  const [provience, setProvience] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setLegalBusinessName(legalBusinessNameP);
    setProfileFriendlyName(profileFriendlyNameP);
    setCountry(countryP);
    setStreet1(street1P);
    setStreet2(street2P);
    setCity(cityP);
    setProvience(provienceP);
    setPostalCode(postalCodeP);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!legalBusinessName) {
        setIsDisabled(true);
      } else {
        setIsDisabled(false);
      }
    }, 200);

    return () => clearTimeout(timer); // Clean up the timer on component unmount
  }, [legalBusinessName]);

  //handle continue
  const handleNext = () => {
    const generalInfo = {
      legalBusinessName: legalBusinessName,
      profileFriendlyName: profileFriendlyName,
      country: country,
      street1: street1,
      street2: street2,
      city: city,
      provience: provience,
      postalCode: postalCode
    }
    handleContinue(generalInfo);
  }

  const styles = {
    normalTxt: {
      fontWeight: "500",
      fontSize: 15
    }
  }

  return (
    <div className='h-[100%] w-full flex flex-col items-center justify-between'>
      <div className='w-8/12 h-[90%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-2 px-2'>
        <div style={{ fontWeight: "700", fontSize: 22 }}>
          General Information
        </div>
        <div
          className='mt-2'
          style={styles.normalTxt}>
          {`Complete the profile with your customer’s or subaccount information and submit for verification`}
        </div>
        <div
          className='mt-6'
          style={styles.normalTxt}>
          Legal business name*
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Legal business name'
            value={legalBusinessName}
            onChange={(e) => {
              setLegalBusinessName(e.target.value)
            }}
          />
        </div>
        <div
          className='mt-4'
          style={styles.normalTxt}>
          Profile friendly name
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Type here...'
            value={profileFriendlyName}
            onChange={(e) => {
              setProfileFriendlyName(e.target.value);
            }}
          />
        </div>
        <div
          className='mt-4'
          style={styles.normalTxt}>
          Physical business address
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Select a country'
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
            }}
          />
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Address Street 1'
            value={street1}
            onChange={(e) => {
              setStreet1(e.target.value);
            }}
          />
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Address Street 2'
            value={street2}
            onChange={(e) => {
              setStreet2(e.target.value);
            }}
          />
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Address City'
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
            }}
          />
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Address State or Province'
            value={provience}
            onChange={(e) => {
              setProvience(e.target.value);
            }}
          />
        </div>
        <div className='w-full mt-2'>
          <input
            className='border rounded-lg p-2 h-[50px] outline-none focus:outline-[purple] w-full focus:ring-0 focus:border-0'
            style={styles.normalTxt}
            placeholder='Address Postal Code'
            value={postalCode}
            onChange={(e) => {
              setPostalCode(e.target.value);
            }}
          />
        </div>
      </div>
      <div className='w-10/12 h-[10%] flex flex-row items-center justify-between'>
        <button className='outline-none border-none text-purple' style={styles.normalTxt}>
          Save&Exit
        </button>
        <button
          className={`h-[50px] w-[170px] text-center rounded-lg ${isDisabled ? "bg-[#00000040] text-black" : "bg-purple text-white"}`}
          disabled={isDisabled}
          onClick={() => {
            handleNext();
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default GeneralInfo
