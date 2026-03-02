import { TeriockDialog } from "../../../applications/api/_module.mjs";
import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import BaseAutomation from "./base-automation.mjs";
import { TriggerAutomationMixin } from "./mixins/_module.mjs";

/**
 * @property {Teriock.System.FormulaString} formula
 * @property {Teriock.System.TimeTrigger} trigger
 * @property {ConsumableSystem} parent
 */
export default class RegainUsesAutomation extends TriggerAutomationMixin(
  BaseAutomation,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.RegainUsesAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.RegainUsesAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "regain";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      formula: new FormulaField({
        deterministic: false,
      }),
    });
  }

  /** @inheritDoc */
  get _documentActive() {
    return true;
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["formula", ...super._formPaths];
  }

  /**
   * The operation where this regains uses.
   * @returns {Promise<void>}
   */
  async #regainUses() {
    if (!this.parent.consumable) return;
    const regain = await TeriockDialog.confirm({
      content: await TeriockTextEditor.enrichHTML(
        "<p>" +
          game.i18n.format(
            "TERIOCK.AUTOMATIONS.RegainUsesAutomation.DIALOG.text",
            { name: `@UUID[${this.document.uuid}]` },
          ) +
          "</p>",
      ),
      window: {
        icon: makeIconClass(
          TERIOCK.options.document[this.document.type].icon,
          "title",
        ),
        title: game.i18n.localize(
          "TERIOCK.AUTOMATIONS.RegainUsesAutomation.LABEL",
        ),
      },
    });
    if (!regain) return;
    const roll = new BaseRoll(this.formula, this.getRollData(), {
      flavor: game.i18n.localize(
        "TERIOCK.AUTOMATIONS.RegainUsesAutomation.USAGE.roll",
      ),
    });
    await roll.evaluate();
    /** @type {Teriock.MessageData.MessagePanel} */
    const panelData = {
      bars: [
        {
          label: game.i18n.localize(
            "TERIOCK.SHEETS.Common.NAVIGATION.enterAutomationsTab",
          ),
          icon: TERIOCK.display.icons.ui.automations,
          wrappers: [
            game.i18n.localize("TERIOCK.AUTOMATIONS.BaseAutomation.LABEL"),
            TERIOCK.options.time.triggers[this.trigger],
          ],
        },
      ],
      blocks: [
        {
          text: game.i18n.format(
            "TERIOCK.AUTOMATIONS.RegainUsesAutomation.USAGE.description",
            { name: this.document.nameString },
          ),
          title: game.i18n.localize(
            "TERIOCK.SYSTEMS.Child.FIELDS.description.label",
          ),
        },
      ],
      icon: TERIOCK.display.icons.ui.automations,
      image: this.document.img,
      label: game.i18n.localize(
        "TERIOCK.AUTOMATIONS.RegainUsesAutomation.LABEL",
      ),
      name: game.i18n.localize(
        "TERIOCK.AUTOMATIONS.RegainUsesAutomation.LABEL",
      ),
    };
    const panel = await TeriockTextEditor.enrichPanel(panelData);
    const messageData = {
      rolls: [roll],
      speaker: TeriockChatMessage.getSpeaker({ actor: this.actor }),
      system: {
        panels: [panel],
      },
    };
    await TeriockChatMessage.create(messageData);
    await this.document.update({
      "system.quantity": Math.max(
        Math.min(this.parent.maxQuantity.value, this.parent.quantity + 1),
        0,
      ),
    });
  }

  /** @inheritDoc */
  _onFire() {
    this.#regainUses().then();
  }
}
