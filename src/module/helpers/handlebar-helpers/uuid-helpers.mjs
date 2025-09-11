import { pureUuid, safeUuid } from "../utils.mjs";

export default function registerUuidHelpers() {
  Handlebars.registerHelper("fromUuid", async (str) => await foundry.utils.fromUuid(str));

  Handlebars.registerHelper("safeUuid", (str) => safeUuid(str));

  Handlebars.registerHelper("pureUuid", (str) => pureUuid(str));
}
