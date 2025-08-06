import express from "express";

import {
  handlerMetrics,
  handlerReadiness,
  handlerReset,
} from "./api/metrics.js";
import { handlerChirpsValidate } from "./api/chirps.js";
import {
  middlewareLogResponses,
  middlewareMetricsInc,
} from "./api/middleware.js";

const app = express();
const PORT = 8080;

// lets' go!!! express built in json parsinng!!!
app.use(express.json());

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", handlerChirpsValidate);


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
