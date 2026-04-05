function getType(value) {
  if (Array.isArray(value)) {
    return "array";
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

function formatPath(path) {
  return path || "response body";
}

function validateSchema(value, schema, path = "") {
  const errors = [];

  if (!schema || typeof schema !== "object") {
    return errors;
  }

  if (schema.type) {
    const actualType = getType(value);
    if (actualType !== schema.type) {
      errors.push(
        `${formatPath(path)} should be ${schema.type} but received ${actualType}`,
      );
      return errors;
    }
  }

  if (schema.type === "object") {
    const required = schema.required || [];
    for (const key of required) {
      if (!(key in value)) {
        errors.push(`${formatPath(path)} is missing required property "${key}"`);
      }
    }

    if (schema.properties) {
      for (const [key, childSchema] of Object.entries(schema.properties)) {
        if (key in value) {
          errors.push(
            ...validateSchema(
              value[key],
              childSchema,
              path ? `${path}.${key}` : key,
            ),
          );
        }
      }
    }
  }

  if (schema.type === "array") {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(
        `${formatPath(path)} should contain at least ${schema.minItems} item(s)`,
      );
    }

    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(...validateSchema(item, schema.items, `${path}[${index}]`));
      });
    }
  }

  if (schema.const !== undefined && value !== schema.const) {
    errors.push(
      `${formatPath(path)} should be ${JSON.stringify(schema.const)} but received ${JSON.stringify(value)}`,
    );
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(
      `${formatPath(path)} should be one of ${schema.enum.join(", ")} but received ${JSON.stringify(value)}`,
    );
  }

  return errors;
}

function assertJsonSchema(value, schema) {
  const errors = validateSchema(value, schema);
  expect(errors).toEqual([]);
}

module.exports = {
  assertJsonSchema,
};
