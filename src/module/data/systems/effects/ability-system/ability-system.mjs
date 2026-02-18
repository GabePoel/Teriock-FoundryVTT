import { AbilityExecution } from "../../../../executions/document-executions/_module.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import { AbilitySettingsModel } from "../../../models/settings-models/_module.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import * as shared from "../../../shared/mixins/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-system.mjs";
import * as parts from "./parts/_module.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * Ability-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Ability Rules](https://wiki.teriock.com/index.php/Category:Ability_rules)
 *
 * @extends {BaseEffectSystem}
 * @implements {Teriock.Models.AbilitySystemInterface}
 * @mixes AbilityAutomationsPart
 * @mixes AbilityCostsPart
 * @mixes AbilityDurationPart
 * @mixes AbilityEquipmentPart
 * @mixes AbilityFlagsPart
 * @mixes AbilityUsagePart
 * @mixes AbilityHierarchyPart
 * @mixes AbilityOverviewPart
 * @mixes AbilityPanelPart
 * @mixes AbilityResultsPart
 * @mixes AbilityTagsPart
 * @mixes AbilityUpgradesPart
 * @mixes ConsumableSystem
 * @mixes HierarchySystem
 * @mixes PiercingSystem
 * @mixes CompetenceDisplaySystem
 * @mixes RevelationSystem
 * @mixes ThresholdData
 * @mixes WikiSystem
 */
export default class AbilitySystem extends mix(
  BaseEffectSystem,
  shared.ThresholdDataMixin,
  mixins.AttackSystemMixin,
  mixins.ConsumableSystemMixin,
  mixins.HierarchySystemMixin,
  mixins.CompetenceDisplaySystemMixin,
  mixins.RevelationSystemMixin,
  mixins.WikiSystemMixin,
  parts.AbilityAutomationsPart,
  parts.AbilityCostsPart,
  parts.AbilityDurationPart,
  parts.AbilityEquipmentPart,
  parts.AbilityFlagsPart,
  parts.AbilityUsagePart,
  parts.AbilityHierarchyPart,
  parts.AbilityImprovementsPart,
  parts.AbilityOverviewPart,
  parts.AbilityPanelPart,
  parts.AbilityRankPart,
  parts.AbilityResultsPart,
  parts.AbilityTagsPart,
) {
  /** @inheritDoc */
  static get _automationTypes() {
    return [
      automations.AbilityMacroAutomation,
      automations.ChangesAutomation,
      automations.CheckAutomation,
      automations.CombatExpirationAutomation,
      automations.CommonImpactsAutomation,
      automations.DurationAutomation,
      automations.FeatAutomation,
      automations.HacksAutomation,
      automations.ResistAutomation,
      automations.RollAutomation,
      automations.StatusAutomation,
      automations.TransformationAutomation,
      automations.UseAbilitiesAutomation,
    ];
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childEffectTypes: ["ability"],
      hierarchy: true,
      indexCategoryKey: "abilities",
      indexCompendiumKey: "abilities",
      namespace: "Ability",
      passive: true,
      preservedProperties: [
        "system.adept",
        "system.competence",
        "system.consumable",
        "system.gifted",
        "system.grantOnly",
        "system.improvement",
        "system.limitation",
        "system.maxQuantity",
        "system.quantity",
        "system.tag",
      ],
      type: "ability",
      usable: true,
      visibleTypes: ["ability"],
    });
  }

  /** @inheritDoc */
  get _settingsFlagsDataModel() {
    return AbilitySettingsModel;
  }

  /** @inheritDoc */
  get displayFields() {
    const fields = [
      {
        path: "system.elderSorceryIncant",
        label: `With the Elder Sorcery of ${this.elementString}...`,
        visible: this.elderSorcery,
        classes: "elder-sorcery-display-field",
      },
      {
        path: "system.costs.mp.value.variable",
        visible: this.costs.mp.type === "variable",
      },
      {
        path: "system.costs.hp.value.variable",
        visible: this.costs.hp.type === "variable",
      },
      {
        path: "system.costs.gp.value.variable",
        visible: this.costs.gp.type === "variable",
      },
      "system.costs.materialCost",
      "system.trigger",
      "system.requirements",
      "system.limitation",
      "system.improvement",
      "system.overview.base",
      {
        path: "system.overview.proficient",
        classes: this.competence.proficient ? "" : "faded-display-field",
      },
      {
        path: "system.overview.fluent",
        classes: this.competence.fluent ? "" : "faded-display-field",
      },
    ];
    if (this.interaction === "attack") {
      fields.push(
        ...[
          "system.results.hit",
          "system.results.critHit",
          "system.results.miss",
          "system.results.critMiss",
        ],
      );
    } else if (this.interaction === "feat") {
      fields.push(
        ...[
          "system.results.fail",
          "system.results.critFail",
          "system.results.save",
          "system.results.critSave",
        ],
      );
    } else {
      fields.push(...["system.results.save", "system.results.fail"]);
    }
    fields.push(
      ...[
        "system.heightened",
        "system.endCondition",
        {
          path: "system.grantOnlyText",
          classes: "italic-display-field ab-improvement-attribute",
          editable: false,
        },
        {
          path: "system.upgrades.score.text",
          classes: "italic-display-field editable-display-field",
          editable: false,
          dataset: {
            action: "updatePaths",
            paths:
              "system.upgrades.score.attribute system.upgrades.score.value",
            title: "Update Attribute Score Upgrade",
            icon: TERIOCK.display.icons.ui.numerical,
          },
        },
        {
          path: "system.upgrades.competence.text",
          classes: "italic-display-field editable-display-field",
          editable: false,
          dataset: {
            action: "updatePaths",
            paths:
              "system.upgrades.competence.attribute system.upgrades.competence.value",
            title: "Update Attribute Competence Upgrade",
            icon: TERIOCK.display.icons.competence.fluent,
          },
        },
      ],
    );
    return fields;
  }

  /** @inheritDoc */
  get displayToggles() {
    return [
      "system.basic",
      "system.standard",
      "system.skill",
      "system.spell",
      "system.ritual",
      "system.rotator",
      "system.sustained",
      "system.invoked",
      "system.costs.verbal",
      "system.costs.somatic",
      "system.elderSorcery",
      "system.adept.enabled",
      "system.gifted.enabled",
      "system.consumable",
      "system.grantOnly",
      "system.warded",
    ];
  }

  /** @inheritDoc */
  get embedIcons() {
    let icons = super.embedIcons.filter(
      (i) => !this.isBasic || !i.action?.toLowerCase().includes("disabled"),
    );
    if (this.isBasic) {
      icons.push({
        icon: TERIOCK.display.icons.ui.locked,
        action: "toggleDisableLocked",
        tooltip: "Locked",
        callback: () => {
          ui.notifications.error("Basic abilities cannot be disabled.");
        },
        condition: this.basic,
      });
    }
    if (this.parent.elder?.type === "equipment" && !this.parent.isOnUse) {
      icons.unshift(this.onUseIcon);
    }
    if (this.tagIcon) {
      icons.unshift(this.tagIcon);
    }
    return icons;
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    if (!this.consumable) {
      parts.subtitle =
        TERIOCK.options.ability.executionTime[this.maneuver]?.[
          this.executionTime
        ] ?? this.executionTime;
    }
    return parts;
  }

  /** @inheritDoc */
  get isReference() {
    const sups = /** @type {TeriockAbility[]} */ this.parent.allSups.contents;
    for (const sup of sups) {
      if (sup.system?.maneuver !== "passive") {
        return true;
      }
    }
    return super.isReference;
  }

  /** @inheritDoc */
  get isUsable() {
    return super.usable && !this.isVirtual;
  }

  /**
   * Whether this is a virtual ability.
   * @returns {boolean}
   */
  get isVirtual() {
    return (
      this.parent.inCompendium && this.parent.parent.name === "Basic Abilities"
    );
  }

  /** @inheritDoc */
  get nameString() {
    const additions = [];
    let suffix = "";
    if (this.tag && this.tag.length > 0) {
      suffix = `: ${this.tag}`;
    }
    if (this.adept.enabled) {
      additions.push("Adept");
    }
    if (this.gifted.enabled) {
      additions.push("Gifted");
    }
    if (this.limitation && this.limitation.length > 0) {
      additions.push("Limited");
    }
    if (this.improvement && this.improvement.length > 0) {
      additions.push("Improved");
    }
    if (this.grantOnly) {
      additions.push("Granted");
    }
    if (!this.revealed) {
      additions.push("Unrevealed");
    }
    let nameAddition = "";
    if (additions.length > 0) {
      nameAddition = ` (${additions.join(", ")})`;
    }
    return this.parent.name.trim() + suffix + nameAddition;
  }

  /**
   * String that represents all the valid targets.
   * @returns {string}
   */
  get targetString() {
    return Array.from(this.targets)
      .map((t) => TERIOCK.options.ability.targets[t])
      .sort((a, b) => a.localeCompare(b))
      .join(", ");
  }

  /** @inheritDoc */
  get useIcon() {
    if (this.interaction === "attack") {
      return "dice-d20";
    }
    if (this.interaction === "block") {
      return "shield";
    }
    return TERIOCK.options.document.ability.icon;
  }

  /** @inheritDoc */
  get useText() {
    if (this.spell) {
      return `Cast ${this.parent.name}`;
    }
    return super.useText;
  }

  /** @inheritDoc */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
    if (this.parent.checkEditor(userId)) {
      this.expireSustainedConsequences(true).then();
    }
  }

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (this.parent.checkEditor(userId)) {
      this.expireSustainedConsequences().then();
    }
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   */
  async _use(options = {}) {
    options.source = this.parent;
    if (this.grantOnly && this.parent.parent.metadata.armament) {
      options.armament = /** @type {TeriockArmament} */ this.parent.parent;
    }
    const execution = new AbilityExecution(options);
    await execution.execute();
  }

  /**
   * Cause all consequences this is sustaining to expire.
   * @param {boolean} force - Force consequences to expire even if this isn't suppressed.
   */
  async expireSustainedConsequences(force = false) {
    if (!this.parent.active || force) {
      for (const uuid of this.sustaining) {
        await game.users.queryGM(
          "teriock.sustainedExpiration",
          {
            sustainedUuid: uuid,
          },
          {
            failPrefix: "Could not expire sustained consequence.",
          },
        );
      }
      try {
        await this.parent.update({ "system.sustaining": [] });
      } catch {}
    }
  }

  /** @inheritDoc */
  async getCompendiumSourceRefreshObject() {
    const obj = await super.getCompendiumSourceRefreshObject();
    if (!["normal", "special", "flaw"].includes(this.form)) {
      foundry.utils.deleteProperty(obj, "system.form");
    }
    return obj;
  }

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    Object.assign(rollData, {
      av0: 0,
      "av0.abi": 0,
      ub: 0,
      "ub.abi": 0,
      warded: 0,
      "warded.abi": 0,
    });
    if (this.piercing === "av0") {
      Object.assign(rollData, {
        av0: 2,
        "av0.abi": 2,
      });
    }
    if (this.piercing === "ub") {
      Object.assign(rollData, {
        av0: 2,
        "av0.abi": 2,
        ub: 1,
        "ub.abi": 1,
      });
    }
    return rollData;
  }
}
