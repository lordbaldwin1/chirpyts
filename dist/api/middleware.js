import { config } from "../config.js";
import { respondWithError } from "./json.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";
export function middlewareLogResponses(req, res, next) {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    });
    next();
}
export function middlewareMetricsInc(_, __, next) {
    config.fileserverHits++;
    next();
}
export function middlewareErrorHandler(err, _, res, __) {
    const errorMessage = err.message;
    if (err instanceof BadRequestError) {
        respondWithError(res, 400, errorMessage);
    }
    else if (err instanceof UnauthorizedError) {
        respondWithError(res, 401, errorMessage);
    }
    else if (err instanceof ForbiddenError) {
        respondWithError(res, 403, errorMessage);
    }
    else if (err instanceof NotFoundError) {
        respondWithError(res, 404, errorMessage);
    }
    else {
        console.log("500 - Internal Server Error");
    }
}
