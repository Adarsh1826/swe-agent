"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const app = (0, fastify_1.default)();
app.get('/test', (req, res) => {
    res.send({
        "msg": "up"
    });
});
app.listen({ port: 3000 }, () => {
    console.log("Server is listening on http://localhost:3000");
});
