import { mixClasses } from "../../../../helpers/construction.mjs";
import BaseActorSheet from "./base-actor-sheet.mjs";
import * as parts from "./parts/_module.mjs";

/**
 * Playable actor sheet.
 * @extends {BaseActorSheet}
 * @mixes AvatarImageActorSheetPart
 * @mixes CombatActorSheetPart
 * @mixes ConditionsActorSheetPart
 * @mixes MechanicalActorSheetPart
 * @mixes RollingActorSheetPart
 * @mixes SidebarActorSheetPart
 * @mixes TabsActorSheetPart
 * @mixes ImpactActorSheetPart
 * @mixes TradecraftsActorSheetPart
 * @mixes DocumentCreationActorSheetPart
 */
export default class TeriockPlayableActorSheet
  extends mixClasses(
    BaseActorSheet,
    parts.AvatarImageActorSheetPart,
    parts.CombatActorSheetPart,
    parts.ConditionsActorSheetPart,
    parts.DocumentCreationActorSheetPart,
    parts.MechanicalActorSheetPart,
    parts.ProtectionsActorSheetPart,
    parts.RollingActorSheetPart,
    parts.SidebarActorSheetPart,
    parts.TabsActorSheetPart,
    parts.ImpactActorSheetPart,
    parts.TradecraftsActorSheetPart,
  )
{
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { position: { height: 600, width: 800 } };

  /** @type {Record<string, HandlebarsTemplatePart>} */
  static PARTS = {
    all: {
      scrollable: [".actor-sidebar", ".actor-tab-content"],
      template: "systems/teriock/src/templates/sheets/actors/playable/playable.hbs",
    },
  };

  /** @inheritDoc */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    if (this.document.species.length === 0) {
      ui.notifications.warn("TERIOCK.SHEETS.Actor.NOTIFICATIONS.noSpecies", {
        format: { compendium: _loc(game.packs.get("teriock.species").title), name: this.document.name },
        localize: true,
      });
    }
  }
}
