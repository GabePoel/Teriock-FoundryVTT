import { pureUuid, safeUuid } from "../../helpers/utils.mjs";

export default function registerUuidHelpers() {
  Handlebars.registerHelper("fromUuid", async (str) => await fromUuid(str));

  Handlebars.registerHelper("safeUuid", (str) => safeUuid(str));

  Handlebars.registerHelper("pureUuid", (str) => pureUuid(str));
}
