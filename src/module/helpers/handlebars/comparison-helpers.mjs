export default function registerComparisonHelpers() {
  ["leq", "geq", "lt", "gt"].forEach((op) => {
    Handlebars.registerHelper(op, (a, b) => {
      if (typeof a !== "number" || typeof b !== "number") return false;
      return {
        leq: a <= b,
        geq: a >= b,
        lt: a < b,
        gt: a > b,
      }[op];
    });
  });

  Handlebars.registerHelper("includes", (list, item) => {
    if (!Array.isArray(list)) return false;
    if (typeof item === "string") item = item.toLowerCase();
    return list.some((i) => {
      if (typeof i === "string") i = i.toLowerCase();
      return i === item;
    });
  });

  Handlebars.registerHelper("has", (set, item) => {
    if (!set || typeof set !== "object") return false;
    if (typeof item === "string") item = item.toLowerCase();
    return set.has(item);
  });

  Handlebars.registerHelper("ternary", function (condition, valTrue, valFalse) {
    return condition ? valTrue : valFalse;
  });
}
