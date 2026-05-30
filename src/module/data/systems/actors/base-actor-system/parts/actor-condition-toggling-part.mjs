/**
 * Actor data model mixin that handles condition toggling.
 * @param {typeof BaseActorSystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {CommonSystem}
     */
    class ActorConditionTogglingPart extends Base {
      /** @inheritDoc */
      getRollData() {
        const data = super.getRollData();
        for (const s of this.parent.statuses) { data[`status.${s}`] = 1; }
        return data;
      }

      /**
       * Remove the status and all consequences that provide it. Intended to be used with conditions, but all
       * statuses work.
       * @param {Teriock.Keys.Status} status
       * @returns {Promise<void>}
       */
      async removeCondition(status) {
        await this.parent.toggleStatusEffect(status, { active: false });
        const toRemove = this.parent.consequences.filter(c => c.statuses.has(status)).map(c => c.id);
        await this.parent.deleteEmbeddedDocuments("ActiveEffect", toRemove);
      }
    }
  );
};
