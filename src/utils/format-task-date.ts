// Backend devuelve `due_date` como datetime ("1999-02-03 00:00:00+00:00") o
// como fecha simple ("1999-02-03"). En la UI siempre mostramos DD/MM/AAAA.
export function formatTaskDueDate(value: string | null): string | null {
  if (!value) return null;
  const datePart = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]}`;
}
