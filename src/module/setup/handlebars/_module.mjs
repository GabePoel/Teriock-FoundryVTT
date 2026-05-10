import comparisonHelperEntries from "./comparison-helpers.mjs";
import existenceHelperEntries from "./existence-helpers.mjs";
import fieldHelperEntries from "./field-helpers.mjs";
import formattingHelperEntries from "./formatting-helpers.mjs";
import lookupHelperEntries from "./lookup-helpers.mjs";
import stringHelperEntries from "./string-helpers.mjs";
import uiHelperEntries from "./ui-helpers.mjs";

/**
 * Register all Handlebars helpers.
 */
export default function registerHandlebarsHelpers() {
  [
    ...comparisonHelperEntries,
    ...existenceHelperEntries,
    ...fieldHelperEntries,
    ...formattingHelperEntries,
    ...lookupHelperEntries,
    ...stringHelperEntries,
    ...uiHelperEntries,
  ].forEach(([name, helper]) => Handlebars.registerHelper(name, helper));
}
