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

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://talentflow-hr-website-1jga.onrender.com";

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
  const [selectedDashboard, setSelectedDashboard] = useState("All Dashboard");
  const [selectedTime, setSelectedTime] = useState("All Time");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [maximizedChart, setMaximizedChart] = useState(null);

  const toNumber = (value) => {
    const num = Number(value || 0);
    return Number.isNaN(num) ? 0 : num;
  };

  const getValue = (item, keys) => {
    for (const key of keys) {
      if (item?.[key] !== undefined && item?.[key] !== null) {
        return item[key];
      }
    }
    return "";
  };

  const getFunction = (item) =>
    String(getValue(item, ["Function", "Department", "FUNCTION"]) || "").trim();

  const getDesignation = (item) =>
    String(getValue(item, ["Designation", "Role", "Position"]) || "").trim();

  const getStatus = (item) =>
    String(getValue(item, ["Status", "STATUS"]) || "").trim();

  const getCreatedDate = (item) =>
    getValue(item, ["Created Date", "CreatedAt", "Date", "Opening Date"]);

  const getClosedDate = (item) =>
    getValue(item, ["Closed Date", "ClosedAt", "Closing Date"]);

  const getTotalPositions = (item) =>
    toNumber(getValue(item, ["Total Positions", "Total Position", "Total"]));

  const getJoined = (item) => toNumber(getValue(item, ["Joined"]));

  const getYTJ = (item) =>
    toNumber(getValue(item, ["Yet to join", "Yet to Join", "YTJ"]));

  const getOpen = (item) =>
    toNumber(getValue(item, ["Open Number", "Open", "Openings"]));

  const getHold = (item) => toNumber(getValue(item, ["On Hold", "Hold"]));

  const getVendors = (item) =>
    toNumber(getValue(item, ["Closed by vendors", "Closed by Vendors"]));

  const getInternal = (item) =>
    toNumber(
      getValue(item, [
        "Closed by Internal referral",
        "Closed by Internal Referral",
        "Internal Referral",
      ])
    );

  const getTA = (item) =>
    toNumber(getValue(item, ["Closed by TA Team", "TA Team"]));

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

  const removeSummaryRows = (data) => {
    return data.filter((item) => {
      if (!item) return false;

      const slNo = String(getValue(item, ["Sl No.", "Sl No", "S No"]) || "")
        .trim()
        .toLowerCase();

      const designation = getDesignation(item);
      const fn = getFunction(item);
      const status = getStatus(item);

      if (slNo === "total" || slNo === "grand total") return false;

      const isOnlyTotalRow = !slNo && !designation && !fn && !status;

      if (isOnlyTotalRow) return false;

      const hasNumbers =
        getTotalPositions(item) ||
        getJoined(item) ||
        getYTJ(item) ||
        getOpen(item) ||
        getHold(item) ||
        getVendors(item) ||
        getInternal(item) ||
        getTA(item);

      return designation || fn || status || hasNumbers;
    });
  };

  const extractRows = (result) => {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.reports)) return result.reports;
    if (Array.isArray(result?.rows)) return result.rows;
    if (Array.isArray(result?.data?.reports)) return result.data.reports;
    if (Array.isArray(result?.data?.rows)) return result.data.rows;
    return [];
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

<<<<<<< HEAD
      const urls = [`${API_BASE}/api/sheets/reports`, `${API_BASE}/api/sheets/dashboard`];
=======
      const res = await fetch("https://talentflow-hr-website-m3yb.onrender.com/api/sheets/dashboard");
      const result = await res.json();
>>>>>>> aa74b0b2b9064f2ba6483c7ee37856a507e21cec

      let finalRows = [];

      for (const url of urls) {
        const res = await fetch(url);
        const result = await res.json();

        const rows = extractRows(result);

        if (rows.length > 0) {
          finalRows = rows;
          break;
        }
      }

      const cleanRows = removeSummaryRows(finalRows);

      setJobs(cleanRows);

      if (cleanRows.length === 0) {
        setErrorMsg("No reports data found from backend API.");
      }
    } catch (error) {
      console.log("REPORT LOAD ERROR:", error);
      setJobs([]);
      setErrorMsg("Unable to load reports data. Check backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const functions = useMemo(() => {
    const list = jobs.map(getFunction).filter(Boolean);
    return ["All Functions", ...Array.from(new Set(list)).sort()];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let rows = [...jobs];

    if (selectedFunction !== "All Functions") {
      rows = rows.filter((item) => getFunction(item) === selectedFunction);
    }

    rows = rows.filter((item) =>
      isWithinTime(getCreatedDate(item), getClosedDate(item))
    );

    if (selectedDashboard !== "All Dashboard") {
      rows = rows.filter((item) => {
        if (selectedDashboard === "Total Positions")
          return getTotalPositions(item) > 0;

        if (selectedDashboard === "Joined") return getJoined(item) > 0;

        if (selectedDashboard === "Offer Accepted") {
          return (
            getStatus(item).toLowerCase().includes("offer accepted") ||
            getYTJ(item) > 0
          );
        }

        if (selectedDashboard === "Yet to Join") return getYTJ(item) > 0;
        if (selectedDashboard === "Open Number") return getOpen(item) > 0;
        if (selectedDashboard === "On Hold") return getHold(item) > 0;
        if (selectedDashboard === "Closed by Vendors")
          return getVendors(item) > 0;
        if (selectedDashboard === "Closed by Internal referral")
          return getInternal(item) > 0;
        if (selectedDashboard === "Closed by TA Team") return getTA(item) > 0;

        return true;
      });
    }

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();

      rows = rows.filter((item) =>
        [
          getDesignation(item),
          getFunction(item),
          getStatus(item),
          getCreatedDate(item),
          getClosedDate(item),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    return rows;
  }, [jobs, selectedFunction, selectedDashboard, selectedTime, searchText]);

  const summary = useMemo(() => {
    return filteredJobs.reduce(
      (acc, item) => {
        const status = getStatus(item).toLowerCase();

        acc.total += getTotalPositions(item);
        acc.joined += getJoined(item);
        acc.ytj += getYTJ(item);
        acc.open += getOpen(item);
        acc.hold += getHold(item);
        acc.vendors += getVendors(item);
        acc.internal += getInternal(item);
        acc.ta += getTA(item);

        if (status.includes("offer accepted")) {
          acc.accepted += getYTJ(item) || 1;
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
      const fn = getFunction(item) || "Unknown";
      map[fn] = (map[fn] || 0) + getTotalPositions(item);
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
        backgroundColor: "#16a34a",
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    events: [],
    plugins: {
      tooltip: { enabled: false },
      legend: { display: true },
    },
    animation: { duration: 0 },
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
        getValue(r, ["Sl No.", "Sl No", "S No"]) || "",
        getDesignation(r),
        getFunction(r),
        getCreatedDate(r) || "",
        getClosedDate(r) || "",
        getStatus(r),
        getTotalPositions(r),
        getJoined(r),
        getYTJ(r),
        getOpen(r),
        getHold(r),
        getVendors(r),
        getInternal(r),
        getTA(r),
      ]),
    ];

    const csv = rows
      .map((r) =>
        r.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");

    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "nb-reports.csv";
    a.click();
  };

  const renderChart = (type, isFull = false) => {
    const chartHeight = isFull ? "70vh" : "360px";

    if (type === "bar") {
      return (
        <div style={{ height: chartHeight }}>
          <Bar data={statusBarData} options={chartOptions} />
        </div>
      );
    }

    if (type === "pie") {
      return (
        <div style={{ height: chartHeight }}>
          <Doughnut data={statusPieData} options={chartOptions} />
        </div>
      );
    }

    return (
      <div style={{ height: chartHeight }}>
        <Bar data={functionBarData} options={chartOptions} />
      </div>
    );
  };

  return (
    <>
      <h1 className="page-title">NB Reports</h1>

      <p className="page-subtitle">
        Live Google Sheets recruitment data from NB Reports.
      </p>

      <div className="report-filters">
        <select
          className="filter-select"
          value={selectedFunction}
          onChange={(e) => setSelectedFunction(e.target.value)}
        >
          {functions.map((item) => (
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

        <button className="export-btn" onClick={loadReports}>
          Refresh
        </button>
      </div>

      {errorMsg && (
        <p style={{ color: "red", fontWeight: "700", marginBottom: "16px" }}>
          {errorMsg}
        </p>
      )}

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
          <h3>NB Recruitment Reports</h3>
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
                    <td>{getValue(r, ["Sl No.", "Sl No", "S No"])}</td>
                    <td>
                      <strong>{getDesignation(r)}</strong>
                    </td>
                    <td>{getFunction(r)}</td>
                    <td>{getStatus(r)}</td>
                    <td>{getTotalPositions(r)}</td>
                    <td>{getJoined(r)}</td>
                    <td>{getYTJ(r)}</td>
                    <td>{getOpen(r)}</td>
                    <td>{getHold(r)}</td>
                    <td>{getVendors(r)}</td>
                    <td>{getInternal(r)}</td>
                    <td>{getTA(r)}</td>
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
