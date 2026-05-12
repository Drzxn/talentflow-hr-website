export function cleanValue(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

export function convertRowsToObjects(rows = []) {
  if (!rows.length) return [];

  const headers = rows[0];

  return rows.slice(1).map((row) => {
    const item = {};

    headers.forEach((header, index) => {
      item[cleanValue(header)] = cleanValue(row[index]);
    });

    return item;
  });
}