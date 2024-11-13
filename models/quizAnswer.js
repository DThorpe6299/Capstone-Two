"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Related functions for quiz answers */

class QuizAnswer {
    /**Create a new quiz answer in the database.
     * 
     * data should be { questionId, answerId, quizInstancesId }
     * quizVersionId defaults to the latest version.
     * 
     * Returns { id, quizVersionId, questionId, answerId, quizInstancesId, createdAt }
     */
    static async create({ questionId, answerId, quizInstancesId }) {
        // Find the latest quiz version ID
        const versionRes = await db.query(
            `SELECT id
             FROM quiz_versions
             ORDER BY id DESC
             LIMIT 1`
        );

        const quizVersionId = versionRes.rows[0].id;

        const result = await db.query(
            `INSERT INTO quiz_answers
             (quiz_version_id, question_id, answer_id, quiz_instances_id, created_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
             RETURNING id, quiz_version_id AS "quizVersionId", question_id AS "questionId", 
                       answer_id AS "answerId", quiz_instances_id AS "quizInstancesId", created_at AS "createdAt"`,
            [quizVersionId, questionId, answerId, quizInstancesId]
        );

        const quizAnswer = result.rows[0];
        return quizAnswer;
    }

    /**Find a quiz answer by ID
     * 
     * Returns { id, quizVersionId, questionId, answerId, quizInstancesId, createdAt }
     * 
     * Throws NotFoundError if quiz answer not found.
     */
    static async get(id) {
        const quizAnswerRes = await db.query(
            `SELECT id, quiz_version_id AS "quizVersionId", question_id AS "questionId",
                    answer_id AS "answerId", quiz_instances_id AS "quizInstancesId", created_at AS "createdAt"
             FROM quiz_answers
             WHERE id = $1`,
            [id]
        );

        const quizAnswer = quizAnswerRes.rows[0];

        if (!quizAnswer) throw new NotFoundError(`No quiz answer found: ${id}`);

        return quizAnswer;
    }

    /**Update a quiz answer by ID.
     * 
     * data can include { questionId, answerId, quizInstancesId }
     * 
     * Returns { id, quizVersionId, questionId, answerId, quizInstancesId, createdAt }
     * 
     * Throws NotFoundError if quiz answer not found.
     */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                questionId: "question_id",
                answerId: "answer_id",
                quizInstancesId: "quiz_instances_id"
            }
        );
        const handleVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE quiz_answers
                          SET ${setCols}
                          WHERE id = ${handleVarIdx}
                          RETURNING id, quiz_version_id AS "quizVersionId", question_id AS "questionId",
                                    answer_id AS "answerId", quiz_instances_id AS "quizInstancesId", created_at AS "createdAt"`;
        const result = await db.query(querySql, [...values, id]);
        const quizAnswer = result.rows[0];

        if (!quizAnswer) throw new NotFoundError(`No quiz answer found: ${id}`);

        return quizAnswer;
    }

    /**Delete a quiz answer by ID
     * 
     * Returns a confirmation message.
     * 
     * Throws NotFoundError if quiz answer not found.
     */
    static async remove(id) {
        const result = await db.query(
            `DELETE FROM quiz_answers
             WHERE id = $1
             RETURNING id`,
            [id]
        );
        const quizAnswer = result.rows[0];

        if (!quizAnswer) throw new NotFoundError(`No quiz answer found: ${id}`);

        return { message: `Quiz answer ${id} deleted.` };
    }
}

module.exports = QuizAnswer;
