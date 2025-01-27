import { parsePhoneNumberFromString } from 'libphonenumber-js';

const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(rawNumber);
    return phoneNumber ? phoneNumber.formatInternational() : 'Invalid phone number';
};

// Example
const formattedNumber = formatPhoneNumber('+11234567890'); // Output: +1 123 456 7890
// console.log(formattedNumber);
