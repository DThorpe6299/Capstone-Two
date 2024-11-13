"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../../helpers/sql");

/** Related functions for collections */
class Collection {
    /**Create a new collection in the database.
     * 
     * data should be { name, poster_url, backdrop_url }
     * 
     * Returns { id }
     */

    static async create(data){
        const {name, posterUrl, backdropUrl} = data;

        //Check for duplicate collection based on name;
        const duplicateCheck = await db.query(
            `SELECT name
            FROM collections
            WHERE name = $1`,
            [name]
        );

        if(duplicateCheck.rows[0]){
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

    static async insertCollectionMedia(collectionId, mediaId) {
        await db.query(`
          INSERT INTO collections_media (collection_id, media_id)
          VALUES ($1, $2)`,
          [collectionId, mediaId]
        );
      }
}

module.exports = Collection;