import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./openapi";
import { stringify } from "yaml";
import { writeFileSync } from "fs";

const generator = new OpenApiGeneratorV3(registry.definitions);

export function generateApiDocumentation() {
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Access Management API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  });
}

export function writeApiDocumentation() {
  const docs = generateApiDocumentation();

  const fileContent = stringify(docs);

  writeFileSync(`${__dirname}/openapi-docs.yaml`, fileContent, {
    encoding: "utf-8",
  });
}

// writeApiDocumentation()
