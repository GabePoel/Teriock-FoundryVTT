import { migrateHierarchy } from "../../../shared/migrations/migrate-hierarchy.mjs";

/**
 * Ability hierarchy part.
 * @param {typeof TeriockAbilityModel} Base
 * @constructor
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @mixin
     */
    class AbilityHierarchyPart extends Base {
      /** @inheritDoc */
      static migrateData(data) {
        migrateHierarchy(data);
        super.migrateData(data);
      }

      /** @inheritDoc */
      get makeSuppressed() {
        let suppressed = super.makeSuppressed;
        if (!suppressed && this.parent.isReference) {
          suppressed = true;
        }
        if (!suppressed && this.parent.parent.type === "equipment") {
          if (!suppressed && !this.parent.parent.system.equipped) {
            suppressed = true;
          }
          if (
            !suppressed &&
            this.parent.parent.system.dampened &&
            this.form !== "intrinsic"
          ) {
            suppressed = true;
          }
          if (!suppressed && this.form !== "intrinsic") {
            const isAttuned = this.parent.parent.system.isAttuned;
            suppressed = !isAttuned;
          }
        }
        if (!suppressed && this.actor && this.parent.sup) {
          const sups = this.parent.allSups;
          if (sups.some((sup) => !sup.modifiesActor)) {
            suppressed = true;
          }
        }
        return suppressed;
      }
    }
  );
};
