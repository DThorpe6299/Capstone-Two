"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../../helpers/sql");

/** Related functions for quizzes */

class Question {
    /**Create a question for the quiz (from data), update db, return new question data.
     * 
     * data should be { text, type }
     * 
     * Returns { versionId, text, type }
     * 
     * Throws BadRequestError if question is already in the database.
     * 
     */

    static async create({ text }){
        const duplicateCheck = await db.query(
            `SELECT text
            FROM questions
            WHERE text = $1`,
            [text]);
        
        if(duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate question: ${text}`)

        const latestVersionRes = await db.query(
            `SELECT MAX(id) AS "latestVersionId" FROM quiz_versions`
        );

        const latestVersionId = versionRes.rows[0].latestVersionId;

        const result = await db.query(
            `INSERT INTO questions
            (quiz_version_id, text) VALUES
            ($1, $2) RETURNING
            id, version_id AS "versionId", text`,
            [latestVersionId, text]
        );
        const question = result.rows[0];
        return question;
    }
    
    /** Find all questions (optionally filter by version number). */
    static async findAll(filters = {}) {
        let query = `SELECT id, quiz_version_id AS "quizVersionId", text
                     FROM questions`;
        let whereExpressions = [];
        let queryValues = [];

        const { version } = filters;

        if (version) {
            queryValues.push(version);
            whereExpressions.push(`quiz_version_id = $${queryValues.length}`);
        }

        if (whereExpressions.length > 0) {
            query += " WHERE " + whereExpressions.join(" AND ");
        }

        query += " ORDER BY id";
        const result = await db.query(query, queryValues);
        return result.rows;
    }

    static async get(id){
        const questionRes = await db.query(
            `SELECT id, version_id AS "versionId",
            text, type
            FROM questions WHERE id = $1
            `, [id]
        );
        const question = questionRes.rows[0];
        return question;
    }
    
    static async update(id, data){
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                text: "text",
                type: "type",
            }
        );
        const handleVarIdx = "$" + (values.length + 1);
        
        const querySql = `UPDATE questions
                            SET ${setCols}
                            WHERE id = ${handleVarIdx}
                            RETURNING id, version_id AS "versionId", text, type`;
        const result = await db.query(querySql, [...values, id]);
        const question = result.rows[0];

        if(!question) throw new NotFoundError(`No question: ${id}`);

        return question;
    }

    /**Delete given question from database; returns undefined
     * 
     * Throws NotFoundError if question not found.
     */
    static async remove(id){
        const result = await db.query(
            `DELETE FROM
            questions WHERE id = $1
            RETURNING id`,
            [id]
        );
        const question = result.rows[0]
        if(!question) throw new NotFoundError(`No question: ${id}`);

        return { message: `Question ${id} deleted.` };
    }

}
module.exports = Question;