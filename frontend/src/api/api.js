<<<<<<< HEAD
const res = await fetch(
    "https://talentflow-hr-website-1jga.onrender.com/api/sheets/dashboard"
);
=======
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://talentflow-hr-website-m3yb.onrender.com";
>>>>>>> aa74b0b2b9064f2ba6483c7ee37856a507e21cec

export async function getDashboardData() {
  try {
    const res = await fetch(`${API_URL}/api/sheets/dashboard`);

    if (!res.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    const data = await res.json();

    console.log("Dashboard Data:", data);

    return data;
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    return {
      success: false,
      data: [],
    };
  }
}
