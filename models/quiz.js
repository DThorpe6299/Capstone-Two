const { stat } = require("fs");
const db = require("../db");
const { ExpressError, BadRequestError } = require("../expressError");
const TMDBService = require("../services/tmdbService"); // Import the TMDBService


class Quiz {
  /** 
   * Get the latest quiz version along with its questions and answers.
   * 
   * Returns { versionId, questions: [{ id, text, answers: [{ id, text }] }] }
   */
  static async getLatestQuizWithQuestionsAndAnswers() {
    const quizVersionResult = await db.query(
      `SELECT id FROM quiz_versions ORDER BY id DESC LIMIT 1`
    );
    const quizVersionId = quizVersionResult.rows[0].id;

    const questionsResult = await db.query(
      `SELECT id, text 
             FROM questions 
             WHERE quiz_version_id = $1`,
      [quizVersionId]
    );
    const questions = questionsResult.rows;

    for (let question of questions) {
      const answersResult = await db.query(
        `SELECT id, text 
                 FROM answers 
                 WHERE question_id = $1`,
        [question.id]
      );
      question.answers = answersResult.rows;
    }

    return { quizVersionId, questions };
  }

  /**
   * Get all answer values with their respective question, genre, and quiz instance
   * 
   * @param {number[]} answerIds
   * @returns {object[]} results, where each result is { answer_id, answer_text, question_id, question_text, genre_id, genre_name, genre_external_id, genre_created_at, quiz_instance_id }
   */
  static async getAllAnswerValuesWithQuizInstance(answerIds) {
    const query = `
            SELECT DISTINCT a.id AS answer_id, a.text AS answer_text,
                            q.id AS question_id, q.text AS question_text,
                            g.id AS genre_id, g.name AS genre_name, g.external_id AS genre_external_id,
                            ag.created_at AS genre_created_at,
                            qi.id AS quiz_instance_id
            FROM answers a
            JOIN questions q ON a.question_id = q.id
            LEFT JOIN answers_genres ag ON a.id = ag.answer_id
            LEFT JOIN genres g ON ag.genre_id = g.id
            JOIN quiz_answers qa ON a.id = qa.answer_id
            JOIN quiz_instances qi ON qa.quiz_instance_id = qi.id
            WHERE a.id = ANY($1::int[])
        `;

    const result = await db.query(query, [answerIds]);
    return result.rows;
  }


  /** 
   * When the user submits their answers, this method stores them in the quiz_answers table 
   * and retrieves movie/show recommendations based on the user's selections.
   * 
   * Returns { quizInstanceId, answers, genreGroups: { group1, group2, group3 }, recommendations }
   */
  static async submitQuizAnswers(data) {
    const { answers } = data;

    // Create a new quiz instance
    const instanceResult = await db.query(`
          INSERT INTO quiz_instances DEFAULT VALUES RETURNING id;
        `);
    const quizInstanceId = instanceResult.rows[0].id;

    // Get the current quiz version
    const versionResult = await db.query(`
          SELECT id FROM quiz_versions ORDER BY created_at DESC LIMIT 1;
        `);
    const quizVersionId = versionResult.rows[0].id;

    // Store user's answers
    for (const answer of answers) {
      await db.query(`
            INSERT INTO quiz_answers (quiz_version_id, question_id, answer_id, quiz_instance_id)
            VALUES ($1, $2, $3, $4);
          `, [quizVersionId, answer.questionId, answer.answerId, quizInstanceId]);

      // Update genre frequency based on answers
      // Joining answer_genres and quiz_answers tables and then filter by quiz_instance_id and answer_id
      const genreFrequencyData = await db.query(`
            SELECT ag.genre_id, g.external_id AS genre_external_id, g.type AS genre_type
            FROM answers_genres ag
            JOIN quiz_answers qa ON ag.answer_id = qa.answer_id
            JOIN genres g ON ag.genre_id = g.id
            WHERE qa.quiz_instance_id = $1 AND ag.answer_id = $2
          `, [quizInstanceId, answer.answerId]);
      console.log("genreFrequencyData:", genreFrequencyData);

      if (genreFrequencyData.rows.length > 0) {
        for (const genre of genreFrequencyData.rows) {
          await db.query(`
                INSERT INTO quiz_genre_frequency (quiz_instance_id, genre_id, genre_external_id, genre_type, frequency)
                VALUES ($1, $2, $3, $4, 1)
                ON CONFLICT (quiz_instance_id, genre_id)
                DO UPDATE SET frequency = quiz_genre_frequency.frequency + 1;


              `, [quizInstanceId, genre.genre_id, genre.genre_external_id, genre.genre_type]);
        }
      }
    }

    const answerIds = answers.map(answer => answer.answerId);

    // Use the getAllAnswerValuesWithQuizInstance function to retrieve relevant details
    const answerDetails = await Quiz.getAllAnswerValuesWithQuizInstance(answerIds);
    console.log("answerDetails:", answerDetails);

    // Extract external genre_ids for the API query
    const genres = answerDetails
      .filter(detail => detail.genre_external_id)
      .map(detail => detail.genre_external_id);

    console.log("genres from answer details:", genres);

    // Extract availableTime, language, and mediaType from answerDetails
    const availableTimeResponse = answerDetails.find(detail => detail.question_text === 'How much time do you have to watch?')?.answer_text || data.availableTime;
    console.log("availableTimeResponse:", availableTimeResponse);

    const languageName = answerDetails.find(detail => detail.question_text === 'What language do you prefer?')?.answer_text || data.language;
    console.log("languageName:", languageName);
    console.log("typeof languageName:", typeof languageName)

    const languageResponse = (await db.query(`SELECT iso_639_1 from languages WHERE english_name = $1`, [languageName])).rows[0].iso_639_1;
    console.log("languageResponse:", languageResponse);
    const mediaTypeResponse = answerDetails.find(detail => detail.question_text === 'Do you prefer movies or TV shows?')?.answer_text || data.mediaType;

    // Fetch the genre frequencies for the quiz instance
    const genreFrequenciesResult = await db.query(`
          SELECT genre_external_id, frequency
          FROM quiz_genre_frequency
          WHERE quiz_instance_id = $1
          ORDER BY frequency DESC;
        `, [quizInstanceId]);

    console.log("genreFrequenciesResult:", genreFrequenciesResult);

    const genreFrequencies = genreFrequenciesResult.rows.reduce((acc, row) => {
      acc[row.genre_external_id] = row.frequency;
      return acc;
    }, {});

    console.log("genreFrequencies via Quiz model:", genreFrequencies);


    // Call getRecommendations with genreFrequency object
    const recommendations = await TMDBService.getRecommendations({
      genreFrequency: genreFrequencies,
      mediaType: mediaTypeResponse,
      genres: genres,
      language: languageResponse,
      availableTime: availableTimeResponse,
    });
    console.log("Here are the recommendations via TMDBService.getRecommendations:", { recommendations });



    const selectedRecs = Quiz.getRandomRecommendations(recommendations);
    console.log("selectedRecs:", selectedRecs);

    // Store recommendations in the quiz_recommendations table
    for (let [group, recs] of Object.entries(selectedRecs)) {
      console.log("Processing group:", group, "with recommendations:", recs);
      for (let rec of recs) {
        console.log("Checking recommendation:", rec);

        //Perform duplicate check before insertion into media table.
        const duplicateCheck = await db.query(`SELECT id FROM media WHERE external_id = $1`, [rec.id]);

        //If a duplicate is found, skip the insertion and move on to the next record.
        if (duplicateCheck.rows.length === 0) {
          await db.query(`
        INSERT INTO media (external_id, title, media_type, overview, poster_url, release_date) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [rec.id, rec.title, rec.mediaType, rec.overview, rec.posterUrl, rec.releaseDate || rec.first_to_air_date]);
        }
        console.log("duplicateCheck:", duplicateCheck.rows[0]?.id);

        const mediaId = await db.query(`SELECT id FROM media WHERE external_id = $1`, [rec.id]);
        console.log("mediaId after DB insert:", mediaId.rows[0]?.id);

        console.log("Inserting into quiz_recommendations:", {
          quizInstanceId,
          group,
          mediaId: mediaId.rows[0]?.id,
        });

        try {
          const recExists = await db.query(`
        SELECT id FROM quiz_recommendations 
        WHERE quiz_instance_id = $1 AND media_id = $2
      `, [quizInstanceId, mediaId.rows[0]?.id]);

          if (recExists.rows.length > 0) {
            console.log(`Recommendation for quizInstanceId ${quizInstanceId} and mediaId ${mediaId.rows[0]?.id} already exists. Skipping.`);
            continue;
          }

          await db.query(`
        INSERT INTO quiz_recommendations (quiz_instance_id, group_level, media_id) 
        VALUES ($1, $2, $3)
      `, [quizInstanceId, group, mediaId.rows[0]?.id]);
        } catch (error) {
          console.error(`Error inserting recommendation for media ID ${mediaId.rows[0]?.id}:`, error);
        }
      }
    }

    const results = await Quiz.getQuizResults(quizInstanceId);
    console.log("Results of quiz:", results);
    return results;
  }




  /** 
   * Get the quiz results by group priorities in descending order for a given quiz instance ID.
   * 
   * Returns { quizInstanceId, recommendations: { high, medium, low } }
   */
  static async getQuizResults(quizInstanceId) {
    console.log("Quiz results for quizInstanceId:", quizInstanceId);
    // Query all recommendations associated with the quiz instance, including the media data
    const groupRecommendations = await db.query(`
          SELECT qr.group_level, m.id AS media_id, m.title, m.overview, m.poster_url, m.release_date,
          m.external_id, m.media_type AS "mediaType"
          FROM quiz_recommendations qr
          JOIN media m ON qr.media_id = m.id
          WHERE qr.quiz_instance_id = $1
          ORDER BY qr.group_level DESC;
      `, [quizInstanceId]);

    console.log("groupRecommendations:", groupRecommendations);

    // Organize recommendations by group level
    const recommendations = groupRecommendations.rows.reduce((acc, row) => {
      // Initialize the group level if it hasn't been encountered before
      if (!acc[row.group_level]) acc[row.group_level] = [];

      // Add media details to the appropriate group level
      acc[row.group_level].push({
        id: row.media_id,
        title: row.title,
        overview: row.overview,
        posterUrl: row.poster_url,
        runtime: row.runtime,
        releaseDate: row.release_date,
        mediaType: row.mediaType,
        externalId: row.external_id
      });

      return acc;
    }, {});

    return { quizInstanceId, recommendations };
  }


  /**
 * Selects a random subset of unique recommendations from each group level.
 * Shuffles each group independently and selects up to 4 unique items per group.
 *
 * @param {Object} recommendations - An object with group levels as keys and arrays of recommendation objects as values.
 * @returns {Object} An object with group levels as keys and randomly selected arrays of up to 4 unique recommendation objects as values.
 */
  static getRandomRecommendations(recommendations) {
    const selectedRecommendations = {};
    const groupLevels = Object.keys(recommendations);

    for (const groupLevel of groupLevels) {
      const recommendationsForGroup = recommendations[groupLevel];
      const uniqueRecommendations = new Map(); // Use Map to track unique recommendations by ID

      // Create array of unique recommendations for this group
      recommendationsForGroup.forEach(rec => {
        if (!uniqueRecommendations.has(rec.id)) {
          uniqueRecommendations.set(rec.id, rec);
        }
      });

      // Convert unique recommendations back to array and shuffle
      const uniqueRecsArray = Array.from(uniqueRecommendations.values());
      const shuffledRecommendations = Quiz.shuffleArray([...uniqueRecsArray]);

      // Take only the first 4 recommendations
      selectedRecommendations[groupLevel] = shuffledRecommendations.slice(0, 4);

      console.log(`Group ${groupLevel}: Selected ${selectedRecommendations[groupLevel].length} unique recommendations`);
    }

    return selectedRecommendations;
  }

  /**
   * Randomly shuffles the elements of an array in place.
   *
   * This function implements the Fisher-Yates (Knuth) shuffle algorithm
   * to ensure an unbiased result.
   *
   * @param {Array} array - The array to be shuffled.
   * @returns {Array} The shuffled array.
   */
  static shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

}

module.exports = Quiz;
