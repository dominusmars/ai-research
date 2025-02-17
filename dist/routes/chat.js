"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const playfield_1 = require("../utils/playfield");
const router = (0, express_1.Router)();
router.get("/bots", (request, response) => {
    response.json(playfield_1.playfield.getBotInfo());
});
router.get("/history", (request, response) => {
    response.json(playfield_1.playfield.getHistory());
});
router.get("/messages", (request, response) => {
    response.json(playfield_1.playfield.getMessages());
});
router.get("/messages/all", (request, response) => {
    response.json(playfield_1.playfield.getMessages());
});
router.get("/reset", (request, response) => {
    playfield_1.playfield.reset();
    response.json({ message: "reset" });
});
router.get("/", (request, response) => {
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");
    const sendEvent = (data) => {
        if (typeof data === "object") {
            data = JSON.stringify(data);
        }
        response.write("event: response\n");
        response.write(`data: ${data}\n\n`);
    };
    const sendError = (error) => {
        response.write("event: error\n");
        response.write(`data: ${error.message}\n\n`);
    };
    const sendReset = () => {
        response.write("event: reset\n");
        response.write(`data: reset\n\n`);
    };
    playfield_1.playfield.events.on("response", sendEvent);
    playfield_1.playfield.events.on("error", sendError);
    playfield_1.playfield.events.on("reset", sendReset);
    request.on("close", () => {
        playfield_1.playfield.events.removeListener("response", sendEvent);
        playfield_1.playfield.events.removeListener("error", sendError);
        playfield_1.playfield.events.removeListener("reset", sendReset);
        response.end();
    });
});
exports.default = router;
