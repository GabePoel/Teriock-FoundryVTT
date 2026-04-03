import { iconStyles } from "../constants/display/icon-styles.mjs";

declare global {
  namespace Teriock.UI {
    /** Three-way toggle */
    export type ThreeToggle = -1 | 0 | 1;

    /** Icon style */
    export type IconStyle = keyof typeof iconStyles;

    /** Parameters to construct an HTML button. */
    export type HTMLButtonConfig = {
      classes?: string[];
      dataset?: Record<string, string>;
      disabled?: boolean;
      icon?: string;
      label?: string;
      type?: "button";
    };

    /** Icon category */
    export type IconCategory = keyof typeof TERIOCK.display.iconManifest;
  }
}
