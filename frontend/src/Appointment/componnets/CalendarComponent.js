import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from '../css/CalendarComponent.module.css';

const CalendarComponent = ({ onDateSelect }) => {
  const handleDateChange = (date) => {
    const localDate = date.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD (local timezone)
    onDateSelect(localDate);
  };

  return (
    <div className={styles.container}>
      <Calendar onChange={handleDateChange} />
    </div>
  );
};

export default CalendarComponent;

