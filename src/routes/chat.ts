import { Router, Request, Response, request } from "express";
import { playfield } from "../utils/playfield";
import { execSync } from "child_process";
const router = Router();

router.get("/bots", (request: Request, response: Response) => {
  response.json(playfield.getBotInfo());
});
router.get("/history", (request: Request, response: Response) => {
  response.json(playfield.getHistory());
});
router.get("/messages", (request: Request, response: Response) => {
  response.json(playfield.getMessages());
});

router.get("/messages/all", (request: Request, response: Response) => {
  response.json(playfield.getMessages());
});
router.get("/reset", (request: Request, response: Response) => {
  playfield.reset();
  response.json({ message: "reset" });
});

router.get("/", (request: Request, response: Response) => {
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");

  const sendEvent = (data: any) => {
    if (typeof data === "object") {
      data = JSON.stringify(data);
    }
    response.write("event: response\n");
    response.write(`data: ${data}\n\n`);
  };
  const sendError = (error: Error) => {
    response.write("event: error\n");
    response.write(`data: ${error.message}\n\n`);
  };
  const sendReset = () => {
    response.write("event: reset\n");
    response.write(`data: reset\n\n`);
  };

  playfield.events.on("response", sendEvent);
  playfield.events.on("error", sendError);
  playfield.events.on("reset", sendReset);

  request.on("close", () => {
    playfield.events.removeListener("response", sendEvent);
    playfield.events.removeListener("error", sendError);
    playfield.events.removeListener("reset", sendReset);
    response.end();
  });
});

export default router;
