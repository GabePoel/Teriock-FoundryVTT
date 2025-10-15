import { comparisons } from "../../dice/functions/_module.mjs";

export default function registerComparisonHelpers() {
  for (const [k, v] of Object.entries(comparisons)) {
    Handlebars.registerHelper(k, v);
  }

  Handlebars.registerHelper("includes", (list, item) => {
    if (!Array.isArray(list)) {
      return false;
    }
    if (typeof item === "string") {
      item = item.toLowerCase();
    }
    return list.some((i) => {
      if (typeof i === "string") {
        i = i.toLowerCase();
      }
      return i === item;
    });
  });

  Handlebars.registerHelper("has", (set, item) => {
    if (!set || typeof set !== "object") {
      return false;
    }
    if (typeof item === "string") {
      item = item.toLowerCase();
    }
    return set.has(item);
  });

  Handlebars.registerHelper("rgx", function (referenceString, testString) {
    if (!referenceString) {
      return false;
    }
    const rgx = new RegExp(referenceString, "i");
    return !rgx.test(testString);
  });
}
