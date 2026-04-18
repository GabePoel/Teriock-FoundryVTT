import { costOptions } from "../../../../constants/options/cost-options.mjs";
import { AbilityExecution } from "../../../../executions/document-executions/_module.mjs";
import { mix } from "../../../../helpers/construction.mjs";
import { AbilitySettingsModel } from "../../../models/settings-models/_module.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import * as shared from "../../../shared/mixins/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import CleanedEffectSystem from "../cleaned-effect-system.mjs";
import * as parts from "./parts/_module.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * Ability-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Ability Rules](https://wiki.teriock.com/index.php/Category:Ability_rules)
 *
 * @extends {CleanedEffectSystem}
 * @implements {Teriock.Models.AbilitySystemData}
 * @mixes AbilityAutomationsPart
 * @mixes AbilityCostsPart
 * @mixes AbilityDurationPart
 * @mixes AbilityEquipmentPart
 * @mixes AbilityInfoPart
 * @mixes AbilityMetaphysicsPart
 * @mixes AbilityOverviewPart
 * @mixes AbilityPanelPart
 * @mixes AbilityResultsPart
 * @mixes AbilityUpgradesPart
 * @mixes AbilityUsagePart
 * @mixes AdjustableSystem
 * @mixes ConsumableSystem
 * @mixes AttackSystem
 * @mixes CompetenceDisplaySystem
 * @mixes RevelationSystem
 * @mixes ThresholdData
 * @mixes WikiSystem
 */
export default class AbilitySystem extends mix(
  CleanedEffectSystem,
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
  parts.AbilityInfoPart,
  parts.AbilityUsagePart,
  parts.AbilityImprovementsPart,
  parts.AbilityOverviewPart,
  parts.AbilityPanelPart,
  parts.AbilityRankPart,
  parts.AbilityResultsPart,
  parts.AbilityMetaphysicsPart,
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
      automations.AddDocumentsAutomation,
      automations.AttunementAutomation,
      automations.ChangeCompetenceAutomation,
      automations.ChangeMovementAutomation,
      automations.ChangesAutomation,
      automations.CombatExpirationAutomation,
      automations.CommonOutcomesAutomation,
      automations.DurationAutomation,
      automations.FeatAutomation,
      automations.HacksAutomation,
      automations.HealAutomation,
      automations.ModifyEffectAutomation,
      automations.ProtectionAutomation,
      automations.ResistAutomation,
      automations.RevitalizeAutomation,
      automations.RollAutomation,
      automations.StatusAutomation,
      automations.TakeAutomation,
      automations.TemplateAutomation,
      automations.TradecraftAutomation,
      automations.TransformationAutomation,
      automations.UseDocumentsAutomation,
    ];
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childEffectTypes: ["ability", "fluency"],
      hierarchy: true,
      indexCategoryKey: "abilities",
      indexCompendiumKey: "abilities",
      namespace: "Ability",
      passive: true,
      type: "ability",
      usable: true,
      visibleTypes: ["ability", "fluency"],
    });
  }

  /** @inheritDoc */
  get SettingsFlagsDataModel() {
    return AbilitySettingsModel;
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
      tags.push(_loc("TERIOCK.SYSTEMS.Ability.NAME.granted"));
    }
    return [...tags, ...super._nameTags];
  }

  /** @inheritDoc */
  get displayFields() {
    const fields = [
      {
        button: _loc(
          "TERIOCK.SYSTEMS.Ability.FIELDS.elderSorceryIncant.button",
        ),
        classes: TERIOCK.display.panel.classes.elderSorcery,
        label: _loc(
          "TERIOCK.SYSTEMS.Ability.FIELDS.elderSorceryIncant.elements",
          { elements: this.elementString },
        ),
        path: "system.elderSorceryIncant",
        visible: this.elderSorcery,
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
        classes: this.competence.proficient
          ? ""
          : TERIOCK.display.panel.classes.faded,
        path: "system.overview.proficient",
      },
      {
        classes: this.competence.fluent
          ? ""
          : TERIOCK.display.panel.classes.faded,
        path: "system.overview.fluent",
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
          classes: TERIOCK.display.panel.classes.derived,
          editable: false,
          path: "system.grantOnlyText",
        },
        {
          classes: TERIOCK.display.panel.classes.derived,
          editable: false,
          path: "system.consumeSourceText",
        },
        {
          classes: [
            TERIOCK.display.panel.classes.derived,
            TERIOCK.display.panel.classes.editable,
          ].join(" "),
          dataset: {
            action: "updatePaths",
            paths:
              "system.upgrades.score.attribute system.upgrades.score.value",
            title: _loc("TERIOCK.SYSTEMS.Ability.FIELDS.upgrades.score.update"),
            icon: TERIOCK.display.icons.ui.numerical,
          },
          editable: false,
          path: "system.upgrades.score.text",
        },
        {
          classes: [
            TERIOCK.display.panel.classes.derived,
            TERIOCK.display.panel.classes.editable,
          ].join(" "),
          dataset: {
            action: "updatePaths",
            paths:
              "system.upgrades.competence.attribute system.upgrades.competence.value",
            title: _loc(
              "TERIOCK.SYSTEMS.Ability.FIELDS.upgrades.competence.update",
            ),
            icon: TERIOCK.display.icons.competence.fluent,
          },
          editable: false,
          path: "system.upgrades.competence.text",
        },
      ],
    );
    return fields;
  }

  /** @inheritDoc */
  get displayTags() {
    return [...super.displayTags, ...this._infoTags, ...this._metaphysicsTags];
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
      "system.sustained",
      "system.invoked",
      "system.elderSorcery",
      "system.consumable",
      "system.consumeSource",
      "system.grantOnly",
      "system.warded",
      "system.mundane",
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
        action: "toggleDisableLocked",
        icon: TERIOCK.display.icons.ui.locked,
        onClick: () => {
          ui.notifications.error("TERIOCK.SYSTEMS.Ability.EMBED.basic", {
            localize: true,
          });
        },
        tooltip: _loc("TERIOCK.SYSTEMS.Ability.EMBED.locked"),
        visible: this.basic,
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
      .join(_loc("TERIOCK.SYSTEMS.Base.EMBED.valueSeparator"));
  }

  /** @inheritDoc */
  get useIcon() {
    return TERIOCK.display.icons.interaction[this.interaction];
  }

  /** @inheritDoc */
  get useText() {
    if (this.spell) {
      return _loc("TERIOCK.SYSTEMS.Ability.USAGE.cast", {
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
