import { systemPath } from "../../helpers/path.mjs";
import { dedent } from "../../helpers/utils.mjs";

export const displayPanel = {
  loading: dedent(`
    <div class="teriock-panel">
      <header class="teriock-panel-header">
        <div class="teriock-panel-image">
          <img src="${systemPath("icons/documents/uncertainty.svg")}" alt="">
        </div>
        <div class="teriock-panel-header-name">Loading...</div>
        <div class="teriock-panel-header-icon">
          <i class="fa-fw fa-light fa-spinner fa-spin"></i>
        </div>
      </header>
    </div>`),
};
