import { UseLocalHandler } from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import { IdentifierField } from "../../fields/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

export default class UseLocalDocumentsAutomation extends BaseAutomation {
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.UseLocalDocumentsAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.UseLocalDocumentsAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "useLocal";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      identifiers: new fields.SetField(
        new IdentifierField({ allowType: true }),
      ),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["identifiers"];
  }

  /** @inheritDoc */
  async getButtons() {
    return Array.from(this.identifiers).map((i) => {
      let type;
      let identifier = i;
      if (i.includes(":")) {
        const parts = i.split(":");
        type = parts[0];
        identifier = parts[1];
      }
      return UseLocalHandler.buildButton(identifier, type);
    });
  }
}
