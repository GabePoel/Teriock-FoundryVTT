export default (Base) => {
  //noinspection JSClosureCompilerSyntax,JSUnusedGlobalSymbols
  return (
    /**
     * @extends TeriockBaseActorData
     */
    class ActorConditionTogglingPart extends Base {
      /**
       * Add the condition if no consequence provides it.
       * @param status
       * @returns {Promise<void>}
       */
      async addCondition(status) {
        if (!this.parent.statuses.has(status)) {
          await this.parent.toggleStatusEffect(status, { active: true });
        }
      }

      /**
       * Remove the condition and all consequences that provide it.
       * @param {Teriock.Parameters.Condition.ConditionKey} status
       * @returns {Promise<void>}
       */
      async removeCondition(status) {
        await this.parent.toggleStatusEffect(status, { active: false });
        const toRemove = this.parent.consequences
          .filter((c) => c.statuses.has(status))
          .map((c) => c.id);
        await this.parent.deleteEmbeddedDocuments("ActiveEffect", toRemove);
      }

      /**
       * Toggle the condition.
       * @param {Teriock.Parameters.Condition.ConditionKey} status
       * @param {boolean} [active]
       * @returns {Promise<void>}
       */
      async toggleCondition(status, active) {
        if (active || !this.parent.statuses.has(status)) {
          await this.addCondition(status);
        } else {
          await this.removeCondition(status);
        }
      }
    }
  );
};
