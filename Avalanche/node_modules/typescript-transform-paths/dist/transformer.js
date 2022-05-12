"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const typescript_1 = __importDefault(require("typescript"));
const utils_1 = require("./utils");
const visitor_1 = require("./visitor");
const harmony_factory_1 = require("./utils/harmony-factory");
const minimatch_1 = require("minimatch");
/* ****************************************************************************************************************** *
 * Transformer
 * ****************************************************************************************************************** */
function transformer(program, config, { ts: tsInstance }) {
    var _a;
    if (!tsInstance)
        tsInstance = typescript_1.default;
    const compilerOptions = program.getCompilerOptions();
    const implicitExtensions = utils_1.getImplicitExtensions(compilerOptions);
    const rootDirs = (_a = compilerOptions.rootDirs) === null || _a === void 0 ? void 0 : _a.filter(path_1.default.isAbsolute);
    return (transformationContext) => {
        var _a;
        const tsTransformPathsContext = {
            compilerOptions,
            config,
            elisionMap: new Map(),
            tsFactory: transformationContext.factory,
            implicitExtensions,
            program,
            rootDirs,
            transformationContext,
            tsInstance,
            tsThreeInstance: utils_1.cast(tsInstance),
            excludeMatchers: (_a = config.exclude) === null || _a === void 0 ? void 0 : _a.map((globPattern) => new minimatch_1.Minimatch(globPattern, { matchBase: true })),
        };
        return (sourceFile) => {
            if (!compilerOptions.baseUrl || !compilerOptions.paths)
                return sourceFile;
            const visitorContext = Object.assign(Object.assign({}, tsTransformPathsContext), { sourceFile, isDeclarationFile: sourceFile.isDeclarationFile, originalSourceFile: tsInstance.getOriginalSourceFile(sourceFile), getVisitor() {
                    return visitor_1.nodeVisitor.bind(this);
                }, factory: harmony_factory_1.createHarmonyFactory(tsTransformPathsContext) });
            return tsInstance.visitEachChild(sourceFile, visitorContext.getVisitor(), transformationContext);
        };
    };
}
exports.default = transformer;
