import React, { useEffect, useState } from "react";
import api from "../api/client";

export default function AttendanceReport() {

const [allData, setAllData] = useState([]);
const [events, setEvents] = useState([]);
const [selectedEvent, setSelectedEvent] = useState("");
const [search, setSearch] = useState("");

useEffect(() => {
loadReport();
}, []);

async function loadReport() {

try {

  const res = await api.get(
    "/registrations/attendance-report"
  );

  const rows = res.data || [];

  setAllData(rows);

  const uniqueEvents = [
    ...new Map(
      rows.map(item => [
        item.event_id,
        {
          id: item.event_id,
          title: item.event_title,
        },
      ])
    ).values(),
  ];

  setEvents(uniqueEvents);

  if (uniqueEvents.length > 0) {
    setSelectedEvent(uniqueEvents[0].id);
  }

} catch (err) {
  console.error(err);
}

}

const filteredStudents = allData.filter(row => {

const matchEvent =
  String(row.event_id) === String(selectedEvent);

const matchSearch =
  row.name
    ?.toLowerCase()
    .includes(search.toLowerCase()) ||
  row.roll_number
    ?.toString()
    .includes(search);

return matchEvent && matchSearch;

});

const total = filteredStudents.length;

const present =
filteredStudents.filter(
s => s.attendance_status
).length;

const absent = total - present;

const percentage =
total > 0
? ((present / total) * 100).toFixed(1)
: 0;

return (
<div style={{ padding: 20 }}>

  <h1>Attendance Report</h1>

  <div
    style={{
      display: "flex",
      gap: 20,
      marginBottom: 20,
      flexWrap: "wrap",
    }}
  >

    <select
      value={selectedEvent}
      onChange={(e) =>
        setSelectedEvent(e.target.value)
      }
    >
      {events.map(event => (
        <option
          key={event.id}
          value={event.id}
        >
          {event.title}
        </option>
      ))}
    </select>

    <input
      type="text"
      placeholder="Search student..."
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
    />

  </div>

  <div
    style={{
      display: "flex",
      gap: 20,
      marginBottom: 25,
      flexWrap: "wrap",
    }}
  >

    <div
      style={{
        padding: 20,
        borderRadius: 12,
        background: "#eef6ff",
        minWidth: 180,
      }}
    >
      <h3>Total</h3>
      <h2>{total}</h2>
    </div>

    <div
      style={{
        padding: 20,
        borderRadius: 12,
        background: "#e9f9ef",
        minWidth: 180,
      }}
    >
      <h3>Present</h3>
      <h2>{present}</h2>
    </div>

    <div
      style={{
        padding: 20,
        borderRadius: 12,
        background: "#fff0f0",
        minWidth: 180,
      }}
    >
      <h3>Absent</h3>
      <h2>{absent}</h2>
    </div>

    <div
      style={{
        padding: 20,
        borderRadius: 12,
        background: "#f5f0ff",
        minWidth: 180,
      }}
    >
      <h3>Attendance %</h3>
      <h2>{percentage}%</h2>
    </div>

  </div>

  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
    }}
  >

    <thead>
      <tr>
        <th>Name</th>
        <th>Roll No</th>
        <th>Department</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>

      {filteredStudents.map(student => (

        <tr key={student.id}>
          <td>{student.name}</td>
          <td>{student.roll_number}</td>
          <td>{student.department}</td>

          <td>
            {student.attendance_status
              ? "✅ Present"
              : "❌ Absent"}
          </td>
        </tr>

      ))}

    </tbody>

  </table>

</div>

);
}
