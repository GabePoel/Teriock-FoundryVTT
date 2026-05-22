import { icons } from "../../../../constants/display/icons.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { simplifyTags } from "../../../../helpers/panel.mjs";
import { getImage } from "../../../../helpers/path.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import { AccessDataMixin } from "../../../shared/mixins/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";

const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

/**
 * @extends {TypeDataModel}
 * @extends {Teriock.Models.HarmSystemData}
 * @mixes AccessData
 * @mixes AutomatableSystem
 * @mixes BaseSystem
 * @mixes MetaphysicsSystem
 * @mixes RulesSystem
 */
export default class HarmSystem
  extends mixClasses(
    TypeDataModel,
    mixins.BaseSystemMixin,
    mixins.RulesSystemMixin,
    mixins.AutomatableSystemMixin,
    mixins.MetaphysicsSystemMixin,
    AccessDataMixin,
  )
{
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
    return Object.assign(super.defineSchema(), { img: new fields.FilePathField({ categories: ["IMAGE"] }) });
  }

  /** @inheritDoc */
  get displayFields() {
    return [...super.displayFields, {
      label: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
      path: "text.content",
    }];
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
      foundry.utils.mergeObject({
        system: { img: getImage("effect-types", ref) },
        text: { content: _loc("TERIOCK.SYSTEMS.Harm.DATA.description") },
      }, data),
    );
  }

  /** @returns {Promise<Partial<Teriock.Messages.MessagePanel>>} */
  async getPanelParts() {
    return {
      bars: [{
        icon: icons.form.normal,
        label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.metaphysics"),
        wrappers: simplifyTags(this._metaphysicsTags),
      }],
    };
  }

  /** @inheritDoc */
  getRollData() {
    return {};
  }
}
