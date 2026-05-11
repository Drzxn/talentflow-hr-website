import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
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

const DEFAULT_ENTITIES = ["NB Club Bellezea", "Chalukya Samrat"];
const DEFAULT_FUNCTIONS = ["HR"];

export default function HospitalityDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEntity, setSelectedEntity] = useState("All");
  const [selectedFunction, setSelectedFunction] = useState("All");
  const [timeFilter, setTimeFilter] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const toNumber = (value) => {
    const num = Number(value || 0);
    return Number.isNaN(num) ? 0 : num;
  };

  const parseDate = (value) => {
    if (!value) return null;

    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;

    if (typeof value === "string" && value.includes("-")) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        const parsed = new Date(`${yyyy}-${mm}-${dd}`);
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
    }

    return null;
  };

  const getEntity = (item) =>
    String(
      item["Entity"] ||
      item["Entities"] ||
      item["Project"] ||
      item["Property"] ||
      item["Hotel"] ||
      item["Unit"] ||
      "Unknown"
    ).trim();

  const getFunction = (item) =>
    String(item["Function"] || item["Department"] || "Unknown").trim();

  const loadHospitality = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://talentflow-hr-website-1jga.onrender.com/api/hospitality/dashboard"
      );
      const result = await res.json();
      setRows(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.log("HOSPITALITY DASHBOARD ERROR:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitality();
  }, []);

  const entities = useMemo(() => {
    const sheetEntities = rows.map(getEntity).filter(Boolean);
    return ["All", ...Array.from(new Set([...DEFAULT_ENTITIES, ...sheetEntities])).sort()];
  }, [rows]);

  const functions = useMemo(() => {
    const sheetFunctions = rows.map(getFunction).filter(Boolean);
    return ["All", ...Array.from(new Set([...DEFAULT_FUNCTIONS, ...sheetFunctions])).sort()];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const now = new Date();

    return rows.filter((item) => {
      const entity = getEntity(item);
      const fn = getFunction(item);

      const entityMatch =
        selectedEntity === "All" || entity === selectedEntity;

      const functionMatch =
        selectedFunction === "All" || fn === selectedFunction;

      const dateValue =
        item["Date"] ||
        item["Created Date"] ||
        item["CreatedAt"] ||
        item["Updated Date"] ||
        item["UpdatedAt"] ||
        item["Joining Date"] ||
        item["Target Date"];

      const rowDate = parseDate(dateValue);
      let timeMatch = true;

      if (timeFilter !== "all") {
        if (!rowDate) return false;

        const diffDays =
          (now.getTime() - rowDate.getTime()) / (1000 * 60 * 60 * 24);

        if (timeFilter === "today") {
          timeMatch =
            rowDate.getDate() === now.getDate() &&
            rowDate.getMonth() === now.getMonth() &&
            rowDate.getFullYear() === now.getFullYear();
        }

        if (timeFilter === "7days") timeMatch = diffDays <= 7;
        if (timeFilter === "30days") timeMatch = diffDays <= 30;
        if (timeFilter === "90days") timeMatch = diffDays <= 90;

        if (timeFilter === "custom") {
          const fromDate = customFrom ? new Date(customFrom) : null;
          const toDate = customTo ? new Date(customTo) : null;

          if (toDate) toDate.setHours(23, 59, 59, 999);

          if (fromDate && rowDate < fromDate) timeMatch = false;
          if (toDate && rowDate > toDate) timeMatch = false;

          if (!fromDate && !toDate) timeMatch = true;
        }
      }

      return entityMatch && functionMatch && timeMatch;
    });
  }, [rows, selectedEntity, selectedFunction, timeFilter, customFrom, customTo]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (acc, item) => {
        acc.totalPositions += toNumber(item["Total Positions"]);
        acc.joined += toNumber(item["Joined"]);
        acc.ytj += toNumber(item["Yet to join"]);
        acc.open += toNumber(item["Open Number"]);
        acc.hold += toNumber(item["On Hold"]);
        acc.vendor += toNumber(item["Closed by vendors"]);
        acc.referral += toNumber(item["Closed by Internal referral"]);
        acc.ta += toNumber(item["Closed by TA Team"]);
        return acc;
      },
      {
        totalPositions: 0,
        joined: 0,
        ytj: 0,
        open: 0,
        hold: 0,
        vendor: 0,
        referral: 0,
        ta: 0,
      }
    );
  }, [filteredRows]);

  const cards = [
    ["Total Positions", summary.totalPositions, "Hospitality sheet count", "c1"],
    ["Joined", summary.joined, "Joined candidates", "c2"],
    ["Yet to Join", summary.ytj, "Pending joining", "c3"],
    ["Open Number", summary.open, "Current openings", "c4"],
    ["On Hold", summary.hold, "Hold positions", "c5"],
    ["Closed by Vendors", summary.vendor, "Vendor closures", "c6"],
    ["Internal Referral", summary.referral, "Referral closures", "c7"],
    ["Closed by TA Team", summary.ta, "TA closures", "c8"],
  ];

  const functionSummary = useMemo(() => {
    const map = {};

    filteredRows.forEach((item) => {
      const fn = getFunction(item);
      map[fn] = (map[fn] || 0) + toNumber(item["Total Positions"]);
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [filteredRows]);

  const barData = {
    labels: functionSummary.map(([name]) => name),
    datasets: [
      {
        label: "Total Positions",
        data: functionSummary.map(([, value]) => value),
        backgroundColor: "#6c63ff",
        borderRadius: 8,
      },
    ],
  };

  const pieData = {
    labels: [
      "Joined",
      "Yet to Join",
      "Open",
      "On Hold",
      "Vendor",
      "Referral",
      "TA Team",
    ],
    datasets: [
      {
        data: [
          summary.joined,
          summary.ytj,
          summary.open,
          summary.hold,
          summary.vendor,
          summary.referral,
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
        ],
        borderWidth: 0,
        hoverOffset: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    events: [],
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    animation: { duration: 0 },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    events: [],
    cutout: "68%",
    plugins: {
      tooltip: { enabled: false },
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          padding: 12,
          font: { size: 11 },
        },
      },
    },
    animation: { duration: 0 },
  };

  return (
    <>
      <h1 className="page-title">Hospitality Dashboard</h1>

      <p className="page-subtitle">
        Live hospitality recruitment dashboard connected with Google Sheets.
      </p>

      <div style={styles.filterBar}>
        <select
          style={styles.select}
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
        >
          {entities.map((entity) => (
            <option key={entity} value={entity}>
              {entity === "All" ? "All Entities" : entity}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={selectedFunction}
          onChange={(e) => setSelectedFunction(e.target.value)}
        >
          {functions.map((fn) => (
            <option key={fn} value={fn}>
              {fn === "All" ? "All Functions" : fn}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="custom">Custom Date</option>
        </select>

        {timeFilter === "custom" && (
          <>
            <input
              style={styles.input}
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />

            <input
              style={styles.input}
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </>
        )}

        <button style={styles.refreshBtn} onClick={loadHospitality}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading hospitality sheet data...</p>
      ) : (
        <>
          <div className="cards-grid">
            {cards.map(([label, value, change, cls]) => (
              <StatCard
                key={label}
                label={label}
                value={value}
                change={change}
                colorClass={cls}
              />
            ))}
          </div>

          <div style={styles.chartsGrid}>
            <div style={styles.barChartCard}>
              <h3 style={styles.chartTitle}>
                Hospitality Positions by Function
              </h3>

              <div style={styles.barChartBox}>
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>

            <div style={styles.pieChartCard}>
              <h3 style={styles.chartTitle}>Hospitality Status Breakdown</h3>

              <div style={styles.pieChartBox}>
                <Doughnut data={pieData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

const styles = {
  filterBar: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    margin: "18px 0 24px",
    padding: "14px",
    background: "#ffffff",
    borderRadius: "18px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    border: "1px solid #ececec",
  },

  select: {
    height: "42px",
    minWidth: "190px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    color: "#111827",
    fontSize: "14px",
    fontWeight: "600",
    outline: "none",
  },

  input: {
    height: "42px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#f9fafb",
    color: "#111827",
    fontSize: "14px",
    fontWeight: "600",
    outline: "none",
  },

  refreshBtn: {
    height: "42px",
    padding: "0 18px",
    border: "none",
    borderRadius: "12px",
    background: "#17172f",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },

  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "1.35fr 0.85fr",
    gap: "22px",
    marginTop: "26px",
    alignItems: "start",
  },

  barChartCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "20px",
    height: "340px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
    border: "1px solid #ececec",
    boxSizing: "border-box",
  },

  pieChartCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "20px",
    height: "340px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
    border: "1px solid #ececec",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  chartTitle: {
    margin: "0 0 14px",
    fontSize: "18px",
    fontWeight: "700",
    color: "#17172f",
  },

  barChartBox: {
    width: "100%",
    height: "260px",
  },

  pieChartBox: {
    width: "240px",
    height: "240px",
  },
};