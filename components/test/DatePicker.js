import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default styles

const CalendarInput = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Handle date selection
    const handleDateChange = (date) => {
        setSelectedDate(date);
        console.log("Selected date:", date);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
            <h2>Select a Date</h2>
            <Calendar
                onChange={handleDateChange} // Event handler for date selection
                value={selectedDate} // The currently selected date
                locale="en-US" // Optional: Change the locale for different formats
            />
            <p style={{ marginTop: '20px' }}>
                Selected Date: <strong>{selectedDate.toDateString()}</strong>
            </p>
        </div>
    );
};

export default CalendarInput;
