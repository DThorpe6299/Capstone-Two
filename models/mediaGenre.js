"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Related functions for media_genres */
class MediaGenre {
    /** Insert a new entry into the media_genres table.
     * 
     * data should be { mediaId, genreId }
     * 
     * Returns { mediaId, genreId }
     */
    static async create(data) {
        const { mediaId, genreId } = data;

        // Check for duplicate media-genre entry
        const duplicateCheck = await db.query(
            `SELECT media_id, genre_id
             FROM media_genres
             WHERE media_id = $1 AND genre_id = $2`,
            [mediaId, genreId]
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate media-genre association found.`);
        }

        // Insert new media-genre association
        const result = await db.query(
            `INSERT INTO media_genres (media_id, genre_id)
             VALUES ($1, $2)
             RETURNING media_id AS "mediaId", genre_id AS "genreId"`,
            [mediaId, genreId]
        );

        return result.rows[0];
    }

    /** Find all media-genres associations */
    static async findAll() {
        const result = await db.query(
            `SELECT media_id AS "mediaId", genre_id AS "genreId"
             FROM media_genres`
        );
        return result.rows;
    }

    /** Find all genres for a specific media by mediaId
     * 
     * Returns an array of genres for the specified media.
     */
    static async findGenresByMedia(mediaId) {
        const result = await db.query(
            `SELECT g.id, g.name, g.external_id AS "externalId"
             FROM media_genres mg
             JOIN genres g ON mg.genre_id = g.id
             WHERE mg.media_id = $1`,
            [mediaId]
        );

        return result.rows;
    }

    /** Find all media for a specific genre by genreId
     * 
     * Returns an array of media for the specified genre.
     */
    static async findMediaByGenre(genreId) {
        const result = await db.query(
            `SELECT m.id, m.title, m.external_id AS "externalId"
             FROM media_genres mg
             JOIN media m ON mg.media_id = m.id
             WHERE mg.genre_id = $1`,
            [genreId]
        );

        return result.rows;
    }

    /** Delete a media-genre association by mediaId and genreId
     * 
     * Returns a confirmation message.
     */
    static async remove(mediaId, genreId) {
        const result = await db.query(
            `DELETE FROM media_genres
             WHERE media_id = $1 AND genre_id = $2
             RETURNING media_id AS "mediaId", genre_id AS "genreId"`,
            [mediaId, genreId]
        );

        const association = result.rows[0];

        if (!association) {
            throw new NotFoundError(`No media-genre association found for media ${mediaId} and genre ${genreId}`);
        }

        return { message: `Media-genre association between media ${mediaId} and genre ${genreId} deleted.` };
    }
}

module.exports = MediaGenre;
