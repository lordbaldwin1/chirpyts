import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";
export async function handlerChirpsValidate(req, res) {
    const params = req.body;
    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        // respondWithError(res, 400, "Chirp is too long");
        throw new BadRequestError("Chirp is too long. Max length is 140");
        return;
    }
    const splitParams = params.body.split(" ");
    const profane = ["kerfuffle", "sharbert", "fornax"];
    for (let i = 0; i < splitParams.length; i++) {
        if (profane.includes(splitParams[i].toLowerCase())) {
            splitParams[i] = "****";
        }
    }
    const cleanedParams = splitParams.join(" ");
    respondWithJSON(res, 200, { cleanedBody: cleanedParams });
}
