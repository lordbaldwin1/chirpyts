import express from "express";
import { handlerMetrics, handlerReadiness, handlerReset, } from "./api/metrics.js";
import { handlerChirpsValidate } from "./api/chirps.js";
import { middlewareErrorHandler, middlewareLogResponses, middlewareMetricsInc, } from "./api/middleware.js";
const app = express();
const PORT = 8080;
// lets' go!!! express built in json parsinng!!!
app.use(express.json());
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("/admin/metrics", (req, res, next) => {
    Promise.resolve(handlerMetrics(req, res).catch(next));
});
app.post("/admin/reset", (req, res, next) => {
    Promise.resolve(handlerReset(req, res).catch(next));
});
app.get("/api/healthz", (req, res, next) => {
    Promise.resolve(handlerReadiness(req, res).catch(next));
});
app.post("/api/validate_chirp", (req, res, next) => {
    Promise.resolve(handlerChirpsValidate(req, res).catch(next));
});
app.use(middlewareErrorHandler);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
