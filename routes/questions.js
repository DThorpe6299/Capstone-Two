"use strict";

/** Routes for questions. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Question = require("../models/question");

const questionNewSchema = require("../schemas/questionNew.json");
const questionUpdateSchema = require("../schemas/questionUpdate.json");
const questionSearchSchema = require("../schemas/questionSearch.json");

const router = new express.Router();

/** POST { question } => { question }
 * 
 * Question should be { quizVersionId, text }
 * 
 * Returns { id, quizVersionId, text }
 * 
 * Authorization required: admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, questionNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const question = await Question.create(req.body);
        return res.status(201).json({ question });
    } catch (err) {
        return next(err);
    }
});

/** GET / =>
 *  { questions: [{ id, quizVersionId, text }] }
 * 
 * Optionally filters questions by version number using query parameter `version`.
 * 
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
    const q = req.query;
    try {
        const validator = jsonschema.validate(q, questionSearchSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const questions = await Question.findAll(q);
        return res.json({ questions });
    } catch (err) {
        return next(err);
    }
});

/** GET /[id] => { question }
 * 
 * Question is { id, quizVersionId, text }
 * 
 * Authorization required: none
 */
router.get("/:id", async function (req, res, next) {
    try {
        const question = await Question.get(req.params.id);
        return res.json({ question });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[id] {fld1, fld2, ... } => { question }
 * 
 * Patches question data.
 * 
 * Fields can be: { quizVersionId, text }
 * 
 * Returns { id, quizVersionId, text }
 * 
 * Authorization required: admin
 */
router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, questionUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const question = await Question.update(req.params.id, req.body);
        return res.json({ question });
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
        await Question.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});

console.log('Questions routes initialized');

module.exports = router;
