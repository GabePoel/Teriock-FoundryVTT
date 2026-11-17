import { toSlug } from "../../utils/_module.mjs";
import { AbstractAutocompleteSuggestionsElement, TagSetMixin } from "./abstract/_module.mjs";

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 * @import { AutocompleteSuggestionsInputConfig } from "./abstract/abstract-autocomplete-suggestions.mjs";
 * @import { TagSetInputConfig } from "./abstract/tag-set-mixin.mjs";
 */

/**
 * A custom HTMLElement used to render a set of slugs.
 * @category Identifiers
 */
export default class HTMLSlugTagsElement extends TagSetMixin(AbstractAutocompleteSuggestionsElement) {
  /** @inheritDoc */
  static tagName = "slug-tags";

  /**
   * Create a HTMLSlugTagsElement using provided configuration data.
   * @param {FormInputConfig & TagSetInputConfig & AutocompleteSuggestionsInputConfig} config
   * @returns {HTMLSlugTagsElement}
   */
  static create(config) {
    const tags = super.create(config);
    this._appendSuggestions(tags, config.options);
    return tags;
  }

  /** @inheritDoc */
  _formatInput(value) {
    return toSlug(value, { partial: true });
  }

  /** @inheritDoc */
  _onClickButton() {
    this._tryAdd(this._primaryInput.value);
  }

  /** @inheritDoc */
  _onSelectSuggestion(slug) {
    this._tryAdd(slug);
  }

  /** @inheritDoc */
  _resolveTag(slug) {
    slug = toSlug(slug);
    if (!slug) { throw new Error(_loc("TERIOCK.ELEMENTS.SLUG_TAGS.errorBlank")); }
    return [slug, this._getSuggestionLabel(slug) ?? slug];
  }
}
