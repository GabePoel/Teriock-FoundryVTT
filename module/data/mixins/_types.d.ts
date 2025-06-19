import type TypeDataModel from "@common/abstract/type-data.mjs";

export interface ChildDataMixin extends TypeDataModel {
  proficient: boolean;
  fluent: boolean;
  font: string;
  description: string;
}
