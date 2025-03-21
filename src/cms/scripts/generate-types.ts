import fs from "fs";
import path from "path";

import pluralize from "pluralize";

import { isKebabCase, pascalCase } from "../../utils";

import { REFERENCE_MAP } from "../constants";
import {
  MicroCMSApiFieldType,
  MicroCMSApiSchema,
  MicroCMSCustomField,
  MicroCMSRelationField,
  MicroCMSRelationListField,
  MicroCMSRepeaterField,
  MicroCMSSelectField,
} from "../types";

export const convertSchema = (name: string, schema: MicroCMSApiSchema) => {
  const { customFields, apiFields } = schema;
  const customs = Object.fromEntries(
    customFields.map(({ fieldId, createdAt }) => [createdAt, fieldId]),
  );

  const getKindType = (fields: MicroCMSApiFieldType) => {
    const { kind } = fields;
    const types: Record<MicroCMSApiFieldType["kind"], () => string> = {
      text: () => "string",
      textArea: () => "string",
      richEditor: () => "string",
      richEditorV2: () => "string",
      number: () => "number",
      select: () => {
        const { selectItems: list, multipleSelect } = fields as MicroCMSSelectField;
        const str = list!.reduce((a, rep, index) => `${a}${index ? " | " : ""}'${rep.value}'`, "");
        if (multipleSelect) return list!.length > 1 ? `(${str})[]` : `${str}[]`;
        return `[${str}]`;
      },
      relation: () => {
        const { referenceDisplayItem } = fields as MicroCMSRelationField;
        const referenceType = referenceDisplayItem
          ? REFERENCE_MAP[referenceDisplayItem]
          : "unknown";
        return `MicroCMSRelation<${referenceType} | null>`;
      },
      relationList: () => {
        const { referenceDisplayItem } = fields as MicroCMSRelationListField;
        const referenceType = referenceDisplayItem
          ? REFERENCE_MAP[referenceDisplayItem]
          : "unknown";
        return `MicroCMSRelation<${referenceType} | null>[]`;
      },
      boolean: () => "boolean",
      date: () => "string",
      media: () => "MicroCMSImage",
      mediaList: () => "MicroCMSImage[]",
      iframe: () => "unknown",
      file: () => "{ url: string }",
      custom: () => {
        const { customFieldCreatedAt } = fields as MicroCMSCustomField;
        return `${name}CustomField${pascalCase(customs[customFieldCreatedAt!])}`;
      },
      repeater: () => {
        const { customFieldCreatedAtList: list } = fields as MicroCMSRepeaterField;
        const str = list!.reduce(
          (a, rep, index) =>
            `${a}${index ? " | " : ""}${name}CustomField${pascalCase(customs[rep])}`,
          "",
        );
        return list!.length > 1 ? `(${str})[]` : `${str}[]`;
      },
    };
    return types[kind]?.() || "unknown";
  };

  const getDoc = (field: { name: string }) => {
    return `/**\n * ${field.name}\n */`;
  };

  const getFields = (fields: MicroCMSApiFieldType[]) => {
    return fields.map((fields) => {
      const { fieldId, required } = fields;
      const isKebabFieldId = isKebabCase(fieldId);
      return `${getDoc(fields)}\n${isKebabFieldId ? `"${fieldId}"` : fieldId}${
        !required ? "?" : ""
      }: ${getKindType(fields)}`;
    });
  };

  const getCustomFields = (fieldId: string, fields: MicroCMSApiFieldType[]) => {
    return [`${getDoc({ name: "fieldId" })}\nfieldId: '${fieldId}'`, ...getFields(fields)];
  };

  const mainSchema = getFields(apiFields);
  const customSchemas = Object.fromEntries(
    customFields.map(({ fieldId, fields }) => [fieldId, getCustomFields(fieldId, fields)]),
  );
  return { mainSchema, customSchemas };
};

const outSchema = (
  name: string,
  { mainSchema, customSchemas }: ReturnType<typeof convertSchema>,
) => {
  let buffer = `export type ${name} = {\n`;

  mainSchema.forEach((field) => {
    field.split("\n").forEach((s) => (buffer += `  ${s}\n`));
  });
  buffer += "}\n\n";

  Object.entries(customSchemas).forEach(([customName, fields]) => {
    buffer += `export type ${name}CustomField${pascalCase(customName)} = {\n`;
    fields.forEach((field) => {
      field.split("\n").forEach((s) => (buffer += `  ${s}\n`));
    });
    buffer += "}\n\n";
  });
  return buffer;
};

const generateSchemaImportStatements = (isRelation: boolean, isImage: boolean): string => {
  if (isRelation && isImage) {
    return `import { MicroCMSRelation, MicroCMSImage } from './microcms-schema';\n\n`;
  }
  if (isRelation) {
    return `import { MicroCMSRelation } from './microcms-schema';\n\n`;
  }
  if (isImage) {
    return `import { MicroCMSImage } from './microcms-schema';\n\n`;
  }

  return "";
};

const generateReferenceImportStatements = (schema: MicroCMSApiSchema, singleName: string) => {
  const importString = new Set<string>();
  schema.apiFields.forEach((field) => {
    if (field.kind === "relation" || field.kind === "relationList") {
      const referenceDisplayItem =
        field.kind === "relation" ? field.referenceDisplayItem : field.referenceDisplayItem;
      if (referenceDisplayItem && REFERENCE_MAP[referenceDisplayItem]) {
        const typeName = pascalCase(REFERENCE_MAP[referenceDisplayItem]);
        const pathName = REFERENCE_MAP[referenceDisplayItem].toLowerCase();

        if (pathName == singleName) return;
        importString.add(`import { ${typeName} } from './${pathName}';`);
      }
    }
  });
  // @ts-expect-error - microCMSのAPI型定義生成時に必要な型チェックの無視
  return [...importString].join("\n") + "\n\n";
};

const main = (dir: string, dest?: string) => {
  const files = fs.readdirSync(dir);
  const typeNames = new Map<string, string>();
  Array.from(files)
    .reverse()
    .forEach((file) => {
      const name = file.match(/api-(.*)-.*\.json/)?.[1];
      if (!name || typeNames.has(name)) return false;
      typeNames.set(name, file);
      return true;
    });
  const microcmsTypeOutput = `/** microCMS contentId */
type MicroCMSContentId = {
  id: string;
}

/** microCMS content common date */
type MicroCMSDate = {
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;
}

/** microCMS image */
export type MicroCMSImage = {
  url: string;
  width?: number;
  height?: number;
}

/** microCMS list content common types */
type MicroCMSListContent = MicroCMSContentId & MicroCMSDate;

/** microCMS relation fields */
export type MicroCMSRelation<T> = T & MicroCMSListContent;\n`;

  typeNames.forEach(async (file, name) => {
    const singleName = pluralize.singular(name);
    const typeName = pascalCase(singleName);
    const apiSchema = fs.readFileSync(path.resolve(dir, file));
    const schemaData = JSON.parse(apiSchema.toString()) as MicroCMSApiSchema;
    const convertedSchema = convertSchema(typeName, schemaData);
    const schema = outSchema(typeName, convertedSchema);

    const isRelation = /MicroCMSRelation/.test(schema);
    const isImage = /MicroCMSImage/.test(schema);

    const output =
      generateSchemaImportStatements(isRelation, isImage) +
      generateReferenceImportStatements(schemaData, singleName) +
      schema;

    if (dest) {
      fs.writeFileSync(path.join(dest, `microcms-schema.ts`), microcmsTypeOutput);
      fs.writeFileSync(path.join(dest, `${singleName}.ts`), output);
    } else {
      console.log(output);
    }
  });
};

if (process.argv.length < 3) {
  console.log("microcms-generate-types src-dir [dest-dir]");
} else {
  main(process.argv[2], process.argv[3]);
}
