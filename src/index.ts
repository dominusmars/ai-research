import express from "express";
import { Request, Response } from "express";
import chat from "./routes/chat";
import path from "path";
import morgan from "morgan";

const app = express();
const port = 3000;

app.use(morgan("common"));

app.use("/static", express.static("public"));

app.use("/chat", chat);

app.use("/", (request: Request, response: Response) => {
  response.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
