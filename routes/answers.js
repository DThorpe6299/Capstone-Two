"use strict";

/** Routes for answers. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Answer = require("../models/answer");

const answerNewSchema = require("../schemas/answerNew.json");
const answerUpdateSchema = require("../schemas/answerUpdate.json");
const answerSearchSchema = require("../schemas/answerSearch.json");

const router = new express.Router();

/**POST { answer } => { answer }
 * 
 * answer should be { questionId, text, genreIds }
 * 
 * Returns { id, questionId, text, genreIds }
 * 
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
    try{
        const validator = jsonschema.validate(req.body, answerNewSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack)
            throw new BadRequestError(errs);
        }
        const answer = await Answer.create(req.body);
        return res.status(201).json({answer});
    }catch(err){
        return next(err)
    }
});

/** GET / =>
 *  { answers: [{ id, questionId, text, genreIds}]}, ...
 * 
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    const q = req.query;
    try{
        const validator = jsonschema.validate(q, answerSearchSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        
        const answers = await Answer.findAll(q);
        return res.json({ answers });
    }catch (err) {
        return next(err);
    }
});

/** GET /[id] => { answer }
 * 
 *  Answer is { id, questionId, text, genreIds }
 *      where answers is [{ id, questionId, text, genreIds}, ...]
 * 
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
    try{
        const answer = await Answer.get(req.params.id);
        return res.json({ answer });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[id] {fld1, fld2, ... } => { answer }
 * 
 * Patches answer data.
 * 
 * fields can be: { questionId, text, genreIds }
 * 
 * Returns { id, questionId, text, genreIds }
 * 
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next){
    try{
        const validator = jsonschema.validate(req.body, answerUpdateSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e=>e.stack);
            throw new BadRequestError(errs);
        }

        const answer = await Answer.update(req.params.id, req.body);
        return res.json({ answer });
    }catch(err){
        return next(err);
    }
});

/** DELETE /[id] => { deleted: id }
 * 
 * Authorization: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next){
    try{
        await Answer.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    }catch(err){
        return next(err);
    }
});
console.log('Answers routes initialized');

module.exports = router;

