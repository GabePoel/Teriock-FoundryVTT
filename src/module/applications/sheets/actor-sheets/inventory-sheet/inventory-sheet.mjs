import { documentConfig } from "../../../../constants/config/document-config.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";
import BaseActorSheet from "../base-actor-sheet/base-actor-sheet.mjs";

export default class InventorySheet extends BaseActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["inventory"],
    form: { submitOnChange: true },
    position: { height: 600, width: 525 },
    window: { icon: makeIconClass(documentConfig.inventory.icon, "title") },
  };

  static PARTS = {
    all: {
      scrollable: [""],
      template: "teriock/sheets/actors/inventory/inventory",
    },
  };
}
