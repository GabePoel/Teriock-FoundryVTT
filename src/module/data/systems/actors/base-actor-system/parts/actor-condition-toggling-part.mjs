/**
 * Actor data model mixin that handles condition toggling.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {CommonSystem}
     */
    class ActorConditionTogglingPart extends Base {
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
    }
  );
};
