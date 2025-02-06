import express from "express";
import { Request, Response } from "express";
import current from "./routes/current";
import path from 'path';


const app = express();
const port = 3000;


app.use("/static", express.static("public"));

app.use("/chat", current);

app.use("/", (request: Request, response: Response) => {
  response.sendFile(path.join(__dirname , "../public/index.html"));
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
