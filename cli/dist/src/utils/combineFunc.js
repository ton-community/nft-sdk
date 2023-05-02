"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineFunc = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
function combineFunc(root, paths) {
    let res = '';
    for (let path of paths) {
        res += (0, fs_1.readFileSync)((0, path_1.resolve)(root, path), 'utf-8');
        res += '\n';
    }
    return res;
}
exports.combineFunc = combineFunc;
//# sourceMappingURL=combineFunc.js.map