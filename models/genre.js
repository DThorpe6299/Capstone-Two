"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Related functions for genres */
class Genre {
    /** Create a new genre in the database.
     * 
     * data should be { externalId, name, type }
     * 
     * Returns { id, externalId, name, type }
     */
    static async create(data) {
        const { externalId, name, type } = data;

        // Check for duplicate genre based on external API ID
        const duplicateCheck = await db.query(
            `SELECT id
             FROM genres
             WHERE external_id = $1`,
            [externalId]
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate genre detected.`);
        }

        // Insert new genre
        const result = await db.query(
            `INSERT INTO genres (external_id, name, type)
             VALUES ($1, $2, $3)
             RETURNING id, external_id AS "externalId", name, type`,
            [externalId, name, type]
        );

        return result.rows[0];
    }

    /** Find all genres */
    static async findAll() {
        const result = await db.query(
            `SELECT id, external_id AS "externalId", name, type
             FROM genres`
        );
        return result.rows;
    }

    /** Find a genre by ID
     * 
     * Returns { id, externalId, name, type }
     * 
     * Throws NotFoundError if genre not found.
     */
    static async get(id) {
        const result = await db.query(
            `SELECT id, external_id AS "externalId", name, type
             FROM genres
             WHERE id = $1`,
            [id]
        );
        const genre = result.rows[0];

        if (!genre) throw new NotFoundError(`No genre found: ${id}`);

        return genre;
    }

    /** Update a genre by ID
     * 
     * data should be { externalId, name, type }
     * 
     * Returns { id, externalId, name, type }
     * 
     * Throws NotFoundError if genre not found.
     */
    static async update(id, data) {
        const { externalId, name, type } = data;

        const result = await db.query(
            `UPDATE genres
             SET external_id = $1, name = $2, type = $3
             WHERE id = $4
             RETURNING id, external_id AS "externalId", name, type`,
            [externalId, name, type, id]
        );
        const genre = result.rows[0];

        if (!genre) throw new NotFoundError(`No genre found: ${id}`);

        return genre;
    }

    /** Delete a genre by ID
     * 
     * Returns a confirmation message.
     * 
     * Throws NotFoundError if genre not found.
     */
    static async remove(id) {
        const result = await db.query(
            `DELETE FROM genres
             WHERE id = $1
             RETURNING id`,
            [id]
        );
        const genre = result.rows[0];

        if (!genre) throw new NotFoundError(`No genre found: ${id}`);

        return { message: `Genre ${id} deleted.` };
    }
}

module.exports = Genre;
