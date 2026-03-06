import TeriockDialog from "../../../applications/api/dialog.mjs";
import {
  buttonHandlers,
  commands,
} from "../../../helpers/interaction/_module.mjs";
import { formatJoin } from "../../../helpers/string.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import BaseAutomation from "./abstract/base-automation.mjs";
import { TriggerAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Set<Teriock.Parameters.Consequence.CommonImpactKey>} common
 */
export default class CommonImpactsAutomation extends TriggerAutomationMixin(
  BaseAutomation,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.CommonImpactsAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.CommonImpactsAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "common";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      common: new fields.SetField(
        new fields.StringField({
          choices: TERIOCK.options.consequence.common,
        }),
      ),
    });
  }

  /** @inheritDoc */
  get _buttons() {
    return Array.from(this.common).map((c) => buttonHandlers[c].buildButton());
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["common", ...super._formPaths];
  }

  /** @inheritDoc */
  _onFire() {
    if (!this.document.actor) return;
    TeriockDialog.confirm({
      window: {
        title: this.document.name,
        icon: makeIconClass(TERIOCK.display.icons.ui.automations, "title"),
      },
      content: game.i18n.format(
        "TERIOCK.AUTOMATIONS.CommonImpactsAutomation.DIALOG.content",
        {
          impacts: formatJoin(
            Array.from(this.common).map(
              (c) => TERIOCK.options.consequence.common[c],
            ),
          ),
        },
      ),
    }).then((proceed) => {
      if (!proceed) return;
      for (const c of this.common) {
        commands[c].primary(this.document.actor);
      }
    });
  }
}
