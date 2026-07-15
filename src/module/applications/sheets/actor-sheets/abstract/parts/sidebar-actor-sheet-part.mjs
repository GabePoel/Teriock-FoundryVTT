import { TeriockContextMenu } from "../../../../ux/_module.mjs";

/**
 * @param {typeof BaseActorSheet} Base
 */
export default function SidebarActorSheetPart(Base) {
  return (
    /**
     * @extends {BaseActorSheet}
     * @mixin
     */
    class SidebarActorSheetPart extends Base {
      /**
       * Reset attack penalty to zero.
       * @returns {Promise<void>}
       */
      static async #onResetAttackPenalty() {
        await this.document.update({ "system.combat.attackPenalty": 0 });
      }

      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: { resetAttackPenalty: { buttons: [2], handler: this.#onResetAttackPenalty } },
      };

      /**
       * Creates a context menu for selecting piercing type.
       * Provides options for none, AV0, and UB piercing types.
       * @returns {ContextMenuEntry[]}
       */
      #piercingContextMenu() {
        return TeriockContextMenu.makeUpdateEntries(
          this.actor,
          Object.entries(TERIOCK.config.piercing.levels).map(([k, v]) => {
            return { icon: v.icon, label: v.label, value: k };
          }),
          { path: "system.offense.piercing.raw" },
        );
      }

      /**
       * Creates a context menu for selecting scaling type.
       * @returns {ContextMenuEntry[]}
       */
      #scalingContextMenu() {
        return TeriockContextMenu.makeUpdateEntries(this.actor, [{
          icon: TERIOCK.display.icons.document.rank,
          label: _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Scaling.type.lvl"),
          value: false,
        }, {
          icon: TERIOCK.display.icons.species.br,
          label: _loc("TERIOCK.SHEETS.Actor.SIDEBAR.Scaling.type.br"),
          value: true,
        }], { path: "system.scaling.brScale" });
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);

        this._connectContextMenu(".actor-piercing-box", this.#piercingContextMenu());
        this._connectContextMenu(".actor-basics", this.#scalingContextMenu(), {
          eventName: "contextmenu",
          forceDirection: "down",
        });
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        return Object.assign(await super._prepareContext(options), { takeStatButtons: true });
      }
    }
  );
}
