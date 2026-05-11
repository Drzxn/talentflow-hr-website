const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://talentflow-hr-website.onrender.com";

const res = await fetch(`${API_URL}/api/sheets/dashboard`);

const data = await res.json();

console.log(data.data);