declare module "./construction-node.mjs" {
  export default interface ConstructionNode {
    delta: object;
    parentId: ID<ConstructionNode>;
  }
}

export {};
