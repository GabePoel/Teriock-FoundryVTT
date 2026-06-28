const { Notifications } = foundry.applications.ui;

/** @inheritDoc */
export default class TeriockNotifications extends Notifications {
  /**
   * Display a notification with the "morganti" type.
   * @param {string|object} message - The content of the morganti message
   * @param {NotificationOptions} [options] - Notification options passed to the notify function
   * @returns {Readonly<Notification>} - The registered notification
   * @see {@link notify}
   */
  morganti(message, options) {
    return this.notify(message, "morganti", options);
  }
}
