import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";

const RAW_API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://talentflow-hr-website-1jga.onrender.com";

const API_BASE = RAW_API_BASE
  .replace(/\/$/, "")
  .replace(/\/api\/sheets$/i, "")
  .replace(/\/api$/i, "");

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

const SUBMITTED_BY_OPTIONS = [
  "Sira",
  "R2R",
  "Talent Corner",
  "TA Maniram",
  "Adecco",
  "Talent Infinity",
  "Formore Talent",
  "On Time FS",
  "Cernobia",
  "TA Praveen",
  "TA New",
  "Internal",
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
  "HR",
  "Payroll",
];

export default function SubmissionData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [selectedSubmittedBy, setSelectedSubmittedBy] = useState("All");
  const [selectedFunction, setSelectedFunction] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");

  const cleanText = (value) => String(value || "").trim();

  const normalizeText = (value) =>
    cleanText(value).toLowerCase().replace(/\s+/g, " ");

  const getValueByPossibleKeys = (item, keys) => {
    for (const key of keys) {
      const matchedKey = Object.keys(item || {}).find(
        (k) => normalizeText(k) === normalizeText(key)
      );

      if (matchedKey) return item[matchedKey];
    }

    return "";
  };

  const getSubmittedBy = (item) =>
    cleanText(
      getValueByPossibleKeys(item, [
        "Submitted By",
        "SubmittedBy",
        "Vendor",
        "Source",
        "Consultant",
        "TA",
        "Recruiter",
      ])
    );

  const getFunction = (item) =>
    cleanText(
      getValueByPossibleKeys(item, [
        "Function",
        "Functions",
        "Department",
        "Dept",
      ])
    );

  const normalizeStatus = (value) => {
    const text = normalizeText(value);

    if (!text) return "";
    if (text.includes("in process")) return "In Process";
    if (text.includes("screen") && text.includes("reject"))
      return "Screen Rejected";
    if (text.includes("interview") && text.includes("reject"))
      return "Rejected In Interview";
    if (text.includes("offer") && text.includes("declin"))
      return "Offer Declined";
    if (text.includes("offer") && text.includes("accept"))
      return "Offer Accepted";
    if (text.includes("joined")) return "Joined";
    if (text.includes("not available") || text.includes("no available"))
      return "No available for interview";
    if (text.includes("position closed") || text.includes("dint process"))
      return "Dint process as position closed";
    if (text.includes("duplicate")) return "Duplicate Submission";

    return cleanText(value);
  };

  const parseDate = (value) => {
    if (!value) return null;

    const directDate = new Date(value);
    if (!Number.isNaN(directDate.getTime())) return directDate;

    const text = String(value).trim();

    if (text.includes("/")) {
      const [dd, mm, yyyy] = text.split("/");
      const parsed = new Date(`${yyyy}-${mm}-${dd}`);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    return null;
  };

  const formatDateKey = (date) => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getStatus = (item) =>
    normalizeStatus(
      getValueByPossibleKeys(item, [
        "Status",
        "Candidate Status",
        "Submission Status",
      ])
    );

  const getDateValue = (item) =>
    getValueByPossibleKeys(item, [
      "Date of Submission",
      "Submission Date",
      "Submitted Date",
      "Date",
    ]);

  const getDate = (item) => parseDate(getDateValue(item));

  const loadData = async () => {
    try {
      setLoading(true);
      setApiError("");

      const res = await fetch(`${API_BASE}/api/sheets/reports`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const text = await res.text();

      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid JSON response (${res.status})`);
      }

      if (!res.ok || result.success === false) {
        throw new Error(
          result.error ||
            result.message ||
            `Backend request failed (${res.status})`
        );
      }

      const data = Array.isArray(result.data) ? result.data : [];

      const validRows = data.filter((item) =>
        Object.values(item || {}).some((value) => cleanText(value))
      );

      setRows(validRows);
    } catch (error) {
      console.error("SUBMISSION DATA ERROR:", error);
      setApiError(error.message || "Unable to load submission data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const itemDate = getDate(item);
      const itemDateKey = formatDateKey(itemDate);

      const dateMatch = !selectedDate || itemDateKey === selectedDate;

      const submittedByMatch =
        selectedSubmittedBy === "All" ||
        normalizeText(getSubmittedBy(item)) ===
          normalizeText(selectedSubmittedBy);

      const functionMatch =
        selectedFunction === "All" ||
        normalizeText(getFunction(item)) === normalizeText(selectedFunction);

      return dateMatch && submittedByMatch && functionMatch;
    });
  }, [rows, selectedDate, selectedSubmittedBy, selectedFunction]);

  const statusCounts = useMemo(() => {
    const counts = {};

    STATUS_OPTIONS.forEach((status) => {
      counts[status] = 0;
    });

    filteredRows.forEach((item) => {
      const status = getStatus(item);

      if (counts[status] !== undefined) {
        counts[status] += 1;
      }
    });

    return counts;
  }, [filteredRows]);

  const clearFilters = () => {
    setSelectedSubmittedBy("All");
    setSelectedFunction("All");
    setSelectedDate("");
  };

  return (
    <>
      <h1 className="page-title">NB Submission Data</h1>

      <p className="page-subtitle">
        Submission dashboard with status summary.
      </p>

      {apiError && (
        <div style={styles.errorBox}>
          <strong>Backend Error:</strong> {apiError}
        </div>
      )}

      <div style={styles.filterBar}>
        <input
          style={styles.input}
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <select
          style={styles.select}
          value={selectedSubmittedBy}
          onChange={(e) => setSelectedSubmittedBy(e.target.value)}
        >
          <option value="All">All Submitted By</option>
          {SUBMITTED_BY_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          style={styles.select}
          value={selectedFunction}
          onChange={(e) => setSelectedFunction(e.target.value)}
        >
          <option value="All">All Functions</option>
          {FUNCTION_OPTIONS.map((fn) => (
            <option key={fn} value={fn}>
              {fn}
            </option>
          ))}
        </select>

        <button style={styles.refreshBtn} onClick={loadData}>
          Refresh
        </button>

        <button style={styles.clearBtn} onClick={clearFilters}>
          Clear
        </button>
      </div>

      {loading ? (
        <p>Loading submission data...</p>
      ) : (
        <div className="cards-grid">
          <StatCard
            label="Total Submissions"
            value={filteredRows.length}
            change="Filtered submissions"
            colorClass="c1"
          />

          {STATUS_OPTIONS.map((status, index) => (
            <StatCard
              key={status}
              label={status}
              value={statusCounts[status] || 0}
              change="Status count"
              colorClass={`c${(index % 8) + 2}`}
            />
          ))}
        </div>
      )}
    </>
  );
}

const styles = {
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "14px 16px",
    borderRadius: "14px",
    margin: "18px 0",
    fontWeight: "700",
  },

  filterBar: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    margin: "18px 0 24px",
    padding: "14px",
    background: "#ffffff",
    borderRadius: "18px",
    border: "1px solid #bbf7d0",
  },

  select: {
    height: "42px",
    minWidth: "220px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid #bbf7d0",
    background: "#f9fafb",
    fontWeight: "700",
  },

  input: {
    height: "42px",
    minWidth: "180px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid #bbf7d0",
    background: "#f9fafb",
    fontWeight: "700",
  },

  refreshBtn: {
    height: "42px",
    padding: "0 20px",
    border: "none",
    borderRadius: "12px",
    background: "#16a34a",
    color: "#ffffff",
    fontWeight: "800",
    cursor: "pointer",
  },

  clearBtn: {
    height: "42px",
    padding: "0 20px",
    border: "1px solid #16a34a",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#14532d",
    fontWeight: "800",
    cursor: "pointer",
  },
};