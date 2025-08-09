declare global {
  namespace Teriock.Wiki {
    /**
     * Options for pulling data from https://wiki.teriock.com.
     *
     * @property notify - If true, display notifications for the pull process.
     */
    export type PullOptions = {
      notify?: boolean;
    };
  }
}

export {};
