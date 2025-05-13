export function makeIcon(icon, style = 'solid') {
    return `<i class="fas fa-${style} fa-${icon}"></i>`;
}

export function toCamelCaseList(names) {
  return names.map(str =>
    str
      .toLowerCase()
      .replace(/[-\s]+(.)/g, (_, c) => c.toUpperCase())
  );
}
