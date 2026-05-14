import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://talentflow-hr-website-1jga.onrender.com";

const STATUS_OPTIONS = [
  "In Process",
  "Screen Rejected",
  "Rejected In Interview",
  "Offer Declined",
  "Offer Accepted",
  "Joined",
  "No available for interview",
  "Dint process as position closed",
  "Duplicate Submission",
];

const FUNCTION_OPTIONS = [
  "Presales",
  "Sales",
  "Legal",
  "Finance & Accounts",
  "Audit",
  "Administration",
  "Execution",
  "QA/QC",
  "MEP",
  "Planning",
  "QS Department",
  "Sales & Marketing",
  "Store Execution",
  "Interiors & Finishing",
  "Projects",
  "CRM",
  "IT",
  "HSE",
  "Operations",
  "Marketing",
  "Design",
  "Purchase",
];

const SUBMITTED_BY_OPTIONS = [
  "Sira",
  "R2R",
  "Talent Corner",
  "TA Manira",
  "Adecco",
  "Talent Infinity",
  "Formore Talent",
  "On Time FS",
  "Cernobia",
  "TA Praveen",
];

const TIME_FILTERS = [
  "All Time",
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
  "90 Days",
  "This Year",
  "Custom Range",
];

export default function SubmissionData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubmittedBy, setSelectedSubmittedBy] = useState("All");
  const [selectedFunction, setSelectedFunction] = useState("All");
  const [selectedTime, setSelectedTime] = useState("All Time");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [search, setSearch] = useState("");

  const cleanText = (value) => String(value || "").trim();

  const normalizeStatus = (value) => {
    const text = cleanText(value).toLowerCase();

    const matched = STATUS_OPTIONS.find(
      (status) => status.toLowerCase() === text
    );

    return matched || cleanText(value);
  };

  const normalizeFunction = (value) => {
    const text = cleanText(value).toLowerCase();

    const matched = FUNCTION_OPTIONS.find(
      (fn) => fn.toLowerCase() === text
    );

    return matched || cleanText(value);
  };

  const normalizeSubmittedBy = (value) => {
    const text = cleanText(value).toLowerCase();

    const matched = SUBMITTED_BY_OPTIONS.find(
      (name) => name.toLowerCase() === text
    );

    return matched || cleanText(value);
  };

  const parseDate = (value) => {
    if (!value) return null;

    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;

    const text = String(value).trim();

    if (text.includes("-")) {
      const parts = text.split("-");
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        const date = new Date(`${yyyy}-${mm}-${dd}`);
        if (!Number.isNaN(date.getTime())) return date;
      }
    }

    if (text.includes("/")) {
      const parts = text.split("/");
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        const date = new Date(`${yyyy}-${mm}-${dd}`);
        if (!Number.isNaN(date.getTime())) return date;
      }
    }

    return null;
  };

  const getSubmittedBy = (item) =>
    normalizeSubmittedBy(
      item["Submitted By"] ||
        item["Submitted by"] ||
        item["submitted by"] ||
        item["TA"] ||
        item["Recruiter"]
    );

  const getFunction = (item) =>
    normalizeFunction(
      item["Functions"] || item["Function"] || item["Department"]
    );

  const getStatus = (item) =>
    normalizeStatus(item["Status"] || item["status"]);

  const getDate = (item) =>
    parseDate(
      item["Date of Submission"] ||
        item["Submission Date"] ||
        item["Submitted Date"] ||
        item["Date"]
    );

  const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const isInsideTimeFilter = (item) => {
    if (selectedTime === "All Time") return true;

    const rowDate = getDate(item);
    if (!rowDate) return false;

    const today = new Date();
    let from = null;
    let to = null;

    if (selectedTime === "Today") {
      from = startOfDay(today);
      to = endOfDay(today);
    }

    if (selectedTime === "Yesterday") {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      from = startOfDay(y);
      to = endOfDay(y);
    }

    if (selectedTime === "This Week") {
      const d = new Date(today);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      from = startOfDay(new Date(d.setDate(diff)));
      to = endOfDay(today);
    }

    if (selectedTime === "This Month") {
      from = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
      to = endOfDay(today);
    }

    if (selectedTime === "90 Days") {
      from = startOfDay(today);
      from.setDate(from.getDate() - 90);
      to = endOfDay(today);
    }

    if (selectedTime === "This Year") {
      from = startOfDay(new Date(today.getFullYear(), 0, 1));
      to = endOfDay(today);
    }

    if (selectedTime === "Custom Range") {
      if (!customFrom || !customTo) return true;
      from = startOfDay(new Date(customFrom));
      to = endOfDay(new Date(customTo));
    }

    return rowDate >= from && rowDate <= to;
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/sheets/reports`);
      const result = await res.json();

      setRows(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.log("SUBMISSION DATA ERROR:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submittedByOptions = useMemo(() => {
    const sheetValues = rows.map(getSubmittedBy).filter(Boolean);

    return [
      "All",
      ...Array.from(new Set([...SUBMITTED_BY_OPTIONS, ...sheetValues])).sort(),
    ];
  }, [rows]);

  const functionOptions = useMemo(() => {
    const sheetValues = rows.map(getFunction).filter(Boolean);

    return [
      "All",
      ...Array.from(new Set([...FUNCTION_OPTIONS, ...sheetValues])).sort(),
    ];
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const submittedBy = getSubmittedBy(item);
      const fn = getFunction(item);

      const submittedByMatch =
        selectedSubmittedBy === "All" || submittedBy === selectedSubmittedBy;

      const functionMatch =
        selectedFunction === "All" || fn === selectedFunction;

      const searchMatch = JSON.stringify(item)
        .toLowerCase()
        .includes(search.toLowerCase());

      return (
        submittedByMatch &&
        functionMatch &&
        isInsideTimeFilter(item) &&
        searchMatch
      );
    });
  }, [
    rows,
    selectedSubmittedBy,
    selectedFunction,
    selectedTime,
    customFrom,
    customTo,
    search,
  ]);

  const statusCountMap = useMemo(() => {
    const map = {};

    STATUS_OPTIONS.forEach((status) => {
      map[status] = 0;
    });

    filteredRows.forEach((item) => {
      const status = getStatus(item) || "Unknown";
      map[status] = (map[status] || 0) + 1;
    });

    return map;
  }, [filteredRows]);

  const statusCards = useMemo(() => {
    const fixedCards = STATUS_OPTIONS.map((status) => [
      status,
      statusCountMap[status] || 0,
    ]);

    const extraCards = Object.entries(statusCountMap).filter(
      ([status]) => !STATUS_OPTIONS.includes(status)
    );

    return [...fixedCards, ...extraCards];
  }, [statusCountMap]);

  const reportRows = useMemo(() => {
    const map = {};

    filteredRows.forEach((item) => {
      const submittedBy = getSubmittedBy(item) || "Unknown";
      const fn = getFunction(item) || "Unknown";
      const status = getStatus(item) || "Unknown";

      const key = `${submittedBy}__${fn}__${status}`;

      if (!map[key]) {
        map[key] = {
          submittedBy,
          functionName: fn,
          status,
          count: 0,
        };
      }

      map[key].count += 1;
    });

    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filteredRows]);

  return (
    <>
      <h1 className="page-title">NB Submission Data</h1>

      <p className="page-subtitle">
        NB submission dashboard with Submitted By, Function, Timeline and Status
        report.
      </p>

      <div style={styles.filterBar}>
        <select
          style={styles.select}
          value={selectedSubmittedBy}
          onChange={(e) => setSelectedSubmittedBy(e.target.value)}
        >
          {submittedByOptions.map((name) => (
            <option key={name} value={name}>
              {name === "All" ? "All Submitted By" : name}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={selectedFunction}
          onChange={(e) => setSelectedFunction(e.target.value)}
        >
          {functionOptions.map((fn) => (
            <option key={fn} value={fn}>
              {fn === "All" ? "All Functions" : fn}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        >
          {TIME_FILTERS.map((filter) => (
            <option key={filter} value={filter}>
              {filter}
            </option>
          ))}
        </select>

        {selectedTime === "Custom Range" && (
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

        <input
          style={styles.search}
          placeholder="Search submission data..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button style={styles.refreshBtn} onClick={loadData}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading submission data...</p>
      ) : (
        <>
          <div className="cards-grid">
            <StatCard
              label="Total Submissions"
              value={filteredRows.length}
              change="From selected filters"
              colorClass="c1"
            />

            {statusCards.map(([status, count], index) => (
              <StatCard
                key={status}
                label={status}
                value={count}
                change="Status count"
                colorClass={`c${(index % 8) + 1}`}
              />
            ))}
          </div>

          <div style={styles.reportCard}>
            <h3 style={styles.reportTitle}>NB Submission Status Report</h3>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Submitted By</th>
                    <th style={styles.th}>Function</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Count</th>
                  </tr>
                </thead>

                <tbody>
                  {reportRows.map((row, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{row.submittedBy}</td>
                      <td style={styles.td}>{row.functionName}</td>
                      <td style={styles.td}>{row.status}</td>
                      <td style={styles.td}>{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!reportRows.length && (
                <p style={styles.emptyText}>No report data found.</p>
              )}
            </div>
          </div>

          <div style={styles.reportCard}>
            <h3 style={styles.reportTitle}>NB Submission Data Details</h3>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Sl No.</th>
                    <th style={styles.th}>Submitted By</th>
                    <th style={styles.th}>Date of Submission</th>
                    <th style={styles.th}>Function</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((row, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{row["Sl No."] || index + 1}</td>
                      <td style={styles.td}>{getSubmittedBy(row) || "-"}</td>
                      <td style={styles.td}>
                        {row["Date of Submission"] ||
                          row["Submission Date"] ||
                          row["Submitted Date"] ||
                          row["Date"] ||
                          "-"}
                      </td>
                      <td style={styles.td}>{getFunction(row) || "-"}</td>
                      <td style={styles.td}>{getStatus(row) || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!filteredRows.length && (
                <p style={styles.emptyText}>No submission data found.</p>
              )}
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
    boxShadow: "0 4px 16px rgba(34,197,94,0.08)",
    border: "1px solid #bbf7d0",
  },

  select: {
    height: "42px",
    minWidth: "190px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid #bbf7d0",
    background: "#f9fafb",
    color: "#111827",
    fontSize: "14px",
    fontWeight: "700",
    outline: "none",
  },

  input: {
    height: "42px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid #bbf7d0",
    background: "#f9fafb",
    color: "#111827",
    fontSize: "14px",
    fontWeight: "700",
    outline: "none",
  },

  search: {
    height: "42px",
    minWidth: "240px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid #bbf7d0",
    background: "#f9fafb",
    color: "#111827",
    fontSize: "14px",
    fontWeight: "700",
    outline: "none",
  },

  refreshBtn: {
    height: "42px",
    padding: "0 20px",
    border: "none",
    borderRadius: "12px",
    background: "#16a34a",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
  },

  reportCard: {
    marginTop: "26px",
    background: "#ffffff",
    borderRadius: "22px",
    padding: "20px",
    border: "1px solid #bbf7d0",
    boxShadow: "0 4px 18px rgba(34,197,94,0.10)",
  },

  reportTitle: {
    margin: "0 0 16px",
    fontSize: "20px",
    fontWeight: "900",
    color: "#14532d",
  },

  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "850px",
  },

  th: {
    background: "#dcfce7",
    color: "#14532d",
    padding: "13px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "900",
    borderBottom: "1px solid #bbf7d0",
  },

  td: {
    padding: "12px 13px",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
    fontSize: "14px",
    fontWeight: "600",
  },

  emptyText: {
    marginTop: "16px",
    color: "#6b7280",
    fontWeight: "700",
  },
};