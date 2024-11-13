"use strict";

/** Routes for quiz instances. */

const express = require("express");
const { BadRequestError, NotFoundError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const QuizInstance = require("../models/quizInstance");

const quizInstanceNewSchema = require("../schemas/quizInstanceNew.json");
const quizInstanceUpdateSchema = require("../schemas/quizInstanceUpdate.json");
const quizInstanceSearchSchema = require("../schemas/quizInstanceSearch.json");

const router = new express.Router();

/** POST / => { quizInstance }
 * 
 * Creates a new quiz instance.
 * 
 * Returns { id, createdAt }
 * 
 * Authorization required: none
 */
router.post("/", async function (req, res, next) {
    try {
        const quizInstance = await QuizInstance.create();
        return res.status(201).json({ quizInstance });
    } catch (err) {
        return next(err);
    }
});

/** GET / =>
 *  { quizInstances: [{ id, createdAt }] }
 * 
 * Returns all quiz instances.
 * 
 * Optionally filters quiz instances based on the query parameters.
 * 
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
    try {
        const quizInstances = await QuizInstance.findAll();
        return res.json({ quizInstances });
    } catch (err) {
        return next(err);
    }
});

/** GET /[id] => { quizInstance }
 * 
 * Quiz instance is { id, createdAt }
 * 
 * Authorization required: none
 */
router.get("/:id", async function (req, res, next) {
    try {
        const quizInstance = await QuizInstance.get(req.params.id);
        return res.json({ quizInstance });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[id] { fld1, fld2, ... } => { quizInstance }
 * 
 * Updates the `createdAt` field of the quiz instance.
 * 
 * Returns { id, createdAt }
 * 
 * Authorization required: admin
 */
router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const quizInstance = await QuizInstance.update(req.params.id);
        return res.json({ quizInstance });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[id] => { deleted: id }
 * 
 * Authorization: admin
 */
router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
        await QuizInstance.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});

console.log('Quiz Instances routes initialized');

module.exports = router;
