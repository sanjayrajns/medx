const { Type } = require("@google/genai");

const labReportSchema = {
  type: Type.OBJECT,
  properties: {
    results: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          test_name: { type: Type.STRING },
          result: { type: Type.STRING },
          unit: { type: Type.STRING },
        },
        required: ["heading", "test_name", "result", "unit"],
      },
    },
  },
};

module.exports = { labReportSchema };