import { validateTypedIdentifier } from "../../data/fields/tools/validators.mjs";
import { listFormat } from "../../helpers/localization.mjs";
import { getTypeLabel, isKebabCase, parseIdentifier, toKebabCase } from "../../utils/_module.mjs";
import { AbstractAutocompleteSuggestionsElement, TagSetMixin } from "./abstract/_module.mjs";

const { fromUuid } = foundry.utils;

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 * @import { AutocompleteSuggestionsInputConfig } from "./abstract/abstract-autocomplete-suggestions.mjs";
 * @import { TagSetInputConfig } from "./abstract/tag-set-mixin.mjs";
 */

/**
 * @typedef IdentifierTagsInputConfig
 * @property {string[]} [types] - Allowed type prefixes for typed identifiers.
 */

/**
 * A custom HTMLElement used to render a set of associated documents referenced by identifier.
 */
export default class HTMLIdentifierTagsElement extends TagSetMixin(AbstractAutocompleteSuggestionsElement) {
  /** @inheritDoc */
  static icons = { ...super.icons, add: "fa-solid fa-magnifying-glass-plus" };

  /** @inheritDoc */
  static labels = {
    ...super.labels,
    add: "TERIOCK.ELEMENTS.IDENTIFIER_TAGS.add",
    remove: "TERIOCK.ELEMENTS.IDENTIFIER_TAGS.remove",
  };

  /** @inheritDoc */
  static tagName = "identifier-tags";

  /**
   * Create a HTMLIdentifierTagsElement using provided configuration data.
   * @param {FormInputConfig & IdentifierTagsInputConfig & TagSetInputConfig & AutocompleteSuggestionsInputConfig} config
   * @returns {HTMLIdentifierTagsElement}
   */
  static create(config) {
    const types = config.types ?? [];
    config.placeholder ||= _loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.placeholder", {
      type: types.length ? types.map(t => getTypeLabel(t) ?? t).join(", ") : _loc("TERIOCK.COMMON.Identifier"),
    });
    const tags = super.create(config);
    tags.types = types;
    this._appendSuggestions(tags, config.options);
    return tags;
  }

  /**
   * Restrict identifiers to only certain type prefixes.
   * @return {string[]}
   */
  get types() {
    const attr = this.getAttribute("types");
    if (!attr) { return []; }
    return attr.split(",").map(t => t.trim()).filter(Boolean);
  }

  /** @param {string[]} value */
  set types(value) {
    if (!value?.length) {
      this.removeAttribute("types");
      return;
    }
    for (const type of value) {
      if (!isKebabCase(type)) { throw new Error(`"${type}" is not a valid identifier type.`); }
    }
    this.setAttribute("types", value.map(v => v.trim()).filter(Boolean).join(","));
  }

  /** @inheritDoc */
  _activateListeners() {
    super._activateListeners();
  }

  /** @inheritDoc */
  _formatInput(value) {
    // Keep the colon and hyphen at the end of the text.
    const [type, ...rest] = value.split(":");
    const identifier = rest.length ? rest.join("-") : type;
    const kebab = toKebabCase(identifier);
    const formatted = kebab && /[^a-z0-9']$/i.test(identifier) ? `${kebab}-` : kebab;
    return rest.length ? `${toKebabCase(type)}:${formatted}` : formatted;
  }

  /** @inheritDoc */
  _onClickButton() {
    this._tryAdd(this._primaryInput.value);
  }

  /** @inheritDoc */
  _onDropData(data) {
    if (data.identifier) {
      this._tryAdd(data.identifier);
      return;
    }
    if (data.uuid) {
      fromUuid(data.uuid).then(d => {
        const identifier = d?.typedIdentifier;
        if (identifier) { this._tryAdd(identifier); }
        else { ui.notifications.error("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.noIdentifier", { localize: true }); }
      });
      return;
    }
    ui.notifications.error("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.noIdentifier", { localize: true });
  }

  /** @inheritDoc */
  _onSelectSuggestion(identifier) {
    this._tryAdd(identifier);
  }

  /** @inheritDoc */
  _resolveTag(identifier) {
    identifier = identifier.split(":").map(part => toKebabCase(part)).join(":");
    if (!identifier) { throw new Error(_loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.errorBlank")); }
    const types = this.types;
    if (!validateTypedIdentifier(identifier, { types })) {
      const parsed = parseIdentifier(identifier);
      if (!parsed.type) { throw new Error(_loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.errorRequireType")); }
      if (types.length) {
        throw new Error(
          _loc("TERIOCK.ELEMENTS.IDENTIFIER_TAGS.errorWrongType", {
            provided: parsed.type,
            required: listFormat(types, { type: "disjunction" }),
          }),
        );
      }
      throw new Error(_loc("TERIOCK.SYSTEMS.Rules.FIELDS.identifier.validationError"));
    }
    return [identifier, game.teriock.identifiers.getName(identifier) ?? identifier];
  }
}
