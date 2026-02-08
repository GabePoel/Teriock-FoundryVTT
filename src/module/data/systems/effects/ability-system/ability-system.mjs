import { selectDialog } from "../../../../applications/dialogs/select-dialog.mjs";
import { pseudoHooks } from "../../../../constants/system/pseudo-hooks.mjs";
import { AbilityExecution } from "../../../../executions/document-executions/_module.mjs";
import { safeUuid } from "../../../../helpers/resolve.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-model.mjs";
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
 * @MIXES AbilityCostsPart
 * @mixes AbilityDurationPart
 * @mixes AbilityGeneralPart
 * @mixes AbilityHierarchyPart
 * @mixes AbilityImpactsPart
 * @mixes AbilityImprovementsPart
 * @mixes AbilityPanelPart
 * @mixes ConsumableSystem
 * @mixes HierarchySystem
 * @mixes PiercingSystem
 * @mixes CompetenceDisplaySystem
 * @mixes RevelationSystem
 * @mixes ThresholdSystem
 * @mixes WikiSystem
 */
export default class AbilitySystem extends mix(
  BaseEffectSystem,
  mixins.ConsumableSystemMixin,
  mixins.HierarchySystemMixin,
  mixins.PiercingSystemMixin,
  mixins.CompetenceDisplaySystemMixin,
  mixins.RevelationSystemMixin,
  mixins.ThresholdSystemMixin,
  mixins.WikiSystemMixin,
  parts.AbilityCostsPart,
  parts.AbilityDurationPart,
  parts.AbilityGeneralPart,
  parts.AbilityHierarchyPart,
  parts.AbilityImpactsPart,
  parts.AbilityImprovementsPart,
  parts.AbilityPanelPart,
  parts.AbilityRankPart,
) {
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
        "system.consumable",
        "system.gifted",
        "system.grantOnly",
        "system.improvement",
        "system.limitation",
        "system.maxQuantity",
        "system.competence",
        "system.quantity",
      ],
      pseudoAutomationTypes: [
        "abilityMacro",
        "changes",
        "check",
        "combatExpiration",
        "duration",
        "feat",
        "status",
        "useAbility",
      ],
      type: "ability",
      usable: true,
      visibleTypes: ["ability"],
    });
  }

  /** @inheritDoc */
  get color() {
    return TERIOCK.options.ability.form[this.form].color;
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

  /**
   * A string representing the elements for this ability.
   * @returns {string}
   */
  get elementString() {
    if (this.elements.size === 0) {
      return "Celestial";
    } else if (this.elements.size === 1) {
      return Array.from(this.elements)[0];
    } else {
      const elements = Array.from(this.elements).sort((a, b) =>
        a.localeCompare(b),
      );
      return `${elements.slice(0, -1).join(", ")}${this.elements.size > 2 ? "," : ""} and ${elements.at(-1)}`;
    }
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

  /**
   * Whether this has an area of effect.
   * @returns {boolean}
   */
  get isAoe() {
    return (
      this.delivery.base === "aura" ||
      this.delivery.base === "cone" ||
      this.expansion === "detonate"
    );
  }

  /**
   * If this is a true basic ability.
   * @returns {boolean}
   */
  get isBasic() {
    return (
      this.basic &&
      this.parent.parent.name === "Basic Abilities" &&
      this.parent.inCompendium
    );
  }

  /**
   * Whether this requires contact with a target.
   * @returns {boolean}
   */
  get isContact() {
    return ["armor", "bite", "hand", "item", "shield", "weapon"].includes(
      this.delivery.base,
    );
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
    return this.parent.name + nameAddition;
  }

  /**
   * On use icon.
   * @returns {Teriock.EmbedData.EmbedIcon}
   */
  get onUseIcon() {
    return {
      icon: this.parent.isOnUse ? "bolt" : "bolt-slash",
      action: "toggleOnUseDoc",
      tooltip: this.parent.isOnUse ? "Activates Only on Use" : "Always Active",
      condition: this.parent.isOwner,
      callback: async () => {
        const onUseSet = this.parent.parent.system.onUse;
        if (onUseSet.has(this.parent.id)) {
          onUseSet.delete(this.parent.id);
        } else {
          onUseSet.add(this.parent.id);
        }
        await this.parent.parent.update({
          "system.onUse": Array.from(onUseSet),
        });
      },
    };
  }

  /** @inheritDoc */
  get tagIcon() {
    if (this.parent.elder?.type === "equipment" && this.parent.isOnUse) {
      return this.onUseIcon;
    }
    return super.tagIcon;
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
   * Change a macro's run hook.
   * @param {UUID<TeriockMacro>} uuid
   * @returns {Promise<void>}
   */
  async changeMacroRunHook(uuid) {
    const pseudoHook = await selectDialog(pseudoHooks, {
      label: "Event",
      hint: "Please select an event that triggers this macro to run.",
      title: "Select Event",
      initial: this.impacts.macros[safeUuid(uuid)],
    });
    const updateData = {};
    updateData[`system.impacts.macros.${safeUuid(uuid)}`] = pseudoHook;
    await this.parent.update(updateData);
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

  /**
   * Unlink a macro.
   * @param {UUID<TeriockMacro>} uuid
   * @returns {Promise<void>}
   */
  async unlinkMacro(uuid) {
    const updateData = {};
    updateData[`system.impacts.macros.-=${safeUuid(uuid)}`] = null;
    await this.parent.update(updateData);
  }
}
