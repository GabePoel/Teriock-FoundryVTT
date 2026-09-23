import { preLocalizeConfig } from "../../helpers/localization.mjs";
import * as icons from "./icons/_module.mjs";
import * as thumbnails from "./thumbnails/_module.mjs";

export default {
  common: {
    loading: /** @type {Teriock.Panels.PanelParts} */ {
      icon: `${icons.manifest.ui.loading} fa-spin`,
      img: thumbnails.common.unknown,
      name: "TERIOCK.COMMON.Loading",
    },
    unknown: /** @type {Teriock.Panels.PanelParts} */ {
      icon: icons.manifest.ui.variable,
      img: thumbnails.common.unknown,
      name: "???",
    },
  },
  styles: {
    derived: "italic-display-field",
    editable: "editable-display-field",
    elderSorcery: "elder-sorcery-display-field",
    faded: "faded-display-field",
    gmNotes: "gm-notes-display-field",
    instructions: "instructions-display-field",
  },
};

preLocalizeConfig("display.panels.common", { keys: ["name"] });
