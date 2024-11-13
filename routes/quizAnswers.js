"use strict";

/** Routes for quiz answers. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, NotFoundError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const QuizAnswer = require("../models/quizAnswer");

const quizAnswerNewSchema = require("../schemas/quizAnswerNew.json");
const quizAnswerUpdateSchema = require("../schemas/quizAnswerUpdate.json");
const quizAnswerSearchSchema = require("../schemas/quizAnswerSearch.json");

const router = new express.Router();

/** POST { quizAnswer } => { quizAnswer }
 * 
 * quizAnswer should be { questionId, answerId, quizInstancesId }
 * quizVersionId defaults to the latest version in the database.
 * 
 * Returns { id, quizVersionId, questionId, answerId, quizInstancesId, createdAt }
 * 
 * Authorization required: admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, quizAnswerNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const quizAnswer = await QuizAnswer.create(req.body);
        return res.status(201).json({ quizAnswer });
    } catch (err) {
        return next(err);
    }
});

/** GET / =>
 *  { quizAnswers: [{ id, quizVersionId, questionId, answerId, quizInstancesId, createdAt }] }
 * 
 * Optionally filters quiz answers based on the query parameters.
 * 
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
    const q = req.query;
    try {
        const validator = jsonschema.validate(q, quizAnswerSearchSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const quizAnswers = await QuizAnswer.findAll(q);
        return res.json({ quizAnswers });
    } catch (err) {
        return next(err);
    }
});

/** GET /[id] => { quizAnswer }
 * 
 * Quiz answer is { id, quizVersionId, questionId, answerId, quizInstancesId, createdAt }
 * 
 * Authorization required: none
 */
router.get("/:id", async function (req, res, next) {
    try {
        const quizAnswer = await QuizAnswer.get(req.params.id);
        return res.json({ quizAnswer });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[id] {fld1, fld2, ... } => { quizAnswer }
 * 
 * Patches quiz answer data.
 * 
 * Fields can include: { questionId, answerId, quizInstancesId }
 * 
 * Returns { id, quizVersionId, questionId, answerId, quizInstancesId, createdAt }
 * 
 * Authorization required: admin
 */
router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, quizAnswerUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const quizAnswer = await QuizAnswer.update(req.params.id, req.body);
        return res.json({ quizAnswer });
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
        await QuizAnswer.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});

console.log('Quiz Answers routes initialized');

module.exports = router;
