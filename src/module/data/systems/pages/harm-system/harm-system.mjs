import { mixClasses } from "../../../../helpers/construction.mjs";
import { getImage } from "../../../../helpers/path.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import { AccessDataMixin } from "../../../shared/mixins/_module.mjs";
import { AutomatableSystemMixin, RulesSystemMixin } from "../../mixins/_module.mjs";

const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

/**
 * @extends {TypeDataModel}
 * @extends {Teriock.Models.HarmSystemData}
 * @mixes RulesSystem
 * @mixes AccessData
 * @mixes AutomatableSystem
 */
export default class HarmSystem extends mixClasses(
  TypeDataModel,
  RulesSystemMixin,
  AccessDataMixin,
  AutomatableSystemMixin,
) {
  /** @inheritDoc */
  static get _automationTypes() {
    return [
      automations.AddDocumentsAutomation,
      automations.AttunementAutomation,
      automations.ChangeMovementAutomation,
      automations.ChatMacroAutomation,
      automations.ChatStatusAutomation,
      automations.CommonOutcomesAutomation,
      automations.FeatAutomation,
      automations.HacksAutomation,
      automations.HealAutomation,
      automations.RegionAutomation,
      automations.ResistAutomation,
      automations.RevitalizeAutomation,
      automations.RollAutomation,
      automations.RollStyleAutomation,
      automations.SummonAutomation,
      automations.TakeAutomation,
      automations.TradecraftAutomation,
      automations.UseDocumentsAutomation,
    ];
  }

  /**
   * Metadata.
   * @return {{pseudos: {Automation: string}}}
   */
  static get metadata() {
    return { pseudos: { Automation: "system.automations" } };
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      img: new fields.FilePathField({ categories: ["IMAGE"] }),
    });
  }

  /** @inheritDoc */
  get document() {
    return this.parent;
  }

  /** @inheritDoc */
  get fullName() {
    return _loc("TERIOCK.SYSTEMS.Harm.EMBED.fullName", {
      name: super.fullName,
      type: TERIOCK.config.impact[this.parent.type]?.label || "",
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
          text: { content: _loc("TERIOCK.SYSTEMS.Harm.DATA.description") },
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
