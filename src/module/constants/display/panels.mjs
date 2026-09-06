import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { icons, images } from "./_module.mjs";

export default {
  common: {
    loading: /** @type {Teriock.Panels.PanelParts} */ {
      icon: "fa-spinner fa-spin",
      img: images.common.uncertainty,
      name: "TERIOCK.COMMON.Loading",
    },
    unknown: /** @type {Teriock.Panels.PanelParts} */ {
      icon: icons.manifest.ui.variable,
      img: images.common.uncertainty,
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
