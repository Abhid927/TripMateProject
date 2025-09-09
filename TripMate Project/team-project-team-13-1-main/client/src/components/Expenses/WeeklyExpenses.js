import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendarStyles.css';

const localizer = momentLocalizer(moment);

const WeeklyCalendarView = ({ expenses }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const dailyTotals = expenses.reduce((acc, exp) => {
      const dateStr = new Date(exp.exp_date).toDateString();
      if (!acc[dateStr]) acc[dateStr] = 0;
      acc[dateStr] += exp.exp_amount;
      return acc;
    }, {});

    const eventsData = Object.entries(dailyTotals)
      .map(([dateStr, total]) => {
        const date = new Date(dateStr);
        if (isNaN(date)) return null;
        return {
          title: `$${total.toFixed(2)}`,
          start: date,
          end: date,
          allDay: true, // Make it allDay so it shows up at the top
        };
      })
      .filter(Boolean);

    setEvents(eventsData);
  }, [expenses]);

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: '#003366',
      color: 'white',
      borderRadius: '8px',
      padding: '5px',
      textAlign: 'center',
      fontSize: '14px',
    },
  });

  return (
    <div style={{ height: 150 }}>
      <Calendar
        localizer={localizer}
        events={events}
        defaultView="week"
        views={['week']}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventStyleGetter}
        showMultiDayTimes={false}
        popup
      />
    </div>
  );
};

export default WeeklyCalendarView;
