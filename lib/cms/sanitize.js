import { defaultForField } from "./schema";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function trimText(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

/**
 * Image values must point at a WebP file — local paths and remote URLs
 * alike (query strings and hashes are ignored). The site is served as
 * WebP only, and the files are hosted on our own storage later, so the
 * format is enforced at save time rather than trusted.
 */
export function isWebpPath(value) {
  const clean = String(value ?? "")
    .split(/[?#]/)[0]
    .toLowerCase();
  return clean.endsWith(".webp");
}

function sanitizeValue(field, input, path, errors) {
  if (input === undefined) input = defaultForField(field);

  switch (field.type) {
    case "object": {
      const source =
        input && typeof input === "object" && !Array.isArray(input) ? input : {};
      return sanitizeFields(field.fields ?? [], source, path, errors);
    }
    case "repeater": {
      if (!Array.isArray(input)) return [];
      return input.map((item, index) =>
        sanitizeFields(
          field.fields ?? [],
          item && typeof item === "object" ? item : {},
          `${path}.${index}`,
          errors,
        ),
      );
    }
    case "list": {
      if (!Array.isArray(input)) return [];
      return input
        .map((item, index) => {
          if (field.itemType === "image") {
            return trimText(item, 2048);
          }
          return trimText(item, field.itemType === "textarea" ? 20000 : 1000);
        })
        .filter((item) => item !== "");
    }
    case "multiReference": {
      if (!Array.isArray(input)) return [];
      return Array.from(
        new Set(
          input
            .map((item) => trimText(item, 160))
            .filter((item) => item !== ""),
        ),
      );
    }
    case "boolean":
      return Boolean(input);
    case "number": {
      if (input === "" || input === null || input === undefined) return null;
      const value = Number(input);
      if (!Number.isFinite(value)) {
        errors[path] = `${field.label || "Value"} must be a number.`;
        return field.default ?? null;
      }
      if (field.min !== undefined && value < field.min) {
        errors[path] = `${field.label || "Value"} must be at least ${field.min}.`;
      }
      return value;
    }
    case "select": {
      const value = trimText(input, 80);
      const allowed = (field.options ?? []).map((option) => option.value);
      if (!allowed.includes(value)) {
        if (field.required) {
          errors[path] = `${field.label || "Value"} is required.`;
        }
        return field.default ?? allowed[0] ?? "";
      }
      return value;
    }
    case "slug": {
      const value = slugify(input);
      if (!value && field.required) {
        errors[path] = `${field.label || "Slug"} is required.`;
      } else if (value && !SLUG_PATTERN.test(value)) {
        errors[path] = `${field.label || "Slug"} is not valid.`;
      }
      return value;
    }
    case "readonly":
      return trimText(input, 160);
    case "image": {
      const value = trimText(input, 2048);
      if (field.required && !value) {
        errors[path] = `${field.label || "Value"} is required.`;
      } else if (value && !isWebpPath(value)) {
        errors[path] = `${field.label || "Image"} must be a .webp file.`;
      }
      return value;
    }
    case "url": {
      const value = trimText(input, 2048);
      if (field.required && !value) {
        errors[path] = `${field.label || "Value"} is required.`;
      }
      return value;
    }
    case "textarea": {
      const value = trimText(input, 20000);
      if (field.required && !value) {
        errors[path] = `${field.label || "Value"} is required.`;
      }
      return value;
    }
    default: {
      const value = trimText(input, 1000);
      if (field.required && !value) {
        errors[path] = `${field.label || "Value"} is required.`;
      }
      return value;
    }
  }
}

export function sanitizeFields(fields, input, prefix = "", errors = {}) {
  const source =
    input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const output = {};

  for (const field of fields) {
    const path = prefix ? `${prefix}.${field.name}` : field.name;
    output[field.name] = sanitizeValue(field, source[field.name], path, errors);
  }

  return output;
}

export function sanitizeInput(fields, input) {
  const errors = {};
  const value = sanitizeFields(fields, input, "", errors);
  return { value, errors };
}

export function normalizeResource(schema, input, { creating = false } = {}) {
  const { value, errors } = sanitizeInput(schema.fields, input);

  if (creating && !value.slug) {
    const sourceField = schema.fields.find((field) => field.type === "slug");
    const source = sourceField?.source ? value[sourceField.source] : value.name;
    value.slug = slugify(source);
    if (!value.slug) errors.slug = "Slug is required.";
    else delete errors.slug;
  }

  if (value.slug && !SLUG_PATTERN.test(value.slug)) {
    errors.slug = "Use lowercase letters, numbers and hyphens only.";
  }

  if (creating) {
    for (const field of schema.fields) {
      if (field.type === "reference" && field.required && !value[field.name]) {
        errors[field.name] = `${field.label} is required.`;
      }
    }
  }

  return { value, errors };
}
