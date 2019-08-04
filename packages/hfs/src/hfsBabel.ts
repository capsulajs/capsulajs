import {
    isModule
} from "@babel/helper-module-transforms";
import normalizeAndLoadModuleMetadata from "@babel/helper-module-transforms/lib/normalize-and-load-metadata";
import rewriteLiveReferences from "@babel/helper-module-transforms/lib/rewrite-live-references";

export const hfsBabel = (stats) => (babel) => ({
    visitor: {
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
