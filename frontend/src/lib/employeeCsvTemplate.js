const EMPLOYEE_CSV_HEADERS = [
  "empnumber",
  "name",
  "email",
  "phone",
  "dob",
  "doj",
  "department",
  "salary",
  "shifthours",
];

export function downloadEmployeeTemplate() {
  const csv = EMPLOYEE_CSV_HEADERS.join(",") + "\n";

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "employee_template.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}