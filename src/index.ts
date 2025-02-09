import express from "express";
import { Request, Response } from "express";
import chat from "./routes/chat";
import path from "path";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import yaml from "yaml";
import fs from "fs";
const app = express();
const port = 3000;

app.use(morgan("common"));

const file = fs.readFileSync("./swagger.yaml", "utf8");

const swaggerDocument = yaml.parse(file);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/static", express.static("public"));

app.use("/chat", chat);

app.use("/", (request: Request, response: Response) => {
  response.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
