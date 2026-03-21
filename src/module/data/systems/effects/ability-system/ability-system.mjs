import { costOptions } from "../../../../constants/options/cost-options.mjs";
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
 * @implements {Teriock.Models.AbilitySystemData}
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
 * @mixes AdjustableSystem
 * @mixes ConsumableSystem
 * @mixes AttackSystem
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
  mixins.CompetenceDisplaySystemMixin,
  mixins.RevelationSystemMixin,
  mixins.WikiSystemMixin,
  mixins.AdjustableSystemMixin,
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
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.Ability",
  ];

  /** @inheritDoc */
  static get _automationTypes() {
    return [
      ...super._automationTypes,
      automations.AbilityMacroAutomation,
      automations.AddExternalDocumentsAutomation,
      automations.AttunementAutomation,
      automations.ChangeMovementAutomation,
      automations.ChangesAutomation,
      automations.CheckAutomation,
      automations.CombatExpirationAutomation,
      automations.CommonImpactsAutomation,
      automations.DurationAutomation,
      automations.FeatAutomation,
      automations.HacksAutomation,
      automations.HealAutomation,
      automations.ProtectionAutomation,
      automations.ResistAutomation,
      automations.RevitalizeAutomation,
      automations.RollAutomation,
      automations.StatusAutomation,
      automations.TakeAutomaton,
      automations.TemplateAutomation,
      automations.TransformationAutomation,
      automations.UseAbilitiesAutomation,
      automations.UseExternalDocumentsAutomation,
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
      type: "ability",
      usable: true,
      visibleTypes: ["ability"],
    });
  }

  /** @inheritDoc */
  get _nameTags() {
    const tags = [];
    for (const [k, v] of Object.entries(TERIOCK.options.cost.tweaks)) {
      if (this.costs.tweaks[k]) {
        tags.push(v.label);
      }
    }
    if (this.grantOnly) {
      tags.push(game.i18n.localize("TERIOCK.SYSTEMS.Ability.NAME.granted"));
    }
    return [...tags, ...super._nameTags];
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
        label: game.i18n.format(
          "TERIOCK.SYSTEMS.Ability.FIELDS.elderSorceryIncant.elements",
          { elements: this.elementString },
        ),
        visible: this.elderSorcery,
        classes: "elder-sorcery-display-field",
        button: game.i18n.localize(
          "TERIOCK.SYSTEMS.Ability.FIELDS.elderSorcery.label",
        ),
      },
      ...Object.keys(costOptions.primary.keys).map((k) => {
        return {
          path: `system.costs.primary.${k}.description`,
          visible: this.costs.primary[k].type === "description",
        };
      }),
      ...Object.keys(costOptions.components.keys).map((k) => {
        return {
          path: `system.costs.components.${k}.description`,
          visible: this.costs.components[k].type === "description",
        };
      }),
      "system.trigger",
      "system.requirements",
      ...this.constructor._adjustableTextFields,
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
          path: "system.consumeSourceText",
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
            title: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.FIELDS.upgrades.score.update",
            ),
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
            title: game.i18n.localize(
              "TERIOCK.SYSTEMS.Ability.FIELDS.upgrades.competence.update",
            ),
            icon: TERIOCK.display.icons.competence.fluent,
          },
        },
      ],
    );
    return fields;
  }

  /** @inheritDoc */
  get displayTags() {
    const tags = super.displayTags;
    if (this.basic) tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.basic.label");
    if (this.sustained) {
      tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.sustained.label");
    }
    if (this.standard && !this.skill && !this.spell) {
      tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.standard.label");
    }
    if (this.standard && this.skill) tags.push("TERIOCK.TERMS.Common.semblant");
    if (this.skill) tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.skill.label");
    if (this.standard && this.spell) tags.push("TERIOCK.TERMS.Common.conjured");
    if (this.spell) tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.spell.label");
    if (this.invoked) {
      tags.push({
        label: "TERIOCK.TERMS.Costs.invoked",
        tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.costs.label",
      });
    }
    Object.keys(costOptions.components.keys).forEach((k) => {
      if (this.costs.components[k].type) {
        tags.push({
          label: costOptions.components.keys[k],
          tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.costs.components.label",
        });
      }
    });
    if (this.ritual) tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.ritual.label");
    if (this.rotator) tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.rotator.label");
    if (this.guildmaster) {
      tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.guildmaster.label");
    }
    if (this.lore) tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.lore.label");
    tags.push(
      ...Array.from(this.powerSources).map((t) => {
        return {
          label: TERIOCK.reference.powerSources[t],
          tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.powerSources.label",
        };
      }),
      ...Array.from(this.elements).map((t) => {
        return {
          label: TERIOCK.reference.elements[t],
          tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.elements.label",
        };
      }),
      ...Array.from(this.effectTypes)
        .filter((t) => !this.powerSources.has(t))
        .map((t) => {
          return {
            label: TERIOCK.reference.effectTypes[t],
            tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.effectTypes.label",
          };
        }),
    );
    if (this.elderSorcery) {
      tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.elderSorcery.label");
    }
    if (this.warded) tags.push("TERIOCK.SYSTEMS.Attack.FIELDS.warded.label");
    return tags;
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
      "system.guildmaster",
      "system.lore",
      "system.sustained",
      "system.invoked",
      "system.elderSorcery",
      "system.consumable",
      "system.consumeSource",
      "system.grantOnly",
      "system.warded",
      ...super.displayToggles,
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
        tooltip: game.i18n.localize("TERIOCK.SYSTEMS.Ability.EMBED.locked"),
        callback: () => {
          ui.notifications.error("TERIOCK.SYSTEMS.Ability.EMBED.basic", {
            localize: true,
          });
        },
        condition: this.basic,
      });
    }
    if (
      ["body", "equipment"].includes(this.parent.elder?.type) &&
      !this.parent.isOnUse
    ) {
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
          this.executionTime.base
        ] ?? this.executionTime.slow?.text;
    }
    return parts;
  }

  /** @inheritDoc */
  get isReference() {
    const sups = /** @type {TeriockAbility[]} */ this.parent.allSups.contents;
    for (const sup of sups) {
      if (sup.system?.maneuver !== "passive") return true;
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
      this.parent.inCompendium &&
      this.parent.parent?.system.identifier === "basic-abilities"
    );
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
    return TERIOCK.display.icons.interaction[this.interaction];
  }

  /** @inheritDoc */
  get useText() {
    if (this.spell) {
      return game.i18n.format("TERIOCK.SYSTEMS.Ability.USAGE.cast", {
        value: this.parent.name,
      });
    }
    return super.useText;
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
    await new AbilityExecution(options).execute();
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
