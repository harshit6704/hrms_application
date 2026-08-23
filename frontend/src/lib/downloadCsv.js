export function downloadCsv(filename, rows, columns) {
  if (!rows || rows.length === 0) return false;

  const headers = columns.map((column) => column.label);

  const escapeCsv = (value) => {
    if (value === null || value === undefined) return "";
    const text = String(value);
    return /[",\n\r]/.test(text)
      ? `"${text.replace(/"/g, '""')}"`
      : text;
  };

  const csv = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) =>
      columns.map((column) => escapeCsv(column.value(row))).join(",")
    ),
  ].join("\r\n");

  const blob = new Blob(["\ufeff", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return true;
}
