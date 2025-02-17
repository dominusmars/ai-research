"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function log(message, level = "info") {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}]: ${message}`);
}
exports.default = log;
