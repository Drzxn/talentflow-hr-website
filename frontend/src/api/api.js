const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://talentflow-hr-website.onrender.com";

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
