"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const TMDBService = require("../services/tmdbService");

/** Related functions for media */

class Media {
    /**Create a new media in the database.
     * 
     * data should be { title, overview, posterUrl, trailerUrl, runtime, genreId }
     * 
     * Returns { id, title, overview, posterUrl, trailerUrl, runtime, genreId, createdAt }
     */
    static async create(data) {
        const { externalId, title, overview, mediaType, posterUrl, releaseDate } = data;

        // Check for duplicate media based on external API ID
        const duplicateCheck = await db.query(
            `SELECT id
             FROM media
             WHERE external_id = $1 AND media_type = $2`,
            [externalId, mediaType]
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate film detected.`);
        }

        const result = await db.query(`
            INSERT INTO media 
            (external_id, title, media_type, overview, poster_url, runtime, release_date) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id`,
            [id, title, mediaType, overview, posterUrl, trailerUrl, runtime, releaseDate]
        );
        const media = result.rows[0].id;
        return media;
    }

    static async fetchMedia(mediaType, externalId) {
        const response = await TMDBService.getMedia(mediaType, externalId);
        console.log('API media response:', response);
        return response;
    }

    static async insertCollection(data) {
        const { name, posterUrl, backdropUrl } = data;

        //Check for duplicate collection based on name;
        const duplicateCheck = await db.query(
            `SELECT name
            FROM collections
            WHERE name = $1`,
            [name]
        );

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate collection detected.`);
        }

        const result = await db.query(`
            INSERT INTO collections 
            (name, poster_url, backdrop_url) 
            VALUES ($1, $2, $3)
            RETURNING id`,
            [posterUrl, backdropUrl]
        )
        return result.rows[0] ? result.rows[0].id : null;
    }

    static async insertCollectionMedia(data) {
        const { collectionId, mediaId } = data

        //Check for duplicate entry on collectionId and mediaId;
        const duplicateCheck = await db.query(
            `SELECT collection_id,
            media_id FROM collections_media
            WHERE collection_id = $1
            AND media_id = $2`,
            [collectionId, mediaId]
        )

        if (duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate collection media association found`)

        const result = await db.query(
            `INSERT INTO collections_media 
            (collection_id, media_id)
            VALUES ($1, $2)`,
            [collectionId, mediaId]
        )

        return result.rows[0]

    }

    static async insertMediaGenre(data) {
        const { mediaId, genreId } = data;

        const duplicateCheck = await db.query(
            `SELECT id FROM
            media_genres WHERE
            media_id = $1 AND 
            genre_id = $2`,
            [mediaId, genreId]
        )

        if (duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate media genre association found`);

        const result = await db.query(
            `INSERT INTO media_genres 
            (media_id, genre_id)
            VALUES ($1, $2)`,
            [mediaId, genreId]
        );
        return result.rows[0];
    }

    /**Find all media */
    static async findAll() {
        const result = await db.query(
            `SELECT id, external_id AS "externalId", genre_id AS "genreId", title, overview, media_type AS "mediaType", poster_url AS "posterUrl", trailer_url AS "trailerUrl", runtime, created_at AS "createdAt"
             FROM media`
        );
        return result.rows;
    }

    /**Find a media by ID
     * 
     * Returns { id, title, overview, posterUrl, trailerUrl, runtime, genreId, createdAt }
     * 
     * Throws NotFoundError if media not found.
     */
    static async get(id) {
        const result = await db.query(
            `SELECT id, external_id AS "externalId", genre_id AS "genreId", title, overview, media_type AS "mediaType", poster_url AS "posterUrl", trailer_url AS "trailerUrl", runtime, created_at AS "createdAt"
             FROM media
             WHERE id = $1`,
            [id]
        );
        const media = result.rows[0];

        if (!media) throw new NotFoundError(`No media found: ${id}`);

        return media;
    }

    /**Update a media by ID
     * 
     * data should be { title, overview, posterUrl, trailerUrl, runtime, genreId }
     * 
     * Returns { id, title, overview, posterUrl, trailerUrl, runtime, genreId, createdAt }
     * 
     * Throws NotFoundError if media not found.
     */
    static async update(id, data) {
        const { genreId, title, overview, mediaType, posterUrl, trailerUrl, runtime } = data;

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                genreId: "genre_id",
                title: "title",
                overview: "overview",
                mediaType: "media_type",
                posterUrl: "poster_url",
                trailerUrl: "trailer_url",
                runtime: "runtime"
            }
        );
        const querySql = `UPDATE media SET ${setCols}
                          WHERE id = $${values.length + 1}
                          RETURNING id, title, overview, poster_url AS "posterUrl", trailer_url AS "trailerUrl", runtime, genre_id AS "genreId", created_at AS "createdAt"`;
        const result = await db.query(querySql, [...values, id]);
        const media = result.rows[0];

        if (!media) throw new NotFoundError(`No media found: ${id}`);

        return media;
    }

    /**Delete a media by ID
     * 
     * Returns a confirmation message.
     * 
     * Throws NotFoundError if media not found.
     */
    static async remove(id) {
        const result = await db.query(
            `DELETE FROM media
             WHERE id = $1
             RETURNING id`,
            [id]
        );
        const media = result.rows[0];

        if (!media) throw new NotFoundError(`No media found: ${id}`);

        return { message: `media ${id} deleted.` };
    }
}

module.exports = Media;
