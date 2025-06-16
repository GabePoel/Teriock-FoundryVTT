export function migrate(data) {
  const num = Number(data.range);
  data.range = isNaN(num) ? null : num;
  return data;
}