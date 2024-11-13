"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../../helpers/sql");

/** Related functions for actors */

class Actor {
    /**Create a new actor in the database.
     * 
     * data should be { firstName, lastName }
     * 
     * Returns { id, firstName, lastName, createdAt }
     */
    static async create(data) {
        const { firstName, lastName } = data;

        // Check for duplicate actor based on first_name and last_name
        const duplicateCheck = await db.query(
            `SELECT id
             FROM actors
             WHERE first_name = $1 AND last_name = $2`,
            [firstName, lastName]
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate actor: ${firstName} ${lastName}`);
        }

        const result = await db.query(
            `INSERT INTO actors (first_name, last_name, created_at)
             VALUES ($1, $2, CURRENT_TIMESTAMP)
             RETURNING id, first_name AS "firstName", last_name AS "lastName", created_at AS "createdAt"`,
            [firstName, lastName]
        );
        const actor = result.rows[0];
        return actor;
    }

    /**Find all actors */
    static async findAll() {
        const result = await db.query(
            `SELECT id, first_name AS "firstName", last_name AS "lastName", created_at AS "createdAt"
             FROM actors`
        );
        return result.rows;
    }

    /**Find an actor by ID
     * 
     * Returns { id, firstName, lastName, createdAt }
     * 
     * Throws NotFoundError if actor not found.
     */
    static async get(id) {
        const result = await db.query(
            `SELECT id, first_name AS "firstName", last_name AS "lastName", created_at AS "createdAt"
             FROM actors
             WHERE id = $1`,
            [id]
        );
        const actor = result.rows[0];

        if (!actor) throw new NotFoundError(`No actor found: ${id}`);

        return actor;
    }

    /**Update an actor by ID
     * 
     * data should be { firstName, lastName }
     * 
     * Returns { id, firstName, lastName, createdAt }
     * 
     * Throws NotFoundError if actor not found.
     */
    static async update(id, data) {
        const { firstName, lastName } = data;

        // Check for duplicates based on first_name and last_name
        const duplicateCheck = await db.query(
            `SELECT id
             FROM actors
             WHERE first_name = $1 AND last_name = $2 AND id <> $3`,
            [firstName, lastName, id]
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate actor: ${firstName} ${lastName}`);
        }

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                firstName: "first_name",
                lastName: "last_name"
            }
        );
        const querySql = `UPDATE actors SET ${setCols}
                          WHERE id = $${values.length + 1}
                          RETURNING id, first_name AS "firstName", last_name AS "lastName", created_at AS "createdAt"`;
        const result = await db.query(querySql, [...values, id]);
        const actor = result.rows[0];

        if (!actor) throw new NotFoundError(`No actor found: ${id}`);

        return actor;
    }

    /**Delete an actor by ID
     * 
     * Returns a confirmation message.
     * 
     * Throws NotFoundError if actor not found.
     */
    static async remove(id) {
        const result = await db.query(
            `DELETE FROM actors
             WHERE id = $1
             RETURNING id`,
            [id]
        );
        const actor = result.rows[0];

        if (!actor) throw new NotFoundError(`No actor found: ${id}`);

        return { message: `Actor ${id} deleted.` };
    }
}

module.exports = Actor;