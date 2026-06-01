import { systemPath } from "../../helpers/path.mjs";
import { dedent } from "../../helpers/string.mjs";

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
};
