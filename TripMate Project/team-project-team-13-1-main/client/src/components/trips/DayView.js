import React from "react";
import { useParams } from "react-router-dom";

const DayView = () => {
  const { tripID, date } = useParams();

  return (
    <div>
      <h2>Day View</h2>
      <p>Trip ID: {tripID}</p>
      <p>Selected Date: {date}</p>
      <p>(Display events for this day here!)</p>
    </div>
  );
};

export default DayView;
