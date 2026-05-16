import type { Types } from "mongoose";

type MongoObject = {
  _id?: Types.ObjectId | string;
  __v?: number;
  [key: string]: unknown;
};

function stringifyId(value: unknown) {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.toString();
}

export function serializeMongo<T extends MongoObject>(doc: T) {
  const rest = { ...doc };
  const id = rest._id;
  delete rest._id;
  delete rest.__v;
  const serialized = serializeNested(rest) as Record<string, unknown>;

  return {
    ...serialized,
    id: stringifyId(id),
  };
}

function serializeNested(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(serializeNested);
  }

  if (!value || typeof value !== "object" || value instanceof Date) {
    return value;
  }

  if (typeof (value as { toHexString?: unknown }).toHexString === "function") {
    return value.toString();
  }

  const object = { ...(value as MongoObject) };
  const id = object._id;
  delete object._id;
  delete object.__v;

  const serialized = Object.fromEntries(
    Object.entries(object).map(([key, nestedValue]) => [key, serializeNested(nestedValue)])
  ) as Record<string, unknown>;

  if (id) {
    serialized.id = stringifyId(id);
  }

  return serialized;
}

export function serializeDocument<T extends { toObject: () => MongoObject }>(doc: T) {
  return serializeMongo(doc.toObject());
}

export function serializeDocuments<T extends { toObject: () => MongoObject }>(docs: T[]) {
  return docs.map(serializeDocument);
}
