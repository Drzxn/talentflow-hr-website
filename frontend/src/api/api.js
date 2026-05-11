const res = await fetch(
    "https://talentflow-hr-website-1jga.onrender.com/api/sheets/dashboard"
);

const data = await res.json();

console.log(data.data);