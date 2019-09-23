// @ts-ignore
/* tslint:disable */
import {basename, extname} from "path";

import splitExportDeclaration from "@babel/helper-split-export-declaration";
import template from "@babel/template";
import * as t from "@babel/types";


export type ModuleMetadata = {
    exportName: string,

    // The name of the variable that will reference an object containing export names.
    exportNameListName: null | string,

    hasExports: boolean,

    // Lookup from local binding to export information.
    local: Map<string, LocalExportMetadata>,

    // Lookup of source file to source file metadata.
    source: Map<string, SourceModuleMetadata>,
};

export type InteropType = "default" | "namespace" | "none";

export type SourceModuleMetadata = {
    // A unique variable name to use for this namespace object. Centralized for simplicity.
    name: string,

    loc?: any,

    interop: InteropType,

    // Local binding to reference from this source namespace. Key: Local name, value: Import name
    imports: Map<string, string>,

    // Local names that reference namespace object.
    importsNamespace: Set<string>,

    // Reexports to create for namespace. Key: Export name, value: Import name
    reexports: Map<string, string>,

    // List of names to re-export namespace as.
    reexportNamespace: Set<string>,

    // Tracks if the source should be re-exported.
    reexportAll: null | {
        loc?: any,
    },
};

export type LocalExportMetadata = {
    name: Array<string>, // names of exports
    kind: "import" | "hoisted" | "block" | "var",
};

/**
 * Check if the module has any exports that need handling.
 */
export function hasExports(metadata: ModuleMetadata) {
    return metadata.hasExports;
}

/**
 * Check if a given source is an anonymous import, e.g. "import 'foo';"
 */
export function isSideEffectImport(source: SourceModuleMetadata) {
    return (
        source.imports.size === 0 &&
        source.importsNamespace.size === 0 &&
        source.reexports.size === 0 &&
        source.reexportNamespace.size === 0 &&
        !source.reexportAll
    );
}

/**
 * Remove all imports and exports from the file, and return all metadata
 * needed to reconstruct the module's behavior.
 */
export default function normalizeModuleAndLoadMetadata(
    programPath: any,
    exportName?: string,
    {
        noInterop = false,
        loose = false,
        lazy = false,
        esNamespaceOnly = false,
    } = {},
): ModuleMetadata {
    if (!exportName) {
        exportName = programPath.scope.generateUidIdentifier("exports").name;
    }

    nameAnonymousExports(programPath);

    const {local, source, hasExports} = getModuleMetadata(programPath, {
        loose,
        lazy,
    });

    removeModuleDeclarations(programPath);

    // Reuse the imported namespace name if there is one.
    // @ts-ignore
    for (const [, metadata] of source) {
        if (metadata.importsNamespace.size > 0) {
            // This is kind of gross. If we stop using `loose: true` we should
            // just make this destructuring assignment.
            metadata.name = metadata.importsNamespace.values().next().value;
        }

        if (noInterop) metadata.interop = "none";
        else if (esNamespaceOnly) {
            // Both the default and namespace interops pass through __esModule
            // objects, but the namespace interop is used to enable Babel's
            // destructuring-like interop behavior for normal CommonJS.
            // Since some tooling has started to remove that behavior, we expose
            // it as the `esNamespace` option.
            if (metadata.interop === "namespace") {
                metadata.interop = "default";
            }
        }
    }

    return {
        // @ts-ignore
        exportName,
        exportNameListName: null,
        hasExports,
        local,
        source,
    };
}

/**
 * Get metadata about the imports and exports present in this module.
 */
function getModuleMetadata(
    programPath: any,
    {loose, lazy}: { loose: boolean, lazy: boolean },
) {
    const localData = getLocalExportMetadata(programPath, loose);

    const sourceData = new Map();
    const getData = (sourceNode, dynamic = false) => {
        const source = sourceNode.value;

        let data = sourceData.get(source);
        if (!data) {
            data = {
                dynamic,
                name: programPath.scope.generateUidIdentifier(
                    basename(source, extname(source)),
                ).name,
                interop: "none",

                loc: null,

                // Data about the requested sources and names.
                imports: new Map(),
                importsNamespace: new Set(),

                // Metadata about data that is passed directly from source to export.
                reexports: new Map(),
                reexportNamespace: new Set(),
                reexportAll: null,

                lazy: false,
            };
            sourceData.set(source, data);
        }
        return data;
    };
    let hasExports = false;
    programPath.get("body").forEach(child => {
        if (child.isImportDeclaration()) {
            const data = getData(child.node.source);
            if (!data.loc) data.loc = child.node.loc;

            child.get("specifiers").forEach(spec => {
                if (spec.isImportDefaultSpecifier()) {
                    const localName = spec.get("local").node.name;

                    data.imports.set(localName, "default");

                    const reexport = localData.get(localName);
                    if (reexport) {
                        localData.delete(localName);
// @ts-ignore
                        reexport.names.forEach(name => {
                            data.reexports.set(name, "default");
                        });
                    }
                } else if (spec.isImportNamespaceSpecifier()) {
                    const localName = spec.get("local").node.name;

                    data.importsNamespace.add(localName);
                    const reexport = localData.get(localName);
                    if (reexport) {
                        localData.delete(localName);
// @ts-ignore
                        reexport.names.forEach(name => {
                            data.reexportNamespace.add(name);
                        });
                    }
                } else if (spec.isImportSpecifier()) {
                    const importName = spec.get("imported").node.name;
                    const localName = spec.get("local").node.name;

                    data.imports.set(localName, importName);

                    const reexport = localData.get(localName);
                    if (reexport) {
                        localData.delete(localName);
// @ts-ignore
                        reexport.names.forEach(name => {
                            data.reexports.set(name, importName);
                        });
                    }
                }
            });
        } else if (isDynamicImport(child.node)) {
            const imp = getDynamicImport(child.node);

            const data = getData(imp.init.arguments[0], true);
            if (!data.loc) data.loc = imp.init.arguments.loc;
            const buildImport = template(`const %%importName%% = %%target%%();`);
            const ast = buildImport({
                importName: t.identifier(imp.id.name),
                target: data.name
            });
            child.replaceWith(ast);
            //child.replaceWithSourceString(`const ${imp.id.name} = ${data.name}();`);
            //const importName = imp.init.arguments[0].value;
            // const importName = "default";
            // const localName = imp.id.name;

            /*data.imports.set(localName, importName);

            const reexport = localData.get(localName);
            if (reexport) {
                localData.delete(localName);
// @ts-ignore
                reexport.names.forEach(name => {
                    data.reexports.set(name, importName);
                });
            }*/
        } else if (child.isExportAllDeclaration()) {
            hasExports = true;
            const data = getData(child.node.source);
            if (!data.loc) data.loc = child.node.loc;

            data.reexportAll = {
                loc: child.node.loc,
            };
        } else if (child.isExportNamedDeclaration() && child.node.source) {
            hasExports = true;
            const data = getData(child.node.source);
            if (!data.loc) data.loc = child.node.loc;

            child.get("specifiers").forEach(spec => {
                if (!spec.isExportSpecifier()) {
                    throw spec.buildCodeFrameError("Unexpected export specifier type");
                }
                const importName = spec.get("local").node.name;
                const exportName = spec.get("exported").node.name;

                data.reexports.set(exportName, importName);

                if (exportName === "__esModule") {
                    throw exportName.buildCodeFrameError('Illegal export "__esModule".');
                }
            });
        } else if (
            child.isExportNamedDeclaration() ||
            child.isExportDefaultDeclaration()
        ) {
            hasExports = true;
        }
    });
// @ts-ignore
    for (const metadata of sourceData.values()) {
        let needsDefault = false;
        let needsNamed = false;

        if (metadata.importsNamespace.size > 0) {
            needsDefault = true;
            needsNamed = true;
        }

        if (metadata.reexportAll) {
            needsNamed = true;
        }

        for (const importName of metadata.imports.values()) {
            if (importName === "default") needsDefault = true;
            else needsNamed = true;
        }
        for (const importName of metadata.reexports.values()) {
            if (importName === "default") needsDefault = true;
            else needsNamed = true;
        }

        if (needsDefault && needsNamed) {
            // TODO(logan): Using the namespace interop here is unfortunate. Revisit.
            metadata.interop = "namespace";
        } else if (needsDefault) {
            metadata.interop = "default";
        }
    }
// @ts-ignore
    for (const [source, metadata] of sourceData) {
        if (
            lazy !== false &&
            !(isSideEffectImport(metadata) || metadata.reexportAll)
        ) {
            if (lazy === true) {
                // 'true' means that local relative files are eagerly loaded and
                // dependency modules are loaded lazily.
                metadata.lazy = !/\./.test(source);
            } else if (Array.isArray(lazy)) {
                // @ts-ignore
                metadata.lazy = lazy.indexOf(source) !== -1;
            } else if (typeof lazy === "function") {
                // @ts-ignore
                metadata.lazy = lazy(source);
            } else {
                throw new Error(`.lazy must be a boolean, string array, or function`);
            }
        }
    }

    return {
        hasExports,
        local: localData,
        source: sourceData,
    };
}

/**
 * Get metadata about local variables that are exported.
 */
function getLocalExportMetadata(
    // @ts-ignore
    programPath: NodePath,
    loose: boolean,
): Map<string, LocalExportMetadata> {
    const bindingKindLookup = new Map();

    programPath.get("body").forEach(child => {
        let kind;
        if (child.isImportDeclaration()) {
            kind = "import";
        } else {
            if (child.isExportDefaultDeclaration()) child = child.get("declaration");
            if (child.isExportNamedDeclaration()) {
                if (child.node.declaration) {
                    child = child.get("declaration");
                } else if (
                    loose &&
                    child.node.source &&
                    child.get("source").isStringLiteral()
                ) {
                    child.node.specifiers.forEach(specifier => {
                        bindingKindLookup.set(specifier.local.name, "block");
                    });
                    return;
                }
            }

            if (child.isFunctionDeclaration()) {
                kind = "hoisted";
            } else if (child.isClassDeclaration()) {
                kind = "block";
            } else if (child.isVariableDeclaration({kind: "var"})) {
                kind = "var";
            } else if (child.isVariableDeclaration()) {
                kind = "block";
            } else {
                return;
            }
        }

        Object.keys(child.getOuterBindingIdentifiers()).forEach(name => {
            bindingKindLookup.set(name, kind);
        });
    });

    const localMetadata = new Map();
    const getLocalMetadata = idPath => {
        const localName = idPath.node.name;
        let metadata = localMetadata.get(localName);

        if (!metadata) {
            const kind = bindingKindLookup.get(localName);

            if (kind === undefined) {
                throw idPath.buildCodeFrameError(
                    `Exporting local "${localName}", which is not declared.`,
                );
            }

            metadata = {
                names: [],
                kind,
            };
            localMetadata.set(localName, metadata);
        }
        return metadata;
    };

    programPath.get("body").forEach(child => {
        if (child.isExportNamedDeclaration() && (loose || !child.node.source)) {
            if (child.node.declaration) {
                const declaration = child.get("declaration");
                const ids = declaration.getOuterBindingIdentifierPaths();
                Object.keys(ids).forEach(name => {
                    if (name === "__esModule") {
                        throw declaration.buildCodeFrameError(
                            'Illegal export "__esModule".',
                        );
                    }
                    getLocalMetadata(ids[name]).names.push(name);
                });
            } else {
                child.get("specifiers").forEach(spec => {
                    const local = spec.get("local");
                    const exported = spec.get("exported");

                    if (exported.node.name === "__esModule") {
                        throw exported.buildCodeFrameError('Illegal export "__esModule".');
                    }
                    getLocalMetadata(local).names.push(exported.node.name);
                });
            }
        } else if (child.isExportDefaultDeclaration()) {
            const declaration = child.get("declaration");
            if (
                declaration.isFunctionDeclaration() ||
                declaration.isClassDeclaration()
            ) {
                getLocalMetadata(declaration.get("id")).names.push("default");
            } else {
                // These should have been removed by the nameAnonymousExports() call.
                throw declaration.buildCodeFrameError(
                    "Unexpected default expression export.",
                );
            }
        }
    });
    return localMetadata;
}

const getDynamicImport = (node: any) => {
    if (!node.declarations || !node.declarations.length) return false;
    for (let j in node.declarations) {
        if (!node.declarations[j]) continue;
        if (!node.declarations[j].init) continue;
        if (!node.declarations[j].init.callee || node.declarations[j].init.callee.type !== "Import") continue;
        return node.declarations[j];
    }
    return false;
}
const isDynamicImport = (node: any) => !!getDynamicImport(node);

/**
 * Ensure that all exported values have local binding names.
 */
function nameAnonymousExports(programPath: any) {
    // Name anonymous exported locals.
    programPath.get("body").forEach(child => {
        if (!child.isExportDefaultDeclaration()) return;
        splitExportDeclaration(child);
    });
}


function removeModuleDeclarations(programPath: any) {
    programPath.get("body").forEach(child => {
        if (child.isImportDeclaration()) {
            child.remove();
        } else if (isDynamicImport(child.node) ) {

        } else if (child.isExportNamedDeclaration()) {
            if (child.node.declaration) {
                child.node.declaration._blockHoist = child.node._blockHoist;
                child.replaceWith(child.node.declaration);
            } else {
                child.remove();
            }
        } else if (child.isExportDefaultDeclaration()) {
            // export default foo;
            const declaration = child.get("declaration");
            if (
                declaration.isFunctionDeclaration() ||
                declaration.isClassDeclaration()
            ) {
                declaration._blockHoist = child.node._blockHoist;
                child.replaceWith(declaration);
            } else {
                // These should have been removed by the nameAnonymousExports() call.
                throw declaration.buildCodeFrameError(
                    "Unexpected default expression export.",
                );
            }
        } else if (child.isExportAllDeclaration()) {
            child.remove();
        }
    });
}
