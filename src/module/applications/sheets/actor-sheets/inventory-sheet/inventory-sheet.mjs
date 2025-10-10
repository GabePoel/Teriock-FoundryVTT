import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { systemPath } from "../../../../helpers/path.mjs";
import TeriockBaseActorSheet from "../base-actor-sheet/base-actor-sheet.mjs";

export default class TeriockInventorySheet extends TeriockBaseActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["inventory"],
    form: {
      submitOnChange: true,
    },
    position: {
      width: 525,
      height: 600,
    },
    window: {
      icon: `fa-solid fa-${documentOptions.equipment.icon}`,
    },
  };

  static PARTS = {
    all: {
      template: systemPath(
        "templates/document-templates/actor-templates/inventory-template/inventory-template.hbs",
      ),
    },
  };
}
