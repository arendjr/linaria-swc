import type {
  Expression,
  ImportSpecifier,
  ModuleItem,
  Program,
  TaggedTemplateExpression,
} from "@swc/core";
import Visitor from "@swc/core/Visitor";

class LinariaProcessor extends Visitor {
  private cssBlocks = new Map<string, string>();
  private cssImportName: string | undefined;
  private styledImportName: string | undefined;

  visitProgram(program: Program): Program {
    const transformedProgram = super.visitProgram(program);

    if (this.cssBlocks.size > 0) {
      let cssText = "";
      for (const [selector, block] of this.cssBlocks.entries()) {
        cssText += `${selector} {\n${block}\n}\n`;
      }
    }

    return transformedProgram;
  }

  visitModuleItems(items: ModuleItem[]): ModuleItem[] {
    return super.visitModuleItems(
      // Heads-up: This `filter()` has side-effects!
      items.filter((item) => {
        if (item.type === "ImportDeclaration") {
          // Strip all imports to Linaria:
          if (item.source.value.startsWith("@linaria/")) {
            if (item.source.value === "@linaria/core") {
              // Store the name of the `css` import.
              const cssImport = item.specifiers.find(
                (specifier) => getImportedIdentifierName(specifier) === "css"
              );
              if (cssImport) {
                this.cssImportName = cssImport.local.value;
              }
            } else if (item.source.value === "@linaria/react") {
              // Store the name of the `styled` import.
              const styledImport = item.specifiers.find(
                (specifier) => getImportedIdentifierName(specifier) === "styled"
              );
              if (styledImport) {
                this.styledImportName = styledImport.local.value;
              }
            }

            return false;
          }
        }

        return true;
      })
    );
  }

  visitTaggedTemplateExpression(
    expression: TaggedTemplateExpression
  ): Expression {
    const { tag } = expression;
    if (tag.type === "Identifier" && tag.value === this.cssImportName) {
      const className = "generated class name";
      return {
        type: "StringLiteral",
        has_escape: false,
        span: { ...tag.span, end: tag.span.start + className.length + 2 },
        value: className,
      };
    }

    return super.visitTaggedTemplateExpression(expression);
  }
}

function getImportedIdentifierName(specifier: ImportSpecifier): string {
  switch (specifier.type) {
    case "ImportSpecifier":
      if (specifier.imported === null) {
        return specifier.local.value;
      } else {
        return specifier.imported.value;
      }
    case "ImportDefaultSpecifier":
      return "default";
    case "ImportNamespaceSpecifier":
      return "*";
  }
}

export default function plugin(n: Program): Program {
  return new LinariaProcessor().visitProgram(n);
}
