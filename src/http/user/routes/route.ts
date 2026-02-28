import { FastifyInstance } from "fastify";
import { addApiKey } from "../apis/api.js";


export default async function apiRoutes(app: FastifyInstance) {
  app.post("/addApiKey", addApiKey);
}


