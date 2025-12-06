import { toCamelCase, toKebabCase } from "../../helpers/string.mjs";

export default function registerStringHelpers() {
  Handlebars.registerHelper("lc", (str) =>
    typeof str === "string" ? str.toLowerCase() : "",
  );

  Handlebars.registerHelper("uc", (str) =>
    typeof str === "string" ? str.toUpperCase() : "",
  );

  Handlebars.registerHelper("ucFirst", (str) => {
    if (typeof str !== "string") {
      return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

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

  Handlebars.registerHelper("toCamelCase", (str) => toCamelCase(str));

  Handlebars.registerHelper("toKebabCase", (str) => toKebabCase(str));
}
