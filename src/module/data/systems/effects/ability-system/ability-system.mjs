import { AbilityExecution } from "../../../../executions/child-executions/_module.mjs";
import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { ThresholdDataMixin } from "../../../mixins/_module.mjs";
import { documentSettingsModels } from "../../../models/settings-models/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import { CleanedEffectSystem } from "../abstract/_module.mjs";
import * as parts from "./parts/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Ability Rules](https://wiki.teriock.com/index.php/Category:Ability_rules)
 *
 * @extends {CleanedEffectSystem}
 * @mixes ThresholdData
 * @mixes AttackSystem
 * @mixes ConsumableSystem
 * @mixes CompetenceDisplaySystem
 * @mixes MetaphysicsSystem
 * @mixes RevealableSystem
 * @mixes WikiSystem
 * @mixes AdjustableSystem
 * @mixes AffinableSystem
 * @mixes ExpirableSystem
 * @mixes AbilityCostsPart
 * @mixes AbilityDurationPart
 * @mixes AbilityEquipmentPart
 * @mixes AbilityInfoPart
 * @mixes AbilityUsagePart
 * @mixes AbilityUpgradesPart
 * @mixes AbilityOverviewPart
 * @mixes AbilityPanelPart
 * @mixes AbilityRankPart
 * @mixes AbilityResultsPart
 * @mixes AbilityElderSorceryPart
 */
export default class AbilitySystem
  extends mixClasses(
    CleanedEffectSystem,
    ThresholdDataMixin,
    systemMixins.AttackSystemMixin,
    systemMixins.ConsumableSystemMixin,
    systemMixins.CompetenceDisplaySystemMixin,
    systemMixins.MetaphysicsSystemMixin,
    systemMixins.RevealableSystemMixin,
    systemMixins.WikiSystemMixin,
    systemMixins.AdjustableSystemMixin,
    systemMixins.AffinableSystemMixin,
    systemMixins.ExpirableSystemMixin,
    parts.AbilityCostsPart,
    parts.AbilityDurationPart,
    parts.AbilityEquipmentPart,
    parts.AbilityInfoPart,
    parts.AbilityUsagePart,
    parts.AbilityUpgradesPart,
    parts.AbilityOverviewPart,
    parts.AbilityPanelPart,
    parts.AbilityRankPart,
    parts.AbilityResultsPart,
    parts.AbilityElderSorceryPart,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Ability"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    automationTags: { ability: true, passive: true, triggered: true },
    childTypes: ["ability", "fluency", "resource"],
    icon: TERIOCK.DISPLAY.icons.manifest.document.ability,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.ability,
    importable: true,
    sortPaths: ["system.kindIndex", "name", "_stats.createdTime"],
    tags: { usable: true },
    type: "ability",
  });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      settings: new fields.EmbeddedDataField(documentSettingsModels.ability),
    });
  }

  /** @inheritDoc */
  get _displayAddOptions() {
    const options = super._displayAddOptions;
    if (!this.expansion.type) {
      options.push({
        id: "expansion",
        label: "TERIOCK.SYSTEMS.Ability.FIELDS.expansion.label",
        subgroup: "activation",
        update: { "system.expansion": "detonate" },
      });
    } else if (!this.expansion.cap) {
      options.push({
        id: "expansionCap",
        label: "TERIOCK.SYSTEMS.Ability.FIELDS.expansion.cap.label",
        subgroup: "activation",
        update: { "system.expansion.cap": "1" },
      });
    }
    return options;
  }

  /** @inheritDoc */
  get _displayFieldsContent() {
    const fields = [
      {
        addLabel: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.elderSorceryIncant.button"),
        classes: [TERIOCK.DISPLAY.panels.styles.elderSorcery],
        label: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.elderSorceryIncant.elements", {
          elements: this.getStringForProperty("elements"),
        }),
        path: "system.elderSorceryIncant",
        visible: this.elderSorcery,
      },
      ...Object.entries(TERIOCK.CONFIG.stat).map(([k, v]) => {
        return {
          addLabel: _loc("TERIOCK.COSTS.Long.description", { key: v.label }),
          group: "costs",
          path: `system.costs.primary.${k}.description`,
          subgroup: "descriptions",
        };
      }),
      ...Object.keys(TERIOCK.CONFIG.cost.components.keys).map(k => {
        return {
          group: "costs",
          path: `system.costs.components.${k}.description`,
          subgroup: "descriptions",
          visible: this.costs.components[k].type === "description",
        };
      }),
      { path: "system.trigger", subgroup: "activation" },
      { path: "system.requirements", subgroup: "activation" },
      ...this.constructor._adjustableTextFields.map(path => ({ path, subgroup: "adjustments" })),
      "system.overview.base",
    ];
    let results = ["save", "fail"];
    if (this.interaction === "attack") { results = ["hit", "critHit", "miss", "critMiss"]; }
    else if (this.interaction === "feat") { results = ["fail", "critFail", "save", "critSave"]; }
    fields.push(...results.map(k => ({ path: `system.results.${k}`, subgroup: "results" })));
    fields.push(...[{
      classes: this.competence.proficient ? [] : [TERIOCK.DISPLAY.panels.styles.faded],
      path: "system.overview.proficient",
    }, {
      classes: this.competence.fluent ? [] : [TERIOCK.DISPLAY.panels.styles.faded],
      path: "system.overview.fluent",
    }]);
    fields.push(...[
      "system.heightened",
      { path: "system.endCondition", subgroup: "activation" },
      { classes: [TERIOCK.DISPLAY.panels.styles.derived], editable: false, path: "system.grantOnlyText" },
      { classes: [TERIOCK.DISPLAY.panels.styles.derived], editable: false, path: "system.grantUseText" },
      { classes: [TERIOCK.DISPLAY.panels.styles.derived], editable: false, path: "system.consumeSourceText" },
      {
        classes: [TERIOCK.DISPLAY.panels.styles.derived, TERIOCK.DISPLAY.panels.styles.editable],
        dataset: {
          icon: TERIOCK.DISPLAY.icons.manifest.ui.numerical,
          paths: "system.upgrades.score.attribute system.upgrades.score.value",
          title: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.upgrades.score.update"),
        },
        editable: false,
        path: "system.upgrades.score.text",
      },
      {
        classes: [TERIOCK.DISPLAY.panels.styles.derived, TERIOCK.DISPLAY.panels.styles.editable],
        dataset: {
          icon: TERIOCK.DISPLAY.icons.manifest.competence.fluent,
          paths: "system.upgrades.competence.attribute system.upgrades.competence.value",
          title: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.upgrades.competence.update"),
        },
        editable: false,
        path: "system.upgrades.competence.text",
      },
    ]);
    return fields;
  }

  /** @inheritDoc */
  get _displayTags() {
    return [...super._displayTags, ...this._infoTags, ...this._costTagsComponents];
  }

  /** @inheritDoc */
  get _displayToggles() {
    return [
      ...[
        "system.basic",
        "system.guildmaster",
        "system.invoked",
        "system.ritual",
        "system.rotator",
        "system.skill",
        "system.spell",
        "system.standard",
        "system.sustained",
        "system.warded",
      ].map(path => ({ group: "classification", path })),
      "system.consumeSource",
      "system.consumption.enabled",
      "system.elderSorcery",
      "system.grantOnly",
      "system.grantUse",
      ...super._displayToggles,
      "system.applyIfDeattuned",
    ];
  }

  /** @inheritDoc */
  get _embedIcons() {
    const icons = super._embedIcons.filter(i => !this.isBasic || !i.action?.toLowerCase().includes("disabled"));
    if (this.isBasic) {
      icons.push({
        action: "toggleDisableLocked",
        icon: TERIOCK.DISPLAY.icons.manifest.ui.locked,
        tooltip: _loc("SIDEBAR.PLACEABLES.ACTIONS.Locked"),
        visible: this.basic,
        onClick: () => {
          ui.notifications.error("TERIOCK.SYSTEMS.Ability.EMBED.basic", { localize: true });
        },
      });
    }
    if (this.isArmamentChild && !this.grantUse) { icons.unshift(this.grantUseIcon); }
    if (this.tagIcon) { icons.unshift(this.tagIcon); }
    return icons;
  }

  /** @inheritDoc */
  get _nameTags() {
    const tags = [];
    for (const [k, v] of Object.entries(TERIOCK.CONFIG.cost.tweaks)) {
      if (this.costs.tweaks[k]) { tags.push(v.label); }
    }
    if (this.grantOnly) { tags.push(_loc("TERIOCK.SYSTEMS.Ability.NAME.granted")); }
    return [...tags, ...super._nameTags];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    if (!this.consumption.enabled) {
      parts.subtitle = this.maneuver === "slow"
        ? this.executionTime.slow.label
        : TERIOCK.CONFIG.ability.maneuver[this.maneuver]?.executionTimes[this.executionTime.base]?.label;
    }
    return parts;
  }

  /** @inheritDoc */
  get isPassive() {
    return this.maneuver === "passive";
  }

  /** @inheritDoc */
  get isUsable() {
    return super.isUsable && !this.isVirtual;
  }

  /**
   * Whether this is a virtual ability.
   * @returns {boolean}
   */
  get isVirtual() {
    return this.parent.inCompendium && this.parent.parent?.identifier === "power:basic-abilities";
  }

  /** @inheritDoc */
  get makesEffectData() {
    return !this.isPassive;
  }

  /**
   * @inheritDoc
   * @returns {Teriock.Mechanics.MechanicToggleEntry[]}
   */
  get mechanicToggles() {
    const keys = TERIOCK.CONFIG.ability.interaction[this.interaction].results;
    const hasAlt = Boolean(this.results[keys.alt]);
    /**
     * @param {"alt"|"altCrit"|"base"|"baseCrit"} slot
     * @param {string} key
     * @returns {Teriock.Mechanics.MechanicToggleEntry}
     */
    const resultToggle = (slot, key) => ({
      group: "results",
      icon: TERIOCK.DISPLAY.icons.manifest.results[slot],
      id: `results${slot.capitalize()}`,
      name: `TERIOCK.MECHANIC_TOGGLES.Results.${key}.name`,
      off: `TERIOCK.MECHANIC_TOGGLES.Results.${key}.off`,
      on: `TERIOCK.MECHANIC_TOGGLES.Results.${key}.on`,
      variant: true,
      visible: pseudo => pseudo.modifiesEffectData,
    });
    const resultToggles = [
      this.results[keys.baseCrit] && resultToggle("baseCrit", keys.baseCrit),
      resultToggle("base", hasAlt ? keys.base : "base"),
      hasAlt && resultToggle("alt", keys.alt),
      this.results[keys.altCrit] && resultToggle("altCrit", keys.altCrit),
    ].filter(Boolean);
    return [...resultToggles, {
      group: "heightening",
      icon: TERIOCK.DISPLAY.icons.manifest.ability.unheightened,
      id: "unheightened",
      off: "TERIOCK.MECHANIC_TOGGLES.Heightening.unheightened.off",
      on: "TERIOCK.MECHANIC_TOGGLES.Heightening.unheightened.on",
      visible: pseudo => pseudo.canToggleHeightening,
    }, {
      group: "heightening",
      icon: TERIOCK.DISPLAY.icons.manifest.ability.heightened,
      id: "heightened",
      off: "TERIOCK.MECHANIC_TOGGLES.Heightening.heightened.off",
      on: "TERIOCK.MECHANIC_TOGGLES.Heightening.heightened.on",
      visible: pseudo => pseudo.canToggleHeightening,
    }, ...super.mechanicToggles];
  }

  /** @inheritDoc */
  get useIcon() {
    return TERIOCK.DISPLAY.icons.manifest.interaction[this.interaction];
  }

  /** @inheritDoc */
  get useText() {
    if (this.spell) { return _loc("TERIOCK.SYSTEMS.Ability.USAGE.cast", { value: this.parent.name }); }
    return super.useText;
  }

  /**
   * @inheritDoc
   * @param {object} [data]
   * @param {Teriock.Execution.AbilityExecutionOptions} [options]
   */
  async _use(data = {}, options = {}) {
    options.source = this.parent;
    if (this.grantOnly && this.parent.parent?.metadata?.tags?.armament) { options.armament = this.parent.parent; }
    await AbilityExecution.create(data, options);
  }

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    return Object.assign(rollData, {
      av0: Number(this.piercing.av0) * 2,
      ub: Number(this.piercing.ub),
      warded: Number(this.warded),
    });
  }

  /** @inheritDoc */
  toRefreshObject(document) {
    const obj = super.toRefreshObject(document);
    if (!["flaw", "normal", "special"].includes(this.kind)) { foundry.utils.deleteProperty(obj, "system.kind"); }
    return obj;
  }
}
