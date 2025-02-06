import { Router, Request, Response } from "express";
import { botOne, botTwo } from "../utils/playfield";

const router = Router();

router.use("/", (request: Request, response: Response) => {
  response.json([botOne.getResponses(), botTwo.getResponses()]);
});

export default router;
