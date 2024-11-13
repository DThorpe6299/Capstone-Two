const axios = require("axios");
const BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;

class TMDBService {

    // Convert time range to minutes
    static convertTimeToMinutes(timeRange) {
        const timeMap = {
            'less than 45 minutes': 45,
            '45 minutes - 1 hour': 60,
            '1 - 2 hours': 120,
            '2 - 3 hours': 180,
            '3 - 4 hours': 240,
            '4+ hours': 360
        };
        return timeMap[timeRange] || 0;
    }

    /** 
     * Fetches movies or TV shows based on specified criteria.
     * 
     * @param {string} mediaType - The type of media to fetch (movies or tv).
     * @param {Array} genres - An array of genre IDs to filter the results.
     * @param {string} language - The language code for the original language of the media.
     * @param {string} availableTime - The time range available for viewing.
     * @param {Object} genreFrequency - An object containing the frequency of genres.
     * @returns {Object} - An object containing recommendations grouped by frequency.
     */


    static async fetchMoviesByCriteria(mediaType, genres, language, availableTime, genreFrequency) {
        console.log('genreFrequency:', genreFrequency);
        console.log('Fetching with criteria:', mediaType, genres, language, availableTime);
        try {
            const groupedGenres = this._groupGenresByFrequency(genres, genreFrequency);
            console.log('Grouped Genres:', groupedGenres);

            const recommendations = { high: [], medium: [], low: [] };

            for (let [group, genreIds] of Object.entries(groupedGenres)) {
                if (group.length === 0) continue;
                const mediaUrl = mediaType === 'movies' ? `${BASE_URL}/discover/movie` : `${BASE_URL}/discover/tv`;
                const params = {
                    with_genres: genreIds.map(Number).join("|"),  // Ensures genres IDs are sent as numbers
                    with_original_language: language,
                    sort_by: "popularity.desc",
                    "vote_average.gte": 5,
                    "with_runtime.lte": this.convertTimeToMinutes(availableTime)
                };

                console.log("API Request Params: ", params);
                const response = await axios.get(mediaUrl, {
                    headers: { Authorization: `Bearer ${TMDB_BEARER_TOKEN}` },
                    params
                });
                console.log('API response:', response.data);

                recommendations[group] = response.data.results.map(media => ({
                    id: media.id,
                    title: mediaType === 'movies' ? media.title : media.name,
                    posterUrl: media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : 'default-poster-url.jpg',
                    overview: media.overview,
                    runtime: mediaType === 'movies' ? media.runtime : (media.episode_run_time?.[0] || 0),
                    releaseDate: mediaType === 'movies' ? media.release_date : media.first_air_date
                }));
                if (mediaType === 'movies') {
                    recommendations[group].forEach(group => {
                        group.mediaType = 'movies';
                    });
                } else {
                    recommendations[group].forEach(group => {
                        group.mediaType = 'shows';
                    });
                }
            }

            return recommendations;
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            return {};
        }
    }

    // Fetch both movie and TV show recommendations
    static async fetchBothByCriteria(genres, language, availableTime, genreFrequency) {
        const movieRecommendations = await this.fetchMoviesByCriteria('movies', genres, language, availableTime, genreFrequency);

        console.log('movieRecommendations:', movieRecommendations);

        const showRecommendations = await this.fetchMoviesByCriteria('tv', genres, language, availableTime, genreFrequency);

        console.log('showRecommendations:', showRecommendations);

        const combinedRecommendations = {};
        for (let group of ['high', 'medium', 'low']) {
            combinedRecommendations[group] = [
                ...(movieRecommendations[group] || []),
                ...(showRecommendations[group] || [])
            ];
        }

        return combinedRecommendations;
    }

    // Group genres by frequency (high, medium, low)
    static _groupGenresByFrequency(genres, genreFrequency = {}) {
        // First pass: Count frequencies
        const frequencies = genres.reduce((acc, genreId) => {
            acc[genreId] = (acc[genreId] || 0) + 1;
            return acc;
        }, { ...genreFrequency });
        console.log('genreFrequency:', genreFrequency);

        // Second pass: Group genres based on final frequencies
        const highFrequency = new Set();
        const mediumFrequency = new Set();
        const lowFrequency = new Set();

        // Sort genres by frequency to ensure consistent grouping
        Object.entries(frequencies)
            .sort(([, freqA], [, freqB]) => freqB - freqA) // Sort by frequency descending
            .forEach(([genreId, frequency]) => {
                if (frequency > 30) {
                    highFrequency.add(genreId);
                } else if (30 >= frequency > 10) {
                    mediumFrequency.add(genreId);
                } else {
                    lowFrequency.add(genreId);
                }
            });

        // Convert Sets to Arrays
        const groupedGenres = {
            high: Array.from(highFrequency),
            medium: Array.from(mediumFrequency),
            low: Array.from(lowFrequency)
        };

        // Debug logging
        console.log('Frequency counts:', frequencies);
        console.log('Grouped Genres:', groupedGenres);

        return groupedGenres;
    }

    /** 
     * Get recommendations based on the provided data.
     * 
     * @param {Object} data - The input data containing answers.
     * @returns {Object} - An object containing genre groups based on the media type.
     */
    static async getRecommendations({ genreFrequency, mediaType, genres, language, availableTime } = data) {
        console.log('Getting recommendations...');
        console.log('data for recommendations:', { genreFrequency, mediaType, genres, language, availableTime });


        if (mediaType === 'both') {
            console.log('Fetching both media types...');
            const genreGroups = await TMDBService.fetchBothByCriteria(genres, language, availableTime, genreFrequency);
            console.log('genre groups for both:', genreGroups);
            return genreGroups;
        } else {
            console.log('Fetching single media type...');
            const genreGroups = await TMDBService.fetchMoviesByCriteria(mediaType, genres, language, availableTime, genreFrequency);
            console.log('genre groups for single:', genreGroups);
            return genreGroups;
        }
    }

    static async getMedia(mediaType, mediaExternalId) {
        console.log('Getting media...:', mediaType, mediaExternalId);
        try {
            const mediaUrl = mediaType === 'movies' ? `${BASE_URL}/movie/${mediaExternalId}?language=en-US` : `${BASE_URL}/tv/${mediaExternalId}?language=en-US`;
            const response = await axios.get(mediaUrl, {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${TMDB_BEARER_TOKEN}`
                }
            });
            console.log('API response:', response.data);
            if (response.data.name) {
                response.data.mediaType = 'shows'
            } else if (response.data.title) {
                response.data.mediaType = 'movies'
            }
            const media = {
                title: mediaType === 'movies' ? response.data.title : response.data.name,
                overview: response.data.overview,
                posterUrl: `https://image.tmdb.org/t/p/w500${response.data.poster_path}`,
                backdropUrl: `https://image.tmdb.org/t/p/w500${response.data.backdrop_path}`,
                releaseDate: mediaType === 'movies' ? response.data.release_date : response.data.first_air_date,
                lastAirDate: mediaType === 'movies' ? null : response.data.last_air_date,
                runtime: mediaType === 'movies' ? response.data.runtime : (response.data.episode_run_time?.[0] || 0),
                seasons: mediaType === 'tv' ? response.data.number_of_seasons : 0,
                episodes: mediaType === 'tv' ? response.data.number_of_episodes : 0,
                spokenLanguages: response.data.spoken_languages.map(lang => lang.english_name).join(', '),
                status: response.data.status,
                tagline: response.data.tagline,
                productionCompanies: response.data.production_companies.map(company => company.name).join(', ')
            }
            console.log('Fetched media:', media);
            return media;

        } catch (error) {
            console.error('Error fetching media:', error);
        }
    }
}

module.exports = TMDBService;