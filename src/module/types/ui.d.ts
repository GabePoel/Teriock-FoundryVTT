import { iconStyles } from "../constants/display/icon-styles.mjs";

declare global {
  namespace Teriock.UI {
    /** Three-way toggle */
    export type ThreeToggle = -1 | 0 | 1;

    /** Icon style */
    export type IconStyle = keyof typeof iconStyles;

    /** Icon category */
    export type IconCategory = keyof typeof TERIOCK.display.iconManifest;
  }
}
