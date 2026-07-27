import { TypedIdentifierField } from "../../data/fields/_module.mjs";

const { TableResultConfig } = foundry.applications.sheets;

/** @inheritDoc */
export default class TeriockTableResultConfig extends TableResultConfig {
  /** @inheritDoc */
  static prepareResultUpdateData(data) {
    if (data.type === "text") {
      foundry.utils.setProperty(data, "flags.teriock.documentIdentifier", null);
    }
    super.prepareResultUpdateData(data);
    if (foundry.utils.hasProperty(data, "flags.teriock.documentIdentifier") && !data.documentUuid) {
      const doc = game.teriock.identifiers.fromIdentifierSync(
        foundry.utils.getProperty(data, "flags.teriock.documentIdentifier"),
      );
      if (doc) {
        data.name = doc.name ?? "";
        data.img = doc.img ?? null;
      }
    }
  }

  /** @inheritDoc */
  _onChangeForm(formConfig, event) {
    super._onChangeForm(formConfig, event);
    if (event.target === this.form.elements.type) {
      const group = this.form.elements["flags.teriock.documentIdentifier"]?.closest(".form-group");
      if (group) { group.hidden = event.target.value === "text"; }
    }
  }

  /** @inheritDoc */
  _prepareSubmitData(event, form, formData, updateData) {
    const submitData = super._prepareSubmitData(event, form, formData, updateData);
    this.constructor.prepareResultUpdateData(submitData);
    return submitData;
  }

  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    const documentUuidGroup = result.sheet?.querySelector(".form-group:has(document-tags[name=\"documentUuid\"])");
    if (documentUuidGroup) {
      const field = new TypedIdentifierField({
        hint: _loc("TERIOCK.SHEETS.TableResult.documentIdentifier.hint"),
        label: _loc("TERIOCK.SHEETS.TableResult.documentIdentifier.label"),
      });
      documentUuidGroup.after(
        field.toFormGroup({ rootId: this.id }, {
          hidden: this.document.type === "text",
          name: "flags.teriock.documentIdentifier",
          rootId: this.id,
          value: this.document.getFlag("teriock", "documentIdentifier") ?? null,
        }),
      );
    }
    super._replaceHTML(result, content, options);
  }
}
