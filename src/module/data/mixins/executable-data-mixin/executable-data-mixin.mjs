const { fields } = foundry.data;

/**
 * @param {typeof ChildTypeModel} Base
 * @constructor
 */
export default function ExecutableDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {ExecutableDataMixinInterface}
     * @extends {ChildTypeModel}
     * @mixin
     */
    class ExecutableData extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          macros: new fields.SetField(new fields.DocumentUUIDField()),
        });
        return schema;
      }

      /**
       * Unlink a macro.
       * @param {UUID<TeriockMacro>} uuid
       * @returns {Promise<void>}
       */
      async unlinkMacro(uuid) {
        const macroUuids = new Set(Array.from(this.macros));
        macroUuids.delete(uuid);
        const updateData = {
          "system.macros": Array.from(macroUuids),
        };
        await this.parent.update(updateData);
      }

      /** @inheritDoc */
      async use(options = {}) {
        await super.use(options);
        const macroPromises = Array.from(
          this.macros.map((uuid) => fromUuid(uuid)),
        );
        const macros =
          /** @type {TeriockMacro[]} */ await Promise.all(macroPromises);
        for (const macro of macros) {
          await macro.execute({
            actor: this.actor,
            document: this.parent,
          });
        }
      }
    }
  );
}
