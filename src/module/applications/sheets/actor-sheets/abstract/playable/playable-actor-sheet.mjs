import { InventorySystem } from "../../../../../data/systems/actors/_module.mjs";
import {
  AbilitySystem,
  ConditionSystem,
  FluencySystem,
  ResourceSystem,
} from "../../../../../data/systems/effects/_module.mjs";
import { PowerSystem, RankSystem, SorcerySystem } from "../../../../../data/systems/items/_module.mjs";
import { consolidateWriteOperations, makeIconClass, mixClasses } from "../../../../../utils/_module.mjs";
import { DocumentSelector } from "../../../../dialogs/_module.mjs";
import BaseActorSheet from "../base-actor-sheet.mjs";
import * as parts from "./parts/_module.mjs";

/**
 * @import { ApplicationConfiguration, ApplicationTabsConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Playable actor sheet.
 * @extends {BaseActorSheet}
 * @mixes PlayableActorSheetSidebarPart
 * @mixes PlayableActorSheetTradecraftsPart
 * @mixes PlayableActorSheetAbilitiesPart
 * @mixes PlayableActorSheetInventoryPart
 * @mixes PlayableActorSheetClassesPart
 * @mixes PlayableActorSheetPowersPart
 * @mixes PlayableActorSheetResourcesPart
 * @mixes PlayableActorSheetEffectsPart
 * @mixes PlayableActorSheetAffinitiesPart
 * @mixes PlayableActorSheetSorceryPart
 * @mixes PlayableActorSheetDetailsPart
 * @mixes PlayableActorSheetTabsPart
 */
export default class TeriockPlayableActorSheet
  extends mixClasses(
    BaseActorSheet,
    parts.PlayableActorSheetSidebarPart,
    parts.PlayableActorSheetTradecraftsPart,
    parts.PlayableActorSheetAbilitiesPart,
    parts.PlayableActorSheetInventoryPart,
    parts.PlayableActorSheetClassesPart,
    parts.PlayableActorSheetPowersPart,
    parts.PlayableActorSheetResourcesPart,
    parts.PlayableActorSheetEffectsPart,
    parts.PlayableActorSheetAffinitiesPart,
    parts.PlayableActorSheetSorceryPart,
    parts.PlayableActorSheetDetailsPart,
    parts.PlayableActorSheetTabsPart,
  )
{
  /**
   * Pull from the Death Bag.
   * @returns {Promise<void>}
   */
  static async #onDeathBagPull() {
    if (!this.isEditable) { return; }
    await this.actor.run("bag");
  }

  /**
   * Take a long rest.
   * @returns {Promise<void>}
   */
  static async #onTakeLongRest() {
    if (!this.isEditable) { return; }
    await this.actor.run("longRest");
  }

  /**
   * Take a short rest.
   * @returns {Promise<void>}
   */
  static async #onTakeShortRest() {
    if (!this.isEditable) { return; }
    await this.actor.run("shortRest");
  }

  /**
   * Toggle Documents to be enabled or disabled.
   * @param {PointerEvent} _event
   * @param {HTMLElement} target
   * @returns {Promise<void>}
   */
  static async #onToggleDocs(_event, target) {
    if (!game.teriock.checkEditable(this)) { return; }
    const docs = foundry.utils.getProperty(this.document, target.dataset.path) ?? [];
    const enabled = await DocumentSelector.selectMulti(docs, {
      checked: docs.filter(d => !d.disabled).map(r => r.uuid),
    });
    if (!enabled) { return; }
    const freeOps = docs.filter(d => d.metadata.disabledPath).map(d => {
      return {
        action: "update",
        documentName: d.documentName,
        pack: d.pack,
        parent: d.parent,
        updates: [{ _id: d.id, [d.metadata.disabledPath]: !enabled.includes(d) }],
      };
    });
    await foundry.documents.modifyBatch(consolidateWriteOperations(freeOps));
  }

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: {
      deathBagPull: this.#onDeathBagPull,
      takeLongRest: this.#onTakeLongRest,
      takeShortRest: this.#onTakeShortRest,
      toggleDocs: this.#onToggleDocs,
    },
    position: { height: 600, width: 800 },
    window: {
      controls: [{
        action: "deathBagPull",
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.execution.deathBag, "contextMenu"),
        label: "TERIOCK.SHEETS.Actor.ACTIONS.DeathBagPull.label",
        ownership: "OWNER",
        visible() {
          return this.isEditable;
        },
      }, {
        action: "takeLongRest",
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.execution.longRest, "contextMenu"),
        label: "TERIOCK.SHEETS.Actor.ACTIONS.TakeLongRest.label",
        ownership: "OWNER",
        visible() {
          return this.isEditable;
        },
      }, {
        action: "takeShortRest",
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.execution.shortRest, "contextMenu"),
        label: "TERIOCK.SHEETS.Actor.ACTIONS.TakeShortRest.label",
        ownership: "OWNER",
        visible() {
          return this.isEditable;
        },
      }],
    },
  };

  /** @type {Record<string, Partial<ApplicationTabsConfiguration>>} */
  static TABS = {
    primary: {
      initial: "tradecrafts",
      labelPrefix: "TERIOCK.SHEETS.Actor.TABS",
      tabs: [
        { icon: makeIconClass(FluencySystem.metadata.icon, "light"), id: "tradecrafts" },
        { icon: makeIconClass(AbilitySystem.metadata.icon, "light"), id: "abilities" },
        { icon: makeIconClass(InventorySystem.metadata.icon, "light"), id: "inventory" },
        { icon: makeIconClass(RankSystem.metadata.icon, "light"), id: "classes" },
        { icon: makeIconClass(PowerSystem.metadata.icon, "light"), id: "powers" },
        { icon: makeIconClass(ResourceSystem.metadata.icon, "light"), id: "resources" },
        { icon: makeIconClass(ConditionSystem.metadata.icon, "light"), id: "effects" },
        { icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.pseudoDocument.affinity, "light"), id: "affinities" },
        { icon: makeIconClass(SorcerySystem.metadata.icon, "light"), id: "sorcery" },
        { icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.details, "light"), id: "details" },
      ],
    },
  };

  /** @inheritDoc */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    if (this.document.type !== "environment" && this.document.previewedTypes.species.length === 0) {
      ui.notifications.warn("TERIOCK.SHEETS.Actor.NOTIFICATIONS.noSpecies", {
        format: { compendium: _loc(game.packs.get("teriock.species").title), name: this.document.name },
        localize: true,
      });
    }
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    return Object.assign(await super._prepareContext(options), { environment: this.document.type === "environment" });
  }
}
