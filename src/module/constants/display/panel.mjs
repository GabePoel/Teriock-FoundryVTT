import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { systemPath } from "../../helpers/path.mjs";
import { dedent } from "../../helpers/string.mjs";
import { icons } from "./icons.mjs";

export const displayPanel = {
  classes: {
    derived: "italic-display-field",
    editable: "editable-display-field",
    elderSorcery: "elder-sorcery-display-field",
    faded: "faded-display-field",
    instructions: "instructions-display-field",
  },
  loading: dedent(`
    <div class="teriock-panel">
      <header class="teriock-panel-header">
        <div class="teriock-panel-image">
          <img src="${systemPath("icons/documents/uncertainty.svg")}" alt="">
        </div>
        <div class="teriock-panel-header-name">TERIOCK.LOADING</div>
        <div class="teriock-panel-header-icon">
          <i class="fa-fw fa-light fa-spinner fa-spin"></i>
        </div>
      </header>
    </div>`),
  premade: {
    loading: /** @type {Teriock.Panels.PanelParts} */ {
      icon: "fa-spinner fa-spin",
      img: systemPath("icons/documents/uncertainty.svg"),
      name: "TERIOCK.COMMON.Loading",
    },
    unknown: /** @type {Teriock.Panels.PanelParts} */ {
      icon: icons.ui.variable,
      img: systemPath("icons/documents/uncertainty.svg"),
      name: "???",
    },
  },
};

preLocalizeConfig("display.panel.premade", { keys: ["name"] });
