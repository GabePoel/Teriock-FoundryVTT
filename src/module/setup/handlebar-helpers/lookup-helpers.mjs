import { getImage } from "../../helpers/path.mjs";
import { ruleUuid } from "../../helpers/resolve.mjs";

export default function registerLookupHelpers() {
  Handlebars.registerHelper("path", function (obj, ...pathSegments) {
    const segments = pathSegments.slice(0, -1);
    const fullPath = segments.join(".");
    return foundry.utils.getProperty(obj, fullPath);
  });

  Handlebars.registerHelper("getImage", (category, key, fallback) =>
    getImage(category, key, fallback),
  );

  Handlebars.registerHelper("ruleUuid", ruleUuid);
}
