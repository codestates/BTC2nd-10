"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImplicitExtensions = exports.cast = exports.isBaseDir = exports.isURL = void 0;
const typescript_1 = __importDefault(require("typescript"));
const url_1 = __importDefault(require("url"));
const path_1 = __importDefault(require("path"));
/* ****************************************************************************************************************** *
 * General Utilities & Helpers
 * ****************************************************************************************************************** */
const isURL = (s) => !!s && (!!url_1.default.parse(s).host || !!url_1.default.parse(s).hostname);
exports.isURL = isURL;
const isBaseDir = (base, dir) => { var _a; return ((_a = path_1.default.relative(base, dir)) === null || _a === void 0 ? void 0 : _a[0]) !== "."; };
exports.isBaseDir = isBaseDir;
const cast = (v) => v;
exports.cast = cast;
/**
 * @returns Array of implicit extensions, given CompilerOptions
 */
function getImplicitExtensions(options) {
    let res = [".ts", ".d.ts"];
    let { allowJs, jsx } = options;
    const allowJsx = !!jsx && (jsx !== typescript_1.default.JsxEmit.None);
    allowJs && res.push(".js", ".cjs", ".mjs");
    allowJsx && res.push(".tsx");
    allowJs && allowJsx && res.push(".jsx");
    return res;
}
exports.getImplicitExtensions = getImplicitExtensions;
