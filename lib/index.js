"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Visitor_1 = __importDefault(require("@swc/core/Visitor"));
class LinariaProcessor extends Visitor_1.default {
}
function plugin(n) {
    return new LinariaProcessor().visitProgram(n);
}
exports.default = plugin;
