import { HTMLWebsiteTagsElement } from "../../applications/elements/_module.mjs";

const { StringField } = foundry.data.fields;

export default class WebsiteURLField extends StringField {
  /** @override */
  _toInput(config) {
    Object.assign(config, { type: this.type, single: true });
    return HTMLWebsiteTagsElement.create(config);
  }

  /** @override */
  _validateType(value) {
    return URL.canParse(value);
  }
}
