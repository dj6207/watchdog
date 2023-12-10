import React, {useState} from "react";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export const UsageHistory:React.FC = () => {
    // Date selector 
    // When a date is selected gets data based on certain date from back end and display data on screen

    // Get all the avaliable dates first or use calender selector???

    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
        console.log(selectedDate);
    };
    
    return (
        <div>
            <h3>History</h3>
            <DatePicker selected={selectedDate} onChange={handleDateChange} />
        </div>
    )
}