"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../../helpers/sql");

/** Related functions for quizzes */

class Answer {
    /**Create answers for the quiz questions (from data), update db, return new answer data.
     * 
     * data should be { text, type }
     * 
     * Returns { versionId, text, type }
     * 
     * Throws BadRequestError if question is already in the database.
     * 
     */

    static async create({questionId, text, genreIds}){
        const duplicateCheck = await db.query(
            `SELECT text
            FROM answers
            WHERE text = $1`,
            [text]);

        if(duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate question: ${text}`);

        const result = await db.query(
            `INSERT INTO answers
             (question_id, text)
             VALUES ($1, $2)
             RETURNING id, question_id AS "questionId", text, created_at AS "createdAt"`,
            [questionId, text]
        );

        const answer = result.rows[0];

        // Insert into answers_genres table for each genreId
        for (let genreId of genreIds) {
            await db.query(
                `INSERT INTO answers_genres
                 (answer_id, genre_id)
                 VALUES ($1, $2)`,
                [answer.id, genreId]
            );
        }
        answer.genreIds = genreIds;
        return answer;
    }

    static async findAll(){
        const result = await db.query(
            `SELECT id,
                question_id AS "questionId",
                text, genre_ids AS "genreId"
                FROM answers
                ORDER BY id`
        );

        return result.rows;
    }

    static async get(id){
        const answerRes = await db.query(
            `SELECT id,
            question_id AS "questionId",
            text, genre_ids AS "genreIds"
            FROM answers WHERE id = $1`,
            [id]
        );
        const answer = answerRes.rows[0];
        return answer;
    }

    static async update(id, data){
        const {setCols, values} = sqlForPartialUpdate(
            data,
            {
                questionId: "question_id",
                text: "text",
                genreId: "genre_ids"
            }
        );
        const handleVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE answers
        SET ${setCols}
        WHERE id =${handleVarIdx}
        RETURNING id, question_id AS "questionId", text, genre_ids AS "genreIds"`;

        const result = await db.query(querySql, [...values, id]);
        const answer = result.rows[0];

        if(!answer) throw new NotFoundError(`No answer found: ${id}`);

        return answer;
    }

    static async remove(id){
        const result = await db.query(
            `DELETE FROM
            answer WHERE id = $1
            RETURNING id`,
            [id]
        );
        const answer = result.rows[0];
        if(!answer) throw new NotFoundError(`No answer found: ${id}`)
        
        return { message: `Answer ${id} deleted.` }
    }

}
module.exports = Answer;