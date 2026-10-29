const { Autocomplete } = foundry.applications.ux;

/**
 * @import { ApplicationPosition } from "@client/applications/_types.mjs";
 * @import { AutocompleteEntry } from "@client/applications/ux/_types.mjs";
 */

/** @inheritDoc */
export default class TeriockAutocomplete extends Autocomplete {
  /**
   * @inheritDoc
   * @param {HTMLElement} target
   * @param {(AutocompleteEntry & { hint?: string })[]} entries - Entries with a `hint` show it faded on the right.
   * @param {object} [options]
   * @param {string} [options.prefix]
   * @param {Partial<ApplicationPosition>} [options.position] - A `width` also sizes the menu. Without a `top`, the
   * menu opens upwards when there is more room above the target than below it.
   */
  activate(target, entries, options = {}) {
    const flip = options.position?.top === undefined;
    super.activate(target, entries, options);
    if (!target || !entries?.length) { return; }
    const width = options.position?.width;
    this.element.style.width = width ? `${width}px` : "";
    for (const [i, item] of [...this.element.children].entries()) {
      if (entries[i].hint) { item.dataset.hint = entries[i].hint; }
    }
    if (!flip) { return; }
    const { bottom, top } = target.getBoundingClientRect();
    const { height } = this.element.getBoundingClientRect();
    if (bottom + height > window.innerHeight && top > window.innerHeight - bottom) {
      this.element.style.top = `${Math.max(top - height, 0)}px`;
    }
  }
}
