export default function createDocumentProxy(typeMappings, baseClass) {
  return new Proxy(function () { }, {
    construct: function (target, args) {
      const [data] = args;
      if (!typeMappings.hasOwnProperty(data.type)) {
        throw new Error(`Unknown type: ${data.type}`);
      }
      return new typeMappings[data.type](...args);
    },
    get: function (target, prop, receiver) {
      switch (prop) {
        case "create":
        case "createDocuments":
          return function (data, options) {
            if (Array.isArray(data)) {
              return data.map(i => baseClass.create(i, options));
            }
            if (!typeMappings.hasOwnProperty(data.type)) {
              throw new Error(`Unknown type: ${data.type}`);
            }
            return typeMappings[data.type].create(data, options);
          }
        case Symbol.hasInstance:
          return function (instance) {
            return Object.values(typeMappings).some(cls => instance instanceof cls);
          };
        default:
          return baseClass[prop];
      }
    },
  });
}