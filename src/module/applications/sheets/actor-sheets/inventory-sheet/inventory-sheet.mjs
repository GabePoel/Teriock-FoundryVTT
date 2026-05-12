import { documentConfig } from "../../../../constants/config/document-config.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";
import BaseActorSheet from "../base-actor-sheet/base-actor-sheet.mjs";

export default class InventorySheet extends BaseActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["inventory"],
    form: { submitOnChange: true },
    position: { width: 525, height: 600 },
    window: { icon: makeIconClass(documentConfig.inventory.icon, "title") },
  };

  static PARTS = {
    all: {
      template: "teriock/sheets/actors/inventory/inventory",
      scrollable: [""],
    },
  };
}
