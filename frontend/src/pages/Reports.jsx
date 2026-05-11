import { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const FUNCTIONS = [
  "All Functions",
  "Execution",
  "Interiors & Finishing",
  "Sales",
  "Projects",
  "Finance & Accounts",
  "QA/QC",
  "QS Department",
  "Store Execution",
  "MEP",
  "Administration",
  "CRM",
  "Legal",
  "Planning",
  "IT",
  "Marketing",
  "Design",
  "HSE",
  "Presales",
  "Audit",
  "Sales & Marketing",
  "Operations",
  "Execution - Plant & Machinery",
  "Structural Design",
  "Purchase",
];

const DASHBOARD_FILTERS = [
  "All Dashboard",
  "Total Positions",
  "Joined",
  "Offer Accepted",
  "Yet to Join",
  "Open Number",
  "On Hold",
  "Closed by Vendors",
  "Closed by Internal referral",
  "Closed by TA Team",
];

const TIME_FILTERS = [
  "All Time",
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
  "90 Days",
  "This Year",
];

export default function Reports() {
  const [jobs, setJobs] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState("All Functions");
  const [selectedDashboard, setSelectedDashboard] =
    useState("All Dashboard");
  const [selectedTime, setSelectedTime] = useState("All Time");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [maximizedChart, setMaximizedChart] = useState(null);

  const toNumber = (value) => {
    const num = Number(value || 0);
    return Number.isNaN(num) ? 0 : num;
  };

  const parseDate = (value) => {
    if (!value) return null;

    const text = String(value).trim();

    const match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);

    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]) - 1;
      const year = Number(match[3]);
      const date = new Date(year, month, day);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const normalDate = new Date(text);
    return Number.isNaN(normalDate.getTime()) ? null : normalDate;
  };

  const isWithinTime = (createdDate, closedDate) => {
    if (selectedTime === "All Time") return true;

    const dates = [parseDate(createdDate), parseDate(closedDate)].filter(
      Boolean
    );

    if (dates.length === 0) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    return dates.some((date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));

      if (selectedTime === "Today") return diffDays === 0;
      if (selectedTime === "Yesterday") return diffDays === 1;
      if (selectedTime === "This Week") return diffDays >= 0 && diffDays <= 7;
      if (selectedTime === "This Month") return diffDays >= 0 && diffDays <= 30;
      if (selectedTime === "90 Days") return diffDays >= 0 && diffDays <= 90;
      if (selectedTime === "This Year") return diffDays >= 0 && diffDays <= 365;

      return true;
    });
  };

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);

      const res = await fetch("https://talentflow-hr-website-m3yb.onrender.com/api/sheets/dashboard");
      const result = await res.json();

      setJobs(result.data || []);
    } catch (error) {
      console.log("REPORT LOAD ERROR:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    let rows = jobs.filter((item) => item["Sl No."] !== "Total");

    if (selectedFunction !== "All Functions") {
      rows = rows.filter(
        (item) => String(item["Function"] || "").trim() === selectedFunction
      );
    }

    rows = rows.filter((item) =>
      isWithinTime(item["Created Date"], item["Closed Date"])
    );

    if (selectedDashboard !== "All Dashboard") {
      rows = rows.filter((item) => {
        if (selectedDashboard === "Total Positions") {
          return toNumber(item["Total Positions"]) > 0;
        }

        if (selectedDashboard === "Joined") {
          return toNumber(item["Joined"]) > 0;
        }

        if (selectedDashboard === "Offer Accepted") {
          return (
            String(item["Status"] || "")
              .toLowerCase()
              .includes("offer accepted") || toNumber(item["Yet to join"]) > 0
          );
        }

        if (selectedDashboard === "Yet to Join") {
          return toNumber(item["Yet to join"]) > 0;
        }

        if (selectedDashboard === "Open Number") {
          return toNumber(item["Open Number"]) > 0;
        }

        if (selectedDashboard === "On Hold") {
          return toNumber(item["On Hold"]) > 0;
        }

        if (selectedDashboard === "Closed by Vendors") {
          return toNumber(item["Closed by vendors"]) > 0;
        }

        if (selectedDashboard === "Closed by Internal referral") {
          return toNumber(item["Closed by Internal referral"]) > 0;
        }

        if (selectedDashboard === "Closed by TA Team") {
          return toNumber(item["Closed by TA Team"]) > 0;
        }

        return true;
      });
    }

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();

      rows = rows.filter((item) =>
        [
          item["Designation"],
          item["Function"],
          item["Status"],
          item["Created Date"],
          item["Closed Date"],
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    return rows;
  }, [
    jobs,
    selectedFunction,
    selectedDashboard,
    selectedTime,
    searchText,
  ]);

  const summary = useMemo(() => {
    return filteredJobs.reduce(
      (acc, item) => {
        const status = String(item["Status"] || "").trim().toLowerCase();

        acc.total += toNumber(item["Total Positions"]);
        acc.joined += toNumber(item["Joined"]);
        acc.ytj += toNumber(item["Yet to join"]);
        acc.open += toNumber(item["Open Number"]);
        acc.hold += toNumber(item["On Hold"]);
        acc.vendors += toNumber(item["Closed by vendors"]);
        acc.internal += toNumber(item["Closed by Internal referral"]);
        acc.ta += toNumber(item["Closed by TA Team"]);

        if (status.includes("offer accepted")) {
          acc.accepted += toNumber(item["Yet to join"]) || 1;
        }

        return acc;
      },
      {
        total: 0,
        joined: 0,
        accepted: 0,
        ytj: 0,
        open: 0,
        hold: 0,
        vendors: 0,
        internal: 0,
        ta: 0,
      }
    );
  }, [filteredJobs]);

  const functionSummary = useMemo(() => {
    const map = {};

    filteredJobs.forEach((item) => {
      const fn = String(item["Function"] || "Unknown").trim();
      map[fn] = (map[fn] || 0) + toNumber(item["Total Positions"]);
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [filteredJobs]);

  const statusBarData = {
    labels: [
      "Total",
      "Joined",
      "Accepted",
      "YTJ",
      "Open",
      "Hold",
      "Vendors",
      "Internal",
      "TA Team",
    ],
    datasets: [
      {
        label: "Count",
        data: [
          summary.total,
          summary.joined,
          summary.accepted,
          summary.ytj,
          summary.open,
          summary.hold,
          summary.vendors,
          summary.internal,
          summary.ta,
        ],
        backgroundColor: "#6c63ff",
        borderRadius: 6,
      },
    ],
  };

  const statusPieData = {
    labels: [
      "Joined",
      "Offer Accepted",
      "Yet to Join",
      "Open",
      "On Hold",
      "Closed by Vendors",
      "Internal Referral",
      "TA Team",
    ],
    datasets: [
      {
        data: [
          summary.joined,
          summary.accepted,
          summary.ytj,
          summary.open,
          summary.hold,
          summary.vendors,
          summary.internal,
          summary.ta,
        ],
        backgroundColor: [
          "#22c55e",
          "#f59e0b",
          "#3b82f6",
          "#f97316",
          "#8b5cf6",
          "#14b8a6",
          "#ec4899",
          "#06b6d4",
        ],
        borderWidth: 0,
      },
    ],
  };

  const functionBarData = {
    labels: functionSummary.map(([name]) => name),
    datasets: [
      {
        label: "Total Positions",
        data: functionSummary.map(([, value]) => value),
        backgroundColor: "#22c55e",
        borderRadius: 6,
      },
    ],
  };

  const exportCSV = () => {
    const rows = [
      [
        "Sl No.",
        "Designation",
        "Function",
        "Created Date",
        "Closed Date",
        "Status",
        "Total Positions",
        "Joined",
        "Yet to Join",
        "Open Number",
        "On Hold",
        "Closed by Vendors",
        "Closed by Internal referral",
        "Closed by TA Team",
      ],
      ...filteredJobs.map((r) => [
        r["Sl No."] || "",
        r["Designation"] || "",
        r["Function"] || "",
        r["Created Date"] || "",
        r["Closed Date"] || "",
        r["Status"] || "",
        r["Total Positions"] || "",
        r["Joined"] || "",
        r["Yet to join"] || "",
        r["Open Number"] || "",
        r["On Hold"] || "",
        r["Closed by vendors"] || "",
        r["Closed by Internal referral"] || "",
        r["Closed by TA Team"] || "",
      ]),
    ];

    const csv = rows
      .map((r) =>
        r.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");

    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "reports.csv";
    a.click();
  };

  const renderChart = (type, isFull = false) => {
    const chartHeight = isFull ? "70vh" : "360px";

    if (type === "bar") {
      return (
        <div style={{ height: chartHeight }}>
          <Bar
            data={statusBarData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      );
    }

    if (type === "pie") {
      return (
        <div style={{ height: chartHeight }}>
          <Doughnut
            data={statusPieData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      );
    }

    return (
      <div style={{ height: chartHeight }}>
        <Bar
          data={functionBarData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    );
  };

  return (
    <>
      <h1 className="page-title">Reports</h1>

      <p className="page-subtitle">
        Live Google Sheets recruitment data.
      </p>

      <div className="report-filters">
        <select
          className="filter-select"
          value={selectedFunction}
          onChange={(e) => setSelectedFunction(e.target.value)}
        >
          {FUNCTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedDashboard}
          onChange={(e) => setSelectedDashboard(e.target.value)}
        >
          {DASHBOARD_FILTERS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        >
          {TIME_FILTERS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          className="filter-select"
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <button
          className="export-btn"
          onClick={() => setShowDashboard(!showDashboard)}
        >
          {showDashboard ? "Hide Dashboard" : "Open Dashboard"}
        </button>

        <button className="export-btn" onClick={exportCSV}>
          Export CSV
        </button>
      </div>

      {showDashboard && (
        <div className="charts-grid" style={{ marginBottom: "24px" }}>
          <div className="chart-card">
            <div className="table-header">
              <h3>Status Bar Graph</h3>
              <button
                className="export-btn"
                onClick={() => setMaximizedChart("bar")}
              >
                Maximize
              </button>
            </div>
            {renderChart("bar")}
          </div>

          <div className="chart-card">
            <div className="table-header">
              <h3>Status Pie Chart</h3>
              <button
                className="export-btn"
                onClick={() => setMaximizedChart("pie")}
              >
                Maximize
              </button>
            </div>
            {renderChart("pie")}
          </div>

          <div className="chart-card">
            <div className="table-header">
              <h3>Function Bar Graph</h3>
              <button
                className="export-btn"
                onClick={() => setMaximizedChart("function")}
              >
                Maximize
              </button>
            </div>
            {renderChart("function")}
          </div>
        </div>
      )}

      {maximizedChart && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 9999,
            padding: "30px",
          }}
        >
          <div
            className="chart-card"
            style={{
              height: "90vh",
              width: "100%",
              overflow: "auto",
            }}
          >
            <div className="table-header">
              <h3>
                {maximizedChart === "bar" && "Status Bar Graph"}
                {maximizedChart === "pie" && "Status Pie Chart"}
                {maximizedChart === "function" && "Function Bar Graph"}
              </h3>

              <button
                className="export-btn"
                onClick={() => setMaximizedChart(null)}
              >
                Close
              </button>
            </div>

            {renderChart(maximizedChart, true)}
          </div>
        </div>
      )}

      <div className="reports-table">
        <div className="table-header">
          <h3>Recruitment Reports</h3>
          <span>{filteredJobs.length} Records</span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Sl No.</th>
                <th>Designation</th>
                <th>Function</th>
                <th>Status</th>
                <th>Total</th>
                <th>Joined</th>
                <th>YTJ</th>
                <th>Open</th>
                <th>Hold</th>
                <th>Vendors</th>
                <th>Internal</th>
                <th>TA Team</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: "center" }}>
                    Loading...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: "center" }}>
                    No data found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((r, index) => (
                  <tr key={index}>
                    <td>{r["Sl No."]}</td>
                    <td>
                      <strong>{r["Designation"]}</strong>
                    </td>
                    <td>{r["Function"]}</td>
                    <td>{r["Status"]}</td>
                    <td>{r["Total Positions"]}</td>
                    <td>{r["Joined"]}</td>
                    <td>{r["Yet to join"]}</td>
                    <td>{r["Open Number"]}</td>
                    <td>{r["On Hold"]}</td>
                    <td>{r["Closed by vendors"]}</td>
                    <td>{r["Closed by Internal referral"]}</td>
                    <td>{r["Closed by TA Team"]}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
