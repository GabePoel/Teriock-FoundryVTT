import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Users } = foundry.documents.collections;

//noinspection JSClosureCompilerSyntax,JSValidateJSDoc
/**
 * @extends {WorldCollection<TeriockUser>}
 * @extends {Users}
 * @property {TeriockUser|null} activeGM
 */
export default class TeriockUsers extends BaseWorldCollectionMixin(Users) {
  /**
   * The currently active users.
   * @returns {TeriockUser[]}
   */
  get active() {
    return this.filter((u) => u.active);
  }

  /**
   * Helper function to send a query to the active GM if there is one.
   * @param {Teriock.QueryData.QueryName} queryName
   * @param {object} queryData
   * @param {Partial<Teriock.QueryData.QueryOptions>} [queryOptions]
   * @returns {Promise<any>}
   */
  async queryGM(queryName, queryData, queryOptions = {}) {
    let {
      notifyFailure = true,
      failPrefix = _loc("TERIOCK.SYSTEMS.User.QUERY.failPrefix"),
      failReason = _loc("TERIOCK.SYSTEMS.User.QUERY.failReason"),
      failMessage = "",
    } = queryOptions;
    if (queryOptions.localize) {
      if (queryOptions.format && Object.keys(queryOptions.format).length > 0) {
        failPrefix = _loc(failPrefix, queryOptions.format);
        failReason = _loc(failReason, queryOptions.format);
      } else {
        failPrefix = _loc(failPrefix);
        failReason = _loc(failReason);
      }
    }
    if (!failMessage) {
      failMessage = _loc("TERIOCK.SYSTEMS.User.QUERY.failFormat", {
        prefix: failPrefix,
        reason: failReason,
      });
    }
    if (!this.activeGM && notifyFailure) {
      ui.notifications.warn(failMessage, {
        format: queryOptions.format,
        localize: queryOptions.localize,
      });
    }
    return await this.activeGM?.query(queryName, queryData, queryOptions);
  }
}
