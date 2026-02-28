import {
  toCamelCase,
  toId,
  toKebabCase,
  ucFirst,
} from "../../helpers/string.mjs";
import { roundTo } from "../../helpers/unit.mjs";

export default function registerStringHelpers() {
  Handlebars.registerHelper("lc", (str) =>
    typeof str === "string" ? str.toLowerCase() : "",
  );

  Handlebars.registerHelper("uc", (str) =>
    typeof str === "string" ? str.toUpperCase() : "",
  );

  Handlebars.registerHelper("ucFirst", ucFirst);

  Handlebars.registerHelper("length", (str) =>
    typeof str === "string" ? str.length : 0,
  );

  Handlebars.registerHelper("prefix", (str, prefix) => {
    if (str && str !== "0" && str !== "+0") {
      return prefix + " " + str;
    }
    return "";
  });

  Handlebars.registerHelper("suffix", (str, suffix) => {
    if (str && str !== "0" && str !== "+0") {
      return str + " " + suffix;
    }
    return "";
  });

  Handlebars.registerHelper("dotJoin", (...args) => {
    args.pop();
    let out = "";
    for (const arg of args) {
      if (arg && arg !== "0") {
        if (out.length > 0) {
          out += " · ";
        }
        out += arg;
      }
    }
    return out;
  });

  Handlebars.registerHelper("replace", (a, b, c) => {
    return `${a}`.replace(b, c);
  });

  Handlebars.registerHelper("roundTo", roundTo);

  Handlebars.registerHelper("concatArray", (...args) => {
    args.pop();
    let out = "";
    for (const arg of args) {
      if (Array.isArray(arg)) {
        out += arg.join("").trim();
      }
    }
    return out;
  });

  Handlebars.registerHelper("dotJoinArray", (arr) => {
    arr = foundry.utils.deepClone(arr);
    return arr.join(" · ");
  });

  Handlebars.registerHelper("str", (val) => {
    let out = "";
    if (!(val === undefined || val === null)) {
      out = String(val).trim();
    }
    return out;
  });

  Handlebars.registerHelper("ruleUuid", (namespace, pageName) => {
    const nsId = toId(namespace, { hash: false });
    const pnId = toId(pageName, { hash: false });
    return `Compendium.teriock.rules.JournalEntry.${nsId}.JournalEntryPage.${pnId}`;
  });

  Handlebars.registerHelper("escapeAttr", function (html) {
    if (html == null) {
      return "";
    }
    return new Handlebars.SafeString(
      String(html)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;"),
    );
  });

  Handlebars.registerHelper("toCamelCase", toCamelCase);

  Handlebars.registerHelper("toKebabCase", toKebabCase);
}
