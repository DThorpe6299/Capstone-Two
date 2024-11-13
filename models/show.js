"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../../helpers/sql");

/** Related functions for shows */

class Show {
    /**Create a new show in the database.
     * 
     * data should be { title, plot, posterUrl, trailerUrl, runtime, genreId }
     * 
     * Returns { id, title, plot, posterUrl, trailerUrl, runtime, genreId, createdAt }
     */
    static async create(data) {
        const { title, plot, posterUrl, trailerUrl, runtime, genreId } = data;

        // Check for duplicate show based on plot
        const duplicateCheck = await db.query(
            `SELECT id
             FROM shows
             WHERE plot = $1`,
            [plot]
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate show plot detected.`);
        }

        const result = await db.query(
            `INSERT INTO shows (title, plot, poster_url, trailer_url, runtime, genre_id, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
             RETURNING id, title, plot, poster_url AS "posterUrl", trailer_url AS "trailerUrl", runtime, genre_id AS "genreId", created_at AS "createdAt"`,
            [title, plot, posterUrl, trailerUrl, runtime, genreId]
        );
        const show = result.rows[0];
        return show;
    }

    /**Find all shows */
    static async findAll() {
        const result = await db.query(
            `SELECT id, title, plot, poster_url AS "posterUrl", trailer_url AS "trailerUrl", runtime, genre_id AS "genreId", created_at AS "createdAt"
             FROM shows`
        );
        return result.rows;
    }

    /**Find a show by ID
     * 
     * Returns { id, title, plot, posterUrl, trailerUrl, runtime, genreId, createdAt }
     * 
     * Throws NotFoundError if show not found.
     */
    static async get(id) {
        const result = await db.query(
            `SELECT id, title, plot, poster_url AS "posterUrl", trailer_url AS "trailerUrl", runtime, genre_id AS "genreId", created_at AS "createdAt"
             FROM shows
             WHERE id = $1`,
            [id]
        );
        const show = result.rows[0];

        if (!show) throw new NotFoundError(`No show found: ${id}`);

        return show;
    }

    /**Update a show by ID
     * 
     * data should be { title, plot, posterUrl, trailerUrl, runtime, genreId }
     * 
     * Returns { id, title, plot, posterUrl, trailerUrl, runtime, genreId, createdAt }
     * 
     * Throws NotFoundError if show not found.
     */
    static async update(id, data) {
        const { title, plot, posterUrl, trailerUrl, runtime, genreId } = data;

        // Check for duplicates based on plot
        const duplicateCheck = await db.query(
            `SELECT id
             FROM shows
             WHERE plot = $1 AND id <> $2`,
            [plot, id]
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate show plot detected.`);
        }

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                title: "title",
                plot: "plot",
                posterUrl: "poster_url",
                trailerUrl: "trailer_url",
                runtime: "runtime",
                genreId: "genre_id"
            }
        );
        const querySql = `UPDATE shows SET ${setCols}
                          WHERE id = $${values.length + 1}
                          RETURNING id, title, plot, poster_url AS "posterUrl", trailer_url AS "trailerUrl", runtime, genre_id AS "genreId", created_at AS "createdAt"`;
        const result = await db.query(querySql, [...values, id]);
        const show = result.rows[0];

        if (!show) throw new NotFoundError(`No show found: ${id}`);

        return show;
    }

    /**Delete a show by ID
     * 
     * Returns a confirmation message.
     * 
     * Throws NotFoundError if show not found.
     */
    static async remove(id) {
        const result = await db.query(
            `DELETE FROM shows
             WHERE id = $1
             RETURNING id`,
            [id]
        );
        const show = result.rows[0];

        if (!show) throw new NotFoundError(`No show found: ${id}`);

        return { message: `Show ${id} deleted.` };
    }
}

module.exports = Show;
