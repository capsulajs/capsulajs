import {
    isModule
} from "@babel/helper-module-transforms";
import normalizeAndLoadModuleMetadata from "./normalize-and-load-metadata";
import rewriteLiveReferences from "@babel/helper-module-transforms/lib/rewrite-live-references";
import * as t from "@babel/types";


function getImportSource(callNode) {
    const importArguments = callNode.parent.arguments;
    const [importPath] = importArguments;

    const isString = callNode.isStringLiteral(importPath) || callNode.isTemplateLiteral(importPath);
    if (isString) {
        callNode.removeComments(importPath);
        return importPath;
    }

    return t.templateLiteral([
        t.templateElement({ raw: '', cooked: '' }),
        t.templateElement({ raw: '', cooked: '' }, true),
    ], importArguments);
}
//const dynamic = {};
export const hfsBabel = (stats) => (babel) => ({
    visitor: {
        Import(path) {

            // @ts-ignore
            stats.dep = [getImportSource(path).values]
            //dynamic([getImportSource(path).values])
            //console.log(getImportSource(path));
            //console.log(path);
        },
        Program: {
            exit(path, state) {
                if (!isModule(path)) return;

                const {
                    loose = true,
                    exportName = "exports",
                    // 'true' for non-mjs files to strictly have .default, instead of having
                    // destructuring-like behavior for their properties.

                    noInterop = true,
                    lazy = true,
                    // Defaulting to 'true' for now. May change before 7.x major.
                } = {};
                const meta = normalizeAndLoadModuleMetadata(path, exportName, {
                    noInterop,
                    loose,
                    lazy,
                    esNamespaceOnly: true
                });


                rewriteLiveReferences(path, meta);

                stats.info = meta;
            },
        }
    }
});
