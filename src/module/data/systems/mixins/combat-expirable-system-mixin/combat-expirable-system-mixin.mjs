import { inCombatExpirationDialog } from "../../../../applications/dialogs/_module.mjs";

/**
 * @param {typeof BaseEffectSystem} Base
 */
export default function CombatExpirableSystemMixin(Base) {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @mixin
     */
    class CombatExpirableSystem extends Base {
      /**
       * Trigger in-combat expiration.
       * @param {boolean} [forceDialog] - Force a dialog to show up.
       * @returns {Promise<void>}
       */
      async inCombatExpiration(forceDialog = false) {
        await inCombatExpirationDialog(this.parent, forceDialog);
      }
    }
  );
}
