export default function registerExistenceHelpers() {
  Handlebars.registerHelper("exists", (val) => {
    if (Array.isArray(val)) {
      return val.length > 0;
    }
    if (val === undefined || val === null) {
      return false;
    }
    if (typeof val === "string") {
      return !(val.trim() === "" || val === "0" || val === "+0");
    }
    if (typeof val === "number") {
      return val > 0;
    }
    return true;
  });

  Handlebars.registerHelper("repeatStr", (n, block) => {
    return new Handlebars.SafeString(block.repeat(n));
  });

  Handlebars.registerHelper("repeat", function (n, options) {
    let result = "";
    for (let i = 0; i < n; i++) {
      result += options.fn(this);
    }
    return new Handlebars.SafeString(result);
  });
}
