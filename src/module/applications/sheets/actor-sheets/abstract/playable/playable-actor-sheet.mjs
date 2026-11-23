import { mixClasses } from "../../../../../utils/_module.mjs";
import BaseActorSheet from "../base-actor-sheet.mjs";
import * as parts from "./parts/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 * @import * as hookEvents from "@client/hooks.mjs";
 */

/**
 * Playable actor sheet.
 * @extends {BaseActorSheet}
 * @mixes PlayableActorSheetAvatarImagePart
 * @mixes PlayableActorSheetCombatPart
 * @mixes PlayableActorSheetMechanicalPart
 * @mixes PlayableActorSheetSectionsPart
 * @mixes PlayableActorSheetAffinitiesPart
 * @mixes PlayableActorSheetRollingPart
 * @mixes PlayableActorSheetSidebarPart
 * @mixes PlayableActorSheetTabsPart
 * @mixes PlayableActorSheetTradecraftsPart
 */
export default class TeriockPlayableActorSheet
  extends mixClasses(
    BaseActorSheet,
    parts.PlayableActorSheetAvatarImagePart,
    parts.PlayableActorSheetCombatPart,
    parts.PlayableActorSheetMechanicalPart,
    parts.PlayableActorSheetSectionsPart,
    parts.PlayableActorSheetAffinitiesPart,
    parts.PlayableActorSheetRollingPart,
    parts.PlayableActorSheetSidebarPart,
    parts.PlayableActorSheetTabsPart,
    parts.PlayableActorSheetTradecraftsPart,
  )
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { position: { height: 600, width: 800 } };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    sidebar: { scrollable: [".actor-sidebar"], template: "teriock/sheets/actors/parts/sidebar" },
    tradecrafts: { scrollable: [""], template: "teriock/sheets/actors/tabs/tradecrafts-tab" },
    abilities: { scrollable: [""], template: "teriock/sheets/actors/tabs/generic-tab" },
    inventory: { scrollable: [""], template: "teriock/sheets/actors/tabs/inventory-tab" },
    classes: { scrollable: [""], template: "teriock/sheets/actors/tabs/generic-tab" },
    powers: { scrollable: [""], template: "teriock/sheets/actors/tabs/generic-tab" },
    resources: { scrollable: [""], template: "teriock/sheets/actors/tabs/generic-tab" },
    effects: { scrollable: [""], template: "teriock/sheets/actors/tabs/effects-tab" },
    affinities: { scrollable: [""], template: "teriock/sheets/actors/tabs/affinities-tab" },
    sorcery: { scrollable: [""], template: "teriock/sheets/actors/tabs/sorcery-tab" },
    details: { scrollable: [""], template: "teriock/sheets/actors/tabs/details-tab" },
    tabs: { template: "teriock/ui/vertical-tabs" },
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

  /**
   * @inheritDoc
   * @category Sorcery
   */
  async _prepareContext(options = {}) {
    return Object.assign(await super._prepareContext(options), {
      allWords: (await this.document.system.getAllWords()).renderHTML({ searchKey: this.id }),
    });
  }
}

/**
 * Re-render sheets to show updated effect durations.
 * @see {@link hookEvents.updateWorldTime}
 */
async function updateRegionDurations() {
  for (const app of foundry.applications.instances.values()) {
    if (app instanceof TeriockPlayableActorSheet && app.tabGroups?.primary === "effects") {
      app.render();
    }
  }
}
Hooks.on("updateWorldTime", updateRegionDurations);
