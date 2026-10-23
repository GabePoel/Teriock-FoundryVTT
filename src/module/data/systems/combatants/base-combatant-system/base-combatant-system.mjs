import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { InitiativeModel } from "../../../models/modifier-models/_module.mjs";
import { Panel } from "../../../pseudo-documents/_module.mjs";
import { BaseSystemMixin, UncommonSystemMixin } from "../../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;
const { fields } = foundry.data;

/**
 * Base Combatant data model.
 * @extends {TypeDataModel}
 * @mixes BaseSystem
 * @mixes UncommonSystem
 */
export default class BaseCombatantSystem extends mixClasses(TypeDataModel, BaseSystemMixin, UncommonSystemMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Combatant"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    documentName: "Combatant",
    icon: TERIOCK.DISPLAY.icons.manifest.document.combatant,
    type: "base",
  });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      actions: new fields.NumberField({
        initial: TERIOCK.CONFIG.combat.maxActions,
        integer: true,
        max: TERIOCK.CONFIG.combat.maxActions,
        min: 0,
        nullable: false,
      }),
      attackPenalty: new fields.NumberField({ initial: 0, integer: true, max: 0, nullable: false }),
      initiative: new fields.EmbeddedDataField(InitiativeModel),
      reactions: new fields.NumberField({
        initial: TERIOCK.CONFIG.combat.maxReactions,
        integer: true,
        max: TERIOCK.CONFIG.combat.maxReactions,
        min: 0,
        nullable: false,
      }),
    });
  }

  /** @inheritDoc */
  get _color() {
    return this.parent.token?.color ?? null;
  }

  /** @inheritDoc */
  get actor() {
    return this.parent.actor;
  }

  /**
   * The default Combatant that this inherits data from in cases of a shared Actor.
   * @returns {TeriockCombatant}
   */
  get defaultCombatant() {
    return (this.actor && this.parent.parent?.getCombatantsByActor(this.actor)[0]) || this.parent;
  }

  /** @inheritDoc */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    this.actor?.render();
  }

  /** @inheritDoc */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
    this.actor?.render();
  }

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if ("system" in changed) { this.actor?.render(); }
  }

  /** @inheritDoc */
  async getPanelParts() {
    const { actor, initiative } = this.parent;
    const { pluralRules } = game.i18n;
    return Object.assign(await super.getPanelParts(), {
      associations: actor?.isViewer ? [Panel.toAssociation([actor], "DOCUMENT.Actor", actor.typeIcon)] : [],
      bars: [{
        icon: TERIOCK.DISPLAY.icons.manifest.ui.info,
        label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.info"),
        wrappers: [this.parent.typeLabel],
      }, {
        icon: TERIOCK.DISPLAY.icons.manifest.interaction.attack,
        label: _loc("TERIOCK.COMBAT.Event.combat"),
        wrappers: [
          _loc(`TERIOCK.SYSTEMS.Combatant.PANELS.actions.${pluralRules.select(this.actions)}`, { value: this.actions }),
          _loc(`TERIOCK.SYSTEMS.Combatant.PANELS.reactions.${pluralRules.select(this.reactions)}`, {
            value: this.reactions,
          }),
          _loc("TERIOCK.SYSTEMS.Combatant.PANELS.attackPenalty", { value: this.attackPenalty }),
          Number.isFinite(initiative) ? _loc("TERIOCK.SYSTEMS.Combatant.PANELS.initiative", { value: initiative }) : "",
        ],
      }],
      color: this.color,
    });
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    const defaultCombatant = this.defaultCombatant;
    if (defaultCombatant !== this.parent) {
      Object.assign(this, {
        actions: defaultCombatant.system.actions,
        attackPenalty: defaultCombatant.system.attackPenalty,
        reactions: defaultCombatant.system.reactions,
      });
    }
  }
}
