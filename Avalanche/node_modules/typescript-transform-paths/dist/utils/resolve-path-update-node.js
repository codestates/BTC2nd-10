"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePathAndUpdateNode = void 0;
const path_1 = __importDefault(require("path"));
const general_utils_1 = require("./general-utils");
/* ****************************************************************************************************************** */
// region: Config
/* ****************************************************************************************************************** */
const explicitExtensions = [".js", ".jsx", ".cjs", ".mjs"];
// endregion
/* ****************************************************************************************************************** */
// region: Node Updater Utility
/* ****************************************************************************************************************** */
/**
 * Gets proper path and calls updaterFn to get the new node if it should be updated
 */
function resolvePathAndUpdateNode(context, node, moduleName, updaterFn) {
    const { sourceFile, compilerOptions, tsInstance, config, implicitExtensions, factory } = context;
    const tags = getStatementTags();
    // Skip if @no-transform-path specified
    if (tags === null || tags === void 0 ? void 0 : tags.shouldSkip)
        return node;
    const resolutionResult = resolvePath(tags === null || tags === void 0 ? void 0 : tags.overridePath);
    // Skip if can't be resolved
    if (!resolutionResult || !resolutionResult.outputPath)
        return node;
    const { outputPath, filePath } = resolutionResult;
    // Check if matches exclusion
    if (filePath && context.excludeMatchers)
        for (const matcher of context.excludeMatchers)
            if (matcher.match(filePath))
                return node;
    return updaterFn(factory.createStringLiteral(outputPath));
    /* ********************************************************* *
     * Helpers
     * ********************************************************* */
    function resolvePath(overridePath) {
        /* Handle overridden path -- ie. @transform-path ../my/path) */
        if (overridePath) {
            return {
                outputPath: filePathToOutputPath(overridePath, path_1.default.extname(overridePath)),
                filePath: overridePath,
            };
        }
        /* Have Compiler API attempt to resolve */
        const { resolvedModule, failedLookupLocations } = tsInstance.resolveModuleName(moduleName, sourceFile.fileName, compilerOptions, tsInstance.sys);
        // No transform for node-modules
        if (resolvedModule === null || resolvedModule === void 0 ? void 0 : resolvedModule.isExternalLibraryImport)
            return void 0;
        /* Handle non-resolvable module */
        if (!resolvedModule) {
            const maybeURL = failedLookupLocations[0];
            if (!general_utils_1.isURL(maybeURL))
                return void 0;
            return { outputPath: maybeURL };
        }
        /* Handle resolved module */
        const { extension, resolvedFileName } = resolvedModule;
        return {
            outputPath: filePathToOutputPath(resolvedFileName, extension),
            filePath: resolvedFileName,
        };
    }
    function filePathToOutputPath(filePath, extension) {
        if (path_1.default.isAbsolute(filePath)) {
            let sourceFileDir = tsInstance.normalizePath(path_1.default.dirname(sourceFile.fileName));
            let moduleDir = path_1.default.dirname(filePath);
            /* Handle rootDirs mapping */
            if (config.useRootDirs && context.rootDirs) {
                let fileRootDir = "";
                let moduleRootDir = "";
                for (const rootDir of context.rootDirs) {
                    if (general_utils_1.isBaseDir(rootDir, filePath) && rootDir.length > moduleRootDir.length)
                        moduleRootDir = rootDir;
                    if (general_utils_1.isBaseDir(rootDir, sourceFile.fileName) && rootDir.length > fileRootDir.length)
                        fileRootDir = rootDir;
                }
                /* Remove base dirs to make relative to root */
                if (fileRootDir && moduleRootDir) {
                    sourceFileDir = path_1.default.relative(fileRootDir, sourceFileDir);
                    moduleDir = path_1.default.relative(moduleRootDir, moduleDir);
                }
            }
            /* Make path relative */
            filePath = tsInstance.normalizePath(path_1.default.join(path_1.default.relative(sourceFileDir, moduleDir), path_1.default.basename(filePath)));
        }
        // Remove extension if implicit
        if (extension && implicitExtensions.includes(extension))
            filePath = filePath.slice(0, -extension.length) + maybeGetExplicitExtension(filePath, extension);
        return filePath[0] === "." || general_utils_1.isURL(filePath) ? filePath : `./${filePath}`;
    }
    function maybeGetExplicitExtension(filePath, resolvedExtension) {
        const moduleExtension = path_1.default.extname(moduleName);
        if (moduleExtension && !explicitExtensions.includes(moduleExtension))
            return "";
        return path_1.default.basename(moduleName, moduleExtension) === path_1.default.basename(filePath, resolvedExtension)
            ? moduleExtension
            : "";
    }
    function getStatementTags() {
        var _a, _b, _c;
        let targetNode = tsInstance.isStatement(node)
            ? node
            : (_a = tsInstance.findAncestor(node, tsInstance.isStatement)) !== null && _a !== void 0 ? _a : node;
        targetNode = tsInstance.getOriginalNode(targetNode);
        let jsDocTags;
        try {
            jsDocTags = tsInstance.getJSDocTags(targetNode);
        }
        catch (_d) { }
        const commentTags = new Map();
        try {
            const trivia = targetNode.getFullText(sourceFile).slice(0, targetNode.getLeadingTriviaWidth(sourceFile));
            const regex = /^\s*\/\/\/?\s*@(transform-path|no-transform-path)(?:[^\S\r\n](.+?))?$/gm;
            for (let match = regex.exec(trivia); match; match = regex.exec(trivia))
                commentTags.set(match[1], match[2]);
        }
        catch (_e) { }
        return {
            overridePath: (_b = commentTags.get("transform-path")) !== null && _b !== void 0 ? _b : (_c = jsDocTags === null || jsDocTags === void 0 ? void 0 : jsDocTags.find((t) => t.tagName.text.toLowerCase() === "transform-path")) === null || _c === void 0 ? void 0 : _c.comment,
            shouldSkip: commentTags.has("no-transform-path") ||
                !!(jsDocTags === null || jsDocTags === void 0 ? void 0 : jsDocTags.find((t) => t.tagName.text.toLowerCase() === "no-transform-path")),
        };
    }
}
exports.resolvePathAndUpdateNode = resolvePathAndUpdateNode;
// endregion
