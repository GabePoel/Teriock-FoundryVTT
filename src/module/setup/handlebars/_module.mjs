import comparisonHelpers from "./comparison-helpers.mjs";
import existenceHelpers from "./existence-helpers.mjs";
import fieldHelpers from "./field-helpers.mjs";
import lookupHelpers from "./lookup-helpers.mjs";
import stringHelpers from "./string-helpers.mjs";
import uiHelpers from "./ui-helpers.mjs";

/**
 * Register all Handlebars helpers.
 */
export default function registerHandlebarsHelpers() {
  for (
    const [name, helper] of Object.entries({
      ...comparisonHelpers,
      ...existenceHelpers,
      ...fieldHelpers,
      ...lookupHelpers,
      ...stringHelpers,
      ...uiHelpers,
    })
  ) {
    Handlebars.registerHelper(name, helper);
  }
}
