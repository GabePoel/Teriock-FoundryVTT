import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Users } = foundry.documents.collections;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Collection<ID<TeriockUser>, TeriockUser>}
 * @implements {DocumentCollection<TeriockUser>}
 * @property {TeriockUser|null} activeGM
 */
export default class TeriockUsers extends BaseWorldCollectionMixin(Users) {
  /**
   * Helper function to send a query to the active GM if there is one.
   * @param {Teriock.QueryData.QueryName} queryName
   * @param {object} queryData
   * @param {Teriock.QueryData.QueryOptions} [queryOptions]
   * @returns {Promise<any>}
   */
  async queryGM(queryName, queryData, queryOptions) {
    let {
      notifyFailure = true,
      failPrefix = "Could not complete query.",
      failReason = "No GM is currently signed in.",
      failMessage = "",
    } = queryOptions;
    if (!failMessage) {
      failMessage = `${failPrefix} ${failReason}`;
    }
    if (!this.activeGM && notifyFailure) {
      ui.notifications.warn(failMessage);
    }
    return await this.activeGM?.query(queryName, queryData, queryOptions);
  }
}
