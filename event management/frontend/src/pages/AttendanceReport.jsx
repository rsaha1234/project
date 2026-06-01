import React, { useEffect, useState } from "react";
import api from "../api/client";
import styles from "./AttendanceReport.module.css";
import * as XLSX from "xlsx";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const COLORS = ["#22c55e", "#ef4444"];

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
          rows.map((item) => [
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

  const filteredStudents = allData.filter((row) => {
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

  const present = filteredStudents.filter(
    (s) => s.attendance_status
  ).length;

  const absent = total - present;

  const percentage =
    total > 0
      ? ((present / total) * 100).toFixed(1)
      : 0;

  const pieData = [
    {
      name: "Present",
      value: present,
    },
    {
      name: "Absent",
      value: absent,
    },
  ];

 const eventAnalytics = events.map((event) => {
  const eventStudents = allData.filter(
    (row) => String(row.event_id) === String(event.id)
  );

  const totalStudents = eventStudents.length;

  const presentStudents =
    eventStudents.filter(
      (row) => row.attendance_status
    ).length;

  const attendanceRate =
    totalStudents > 0
      ? Math.round(
          (presentStudents / totalStudents) * 100
        )
      : 0;

  return {
    event: event.title,
    rate: attendanceRate,
  };
});

const exportToExcel = () => {
  const exportData = filteredStudents.map(
    (student) => ({
      Name: student.name,
      Roll_No: student.roll_number,
      Department: student.department,
      Status: student.attendance_status
        ? "Present"
        : "Absent",
      Event: student.event_title,
    })
  );

  const worksheet =
    XLSX.utils.json_to_sheet(exportData);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Attendance Report"
  );

  XLSX.writeFile(
    workbook,
    "Attendance_Report.xlsx"
  );
};
 
  return (
    <div className={styles.attendancePage}>
      <div className={styles.headerCard}>
        <h1>📊 Attendance Report</h1>
        <p>
          Monitor attendance performance,
          participation and reports
        </p>
      </div>

      <div className={styles.filters}>

  <select
    value={selectedEvent}
    onChange={(e) =>
      setSelectedEvent(e.target.value)
    }
  >
    {events.map((event) => (
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
    placeholder="Search Student..."
    value={search}
    onChange={(e) =>
      setSearch(e.target.value)
    }
  />

  <button
    className={styles.exportBtn}
    onClick={exportToExcel}
  >
    📥 Export Excel
  </button>

</div>
          
          <h2>
  {
    events.find(
      e => String(e.id) === String(selectedEvent)
    )?.title
  }
</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h4>Total Students</h4>
          <h2>{total}</h2>
        </div>

        <div
          className={`${styles.statCard} ${styles.green}`}
        >
          <h4>Present</h4>
          <h2>{present}</h2>
        </div>

        <div
          className={`${styles.statCard} ${styles.red}`}
        >
          <h4>Absent</h4>
          <h2>{absent}</h2>
        </div>

        <div
          className={`${styles.statCard} ${styles.yellow}`}
        >
          <h4>Attendance %</h4>
          <h2>{percentage}%</h2>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.chartCard}>
          <h3>Attendance Overview</h3>

          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <PieChart>
              <Pie
                data={pieData}
                label
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3>Attendance Trend</h3>

          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <LineChart data={eventAnalytics}>
              <XAxis dataKey="event" />
              <YAxis />
              <Tooltip />
              <Line
  type="monotone"
  dataKey="rate"
  stroke="#2563eb"
  strokeWidth={4}
/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.tableCard}>
        <h3>Attendance Details</h3>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll No</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map(
              (student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>

                  <td>
                    {student.roll_number}
                  </td>

                  <td>
                    {student.department}
                  </td>

                  <td>
                    {student.attendance_status ? (
                      <span
                        className={
                          styles.present
                        }
                      >
                        Present
                      </span>
                    ) : (
                      <span
                        className={
                          styles.absent
                        }
                      >
                        Absent
                      </span>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}