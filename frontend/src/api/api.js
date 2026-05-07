const res = await fetch("http://localhost:5000/api/sheets/dashboard");

const data = await res.json();

console.log(data.data);