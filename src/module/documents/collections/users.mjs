import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { Users } = foundry.documents.collections;

//noinspection JSClosureCompilerSyntax,JSValidateJSDoc
/**
 * @implements {TypeCollection<TeriockUser, TeriockUser>}
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
      failPrefix = game.i18n.localize("TERIOCK.SYSTEMS.User.QUERY.failPrefix"),
      failReason = game.i18n.localize("TERIOCK.SYSTEMS.User.QUERY.failReason"),
      failMessage = "",
    } = queryOptions;
    if (queryOptions.localize) {
      if (queryOptions.format && Object.keys(queryOptions.format).length > 0) {
        failPrefix = game.i18n.format(failPrefix, queryOptions.format);
        failReason = game.i18n.format(failReason, queryOptions.format);
      } else {
        failPrefix = game.i18n.localize(failPrefix);
        failReason = game.i18n.localize(failReason);
      }
    }
    if (!failMessage) {
      failMessage = game.i18n.format("TERIOCK.SYSTEMS.User.QUERY.failFormat", {
        prefix: failPrefix,
        reason: failReason,
      });
    }
    if (!this.activeGM && notifyFailure) {
      ui.notifications.warn(failMessage, {
        localize: queryOptions.localize,
        format: queryOptions.format,
      });
    }
    return await this.activeGM?.query(queryName, queryData, queryOptions);
  }
}
