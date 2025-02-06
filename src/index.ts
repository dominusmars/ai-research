import expres from "express";
import { Request, Response } from "express";
import current from "./routes/current";
const app = expres();
const port = 3000;

app.use(expres.json());

app.use("/chat", current);

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
