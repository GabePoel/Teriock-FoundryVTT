import { icons } from "../../../constants/display/_module.mjs";
import { dedent } from "../../../helpers/string.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import { competenceField } from "../../fields/helpers/builders.mjs";
import TypedPseudoDocument from "../abstract/typed-pseudo-document.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {Teriock.Models.BaseAutomationInterface}
 */
export default class BaseAutomation extends TypedPseudoDocument {
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, {
      documentName: "Automation",
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      competencies: new fields.SetField(competenceField()),
    });
  }

  /**
   * Paths to forms to display in the editor.
   * @returns {string[]}
   */
  get _formPaths() {
    return [];
  }

  /**
   * Whether this is active and should be included in the overall effect.
   * @returns {boolean}
   */
  get active() {
    return this.competent;
  }

  /**
   * Whether the competence requirements for this to be active are met.
   * @returns {boolean}
   */
  get competent() {
    return this.competencies.has(this.parent.competence.value);
  }

  /**
   * Forms that go into the simple editor for this impact.
   * @returns {Promise<string>}
   */
  async _getEditorForms() {
    let html = "";
    for (const fp of this._formPaths) {
      const field = this.schema.getField(fp);
      const formGroup = field.toFormGroup(
        { rootId: this.uuid },
        {
          name: `${this.fieldPath}.${this.id}.${fp}`,
          value: foundry.utils.getProperty(this, fp),
        },
      );
      html += formGroup.outerHTML;
    }
    return html;
  }

  /**
   * Anything that happens automatically when the parent document is used.
   * @returns {Promise<void>}
   */
  async execute() {}

  /**
   * A simple editor for this impact.
   * @returns {Promise<string>}
   */
  async getEditor() {
    return dedent(`
      <fieldset>
        <legend>${this.label}
          <i 
            class="${makeIconClass(icons.ui.delete, "solid")}" 
            data-action="deleteImpact" 
            data-id="${this.id}"
          ></i>
        </legend>
        ${await this._getEditorForms()}
      </fieldset>
    `);
  }
}
