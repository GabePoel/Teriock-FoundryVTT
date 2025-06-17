export function _migrateData(data) {
  if (typeof data.weight === 'string' && data.weight.includes('lb')) {
    data.weight = parseFloat(data.weight.replace('lb', '').trim());
  }
  return data;
}