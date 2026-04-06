import { getImage } from "../../../../helpers/path.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import { AccessDataMixin } from "../../../shared/mixins/_module.mjs";
import { RulesSystem } from "../../abstract/_module.mjs";
import { AutomatableSystemMixin } from "../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {RulesSystem}
 * @extends {Teriock.Models.HarmSystemData}
 * @mixes AccessData
 * @mixes AutomatableSystem
 */
export default class HarmSystem extends mix(
  RulesSystem,
  AccessDataMixin,
  AutomatableSystemMixin,
) {
  /** @inheritDoc */
  static get _automationTypes() {
    return [
      automations.AttunementAutomation,
      automations.ChatMacroAutomation,
      automations.ChatStatusAutomation,
      automations.CommonImpactsAutomation,
      automations.HacksAutomation,
      automations.RollAutomation,
      automations.TakeAutomation,
    ];
  }

  /**
   * Metadata.
   * @return {{pseudos: {Automation: string}}}
   */
  static get metadata() {
    return {
      pseudos: {
        Automation: "system.automations",
      },
    };
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      img: new fields.FilePathField({
        categories: ["IMAGE"],
      }),
    });
  }

  /** @inheritDoc */
  get document() {
    return this.parent;
  }

  /** @inheritDoc */
  get fullName() {
    return game.i18n.format("TERIOCK.SYSTEMS.Harm.EMBED.fullName", {
      name: super.fullName,
      type: TERIOCK.options.impact[this.parent.type]?.label || "",
    });
  }

  /**
   * Metadata.
   * @return {{pseudos: {Automation: string}}}
   */
  get metadata() {
    return this.constructor.metadata;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) return false;

    let ref = "";
    if (this.parent.type === "damage") ref = "Damaging";
    if (this.parent.type === "drain") ref = "Draining";
    this.parent.updateSource(
      foundry.utils.mergeObject(
        {
          text: {
            content: game.i18n.localize(
              "TERIOCK.SYSTEMS.Harm.DATA.description",
            ),
          },
          system: { img: getImage("effect-types", ref) },
        },
        data,
      ),
    );
  }

  /** @inheritDoc */
  getRollData() {
    return {};
  }
}
