import { mix } from "../../../../helpers/utils.mjs";
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
 * @mixes TakingActorSheetPart
 * @mixes TradecraftsActorSheetPart
 */
export default class TeriockPlayableActorSheet extends mix(
  BaseActorSheet,
  parts.AvatarImageActorSheetPart,
  parts.CombatActorSheetPart,
  parts.ConditionsActorSheetPart,
  parts.MechanicalActorSheetPart,
  parts.RollingActorSheetPart,
  parts.SidebarActorSheetPart,
  parts.TabsActorSheetPart,
  parts.TakingActorSheetPart,
  parts.TradecraftsActorSheetPart,
) {
  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/actor-templates/playable-template/playable-template.hbs",
      scrollable: [".character-sidebar-container", ".character-tab-content"],
    },
  };

  /** @inheritDoc */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    if (this.document.species.length === 0) {
      ui.notifications.warn(
        `${this.document.name} has no species. Add one from the "Species" compendium.`,
      );
    }
  }
}
