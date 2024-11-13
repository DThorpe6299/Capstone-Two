const express = require("express");
const Media = require("../models/media");
//const { ensureAdmin } = require("../middleware/auth");
//const { BadRequestError } = require("../expressError");
//const mediaNewSchema = require("../schemas/mediaNew.json");
//const mediaUpdateSchema = require("../schemas/mediaUpdate.json");

const router = new express.Router();

/** GET => { mediaObject }
 * 
 * 
 * Fetches the media details for a given media type and external id.
 */
router.get("/:mediaType/:externalId", async function (req, res, next) {
    try {
        const media = await Media.fetchMedia(req.params.mediaType, req.params.externalId);
        console.log(media);
        return res.json({ media });
    } catch (error) {
        console.log("Error fetching media details in routes:", error);
        return next(error);
    }
})

module.exports = router;