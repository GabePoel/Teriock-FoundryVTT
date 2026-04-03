import registerComparisonHelpers from "./comparison-helpers.mjs";
import registerExistenceHelpers from "./existence-helpers.mjs";
import registerFieldHelpers from "./field-helpers.mjs";
import registerFormattingHelpers from "./formatting-helpers.mjs";
import registerLookupHelpers from "./lookup-helpers.mjs";
import registerStringHelpers from "./string-helpers.mjs";
import registerUiHelpers from "./ui-helpers.mjs";

export function registerHandlebarsHelpers() {
  registerComparisonHelpers();
  registerExistenceHelpers();
  registerFieldHelpers();
  registerFormattingHelpers();
  registerLookupHelpers();
  registerStringHelpers();
  registerUiHelpers();
}
