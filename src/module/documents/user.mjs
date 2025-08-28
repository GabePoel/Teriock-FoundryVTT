import { BaseTeriockUser } from "./_base.mjs";

export default class TeriockUser extends BaseTeriockUser {
  /**
   * Is this user currently active?
   * @returns {boolean}
   */
  get isActive() {
    return this.lastActivityTime - game.time.serverTime < 120;
  }
}
