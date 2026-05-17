import { mixClasses } from "../../../../helpers/construction.mjs";
import BaseActorSheet from "./base-actor-sheet.mjs";
import * as parts from "./parts/_module.mjs";

//noinspection JSUnresolvedReference,JSClosureCompilerSyntax
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
export default class TeriockPlayableActorSheet extends mixClasses(
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
) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["character"],
    form: { submitOnChange: true },
    position: { width: 800, height: 600 },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template: "systems/teriock/src/templates/sheets/actors/playable/playable.hbs",
      scrollable: [".character-sidebar", ".character-tab-content"],
    },
  };

  /** @inheritDoc */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    if (this.document.species.length === 0) {
      ui.notifications.warn("TERIOCK.SHEETS.Actor.NOTIFICATIONS.noSpecies", {
        format: {
          name: this.document.name,
          compendium: _loc(game.packs.get("teriock.species").title),
        },
        localize: true,
      });
    }
  }
}
