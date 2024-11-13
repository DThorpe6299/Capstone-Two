"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../../helpers/sql");

/** Related functions for quiz_versions */

class QuizVersion {
   /**Create the latest version of the quiz (from data)
    , update db, return new quiz version
    *
    *data should be { versionNumber }
    *
    *Returns { id, versionNumber}
    *
    */
   
    static async create({versionNumber}){
        const duplicateCheck = await db.query(
            `SELECT version_number AS "versionNumber"
            FROM quiz_versions WHERE version_number = $1`,
            [versionNumber]);
           
        if(duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate quiz version: ${versionNumber}`)
       
        const result = await db.query(
            `INSERT INTO quiz_versions
            (version_number) VALUES
            ($1) RETURNING
            id, version_number AS "versionNumber"`,
            [versionNumber]);
       
        const quizVersion = result.rows[0];
        return quizVersion;
    }
   
    /**Find all quiz versions */
    static async findAll(){
        const quizVersionsRes = await db.query(`
            SELECT q.id, q.version_number AS "versionNumber"
            FROM quiz_versions
        `);
       
        console.log({quizVersionsRes});
        return quizVersionsRes.rows;
    }
   
    //FIX "SELECT" TYPO IN QUESTION MODEL NOW
    /**Find a quiz with an id*/
    static async get(id){
        const quizVersionRes = await db.query(`
            SELECT id, version_number AS "versionNumber" FROM quiz_versions
            WHERE id = $1
        `, [id]);
       
        const quizVersion = quizVersionRes.rows[0];

        if(!quizVersion) throw new NotFoundError(`No quiz version found: ${id}`);
        return quizVersion;
    }
   
    static async update(id, data){
        const {setCols, values} = sqlForPartialUpdate(
            data,
            {
                versionNumber: "version_number"
            });
            const handleVarIdx = "$" + (values.length + 1);
           
            const querySql = `UPDATE quiz_versions SET ${setCols}
                WHERE id = ${handleVarIdx}
                RETURNING id, version_number AS "versionNumber"`;
            const result = await db.query(querySql, [...values, id]);
            const quizVersion = result.rows[0];
           
            if(!quizVersion) throw new NotFoundError(`No quiz version found: ${id}`);
            return quizVersion;
    }
   
    /**Delete given quiz version from database; returns confirmation message */
    static async remove(id){
        const result = await db.query(`
        DELETE FROM
        quiz_versions WHERE id = $1
        RETURNING id
        `, [id]);
       
        const quizVersion = result.rows[0]
        if(!quizVersion) throw new NotFoundError(`No question: ${id}`)
        return { message: `Quiz version ${id} deleted.` }
    }
}

module.exports = QuizVersion;