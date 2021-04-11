"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Visitor_1 = __importDefault(require("@swc/core/Visitor"));
class LinariaProcessor extends Visitor_1.default {
    constructor() {
        super(...arguments);
        this.cssBlocks = new Map();
    }
    visitProgram(program) {
        const transformedProgram = super.visitProgram(program);
        if (this.cssBlocks.size > 0) {
            let cssText = "";
            for (const [selector, block] of this.cssBlocks.entries()) {
                cssText += `${selector} {\n${block}\n}\n`;
            }
        }
        return transformedProgram;
    }
    visitModuleItems(items) {
        return super.visitModuleItems(
        // Heads-up: This `filter()` has side-effects!
        items.filter((item) => {
            if (item.type === "ImportDeclaration") {
                // Strip all imports to Linaria:
                if (item.source.value.startsWith("@linaria/")) {
                    if (item.source.value === "@linaria/core") {
                        // Store the name of the `css` import.
                        const cssImport = item.specifiers.find((specifier) => getImportedIdentifierName(specifier) === "css");
                        if (cssImport) {
                            this.cssImportName = cssImport.local.value;
                        }
                    }
                    else if (item.source.value === "@linaria/react") {
                        // Store the name of the `styled` import.
                        const styledImport = item.specifiers.find((specifier) => getImportedIdentifierName(specifier) === "styled");
                        if (styledImport) {
                            this.styledImportName = styledImport.local.value;
                        }
                    }
                    return false;
                }
            }
            return true;
        }));
    }
    visitTaggedTemplateExpression(expression) {
        const { tag } = expression;
        if (tag.type === "Identifier" && tag.value === this.cssImportName) {
            const className = "generated class name";
            return {
                type: "StringLiteral",
                has_escape: false,
                span: Object.assign(Object.assign({}, tag.span), { end: tag.span.start + className.length + 2 }),
                value: className,
            };
        }
        return super.visitTaggedTemplateExpression(expression);
    }
}
function getImportedIdentifierName(specifier) {
    switch (specifier.type) {
        case "ImportSpecifier":
            if (specifier.imported === null) {
                return specifier.local.value;
            }
            else {
                return specifier.imported.value;
            }
        case "ImportDefaultSpecifier":
            return "default";
        case "ImportNamespaceSpecifier":
            return "*";
    }
}
function plugin(n) {
    return new LinariaProcessor().visitProgram(n);
}
exports.default = plugin;
