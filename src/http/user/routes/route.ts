import { FastifyInstance } from "fastify";
import { addApiKey } from "../apis/api";


export default async function apiRoutes(app: FastifyInstance) {
  app.post("/addApiKey", addApiKey);
}


