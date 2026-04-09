import { TeriockDialog } from "../../../applications/api/_module.mjs";
import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
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
    "TERIOCK.AUTOMATIONS.RegainUses",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.RegainUses.LABEL";
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
          _loc("TERIOCK.AUTOMATIONS.RegainUses.DIALOG.text", {
            name: `@UUID[${this.document.uuid}]`,
          }) +
          "</p>",
      ),
      window: {
        icon: makeIconClass(
          TERIOCK.options.document[this.document.type].icon,
          "title",
        ),
        title: _loc("TERIOCK.AUTOMATIONS.RegainUses.LABEL"),
      },
    });
    if (!regain) return;
    const roll = new BaseRoll(this.formula, this.getRollData(), {
      flavor: _loc("TERIOCK.AUTOMATIONS.RegainUses.USAGE.roll"),
    });
    await roll.evaluate();
    /** @type {Teriock.MessageData.MessagePanel} */
    const panelData = {
      bars: [
        {
          label: _loc("TERIOCK.SHEETS.Common.NAVIGATION.enterAutomationsTab"),
          icon: TERIOCK.display.icons.pseudoDocument.automation,
          wrappers: [
            _loc("TERIOCK.AUTOMATIONS.Base.LABEL"),
            this.constructor._processedTriggerChoices[this.trigger].label,
          ],
        },
      ],
      blocks: [
        {
          text: _loc("TERIOCK.AUTOMATIONS.RegainUses.USAGE.description", {
            name: this.document.fullName,
          }),
          title: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
        },
      ],
      icon: TERIOCK.display.icons.pseudoDocument.automation,
      image: this.document.img,
      label: _loc("TERIOCK.AUTOMATIONS.RegainUses.LABEL"),
      name: _loc("TERIOCK.AUTOMATIONS.RegainUses.LABEL"),
    };
    const panel = await TeriockTextEditor.enrichPanel(panelData);
    const messageData = {
      rolls: [roll],
      speaker: TeriockChatMessage.getSpeaker({ actor: this.actor }),
      system: { panels: [panel] },
    };
    await TeriockChatMessage.create(messageData, { defaultMode: true });
    await this.document.update({
      "system.quantity": Math.clamp(
        this.parent.quantity + roll.total,
        0,
        this.parent.maxQuantity.value,
      ),
    });
  }

  /** @inheritDoc */
  _onFire() {
    this.#regainUses();
  }
}
