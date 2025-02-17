"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_1 = __importDefault(require("./routes/chat"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yaml_1 = __importDefault(require("yaml"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, morgan_1.default)("common"));
const file = fs_1.default.readFileSync("./swagger.yaml", "utf8");
const swaggerDocument = yaml_1.default.parse(file);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
app.use("/static", express_1.default.static("public"));
app.use("/chat", chat_1.default);
app.use("/", (request, response) => {
    response.sendFile(path_1.default.join(__dirname, "../public/index.html"));
});
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
