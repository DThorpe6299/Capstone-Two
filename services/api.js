import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;

class MovieApi {
  // the token for interactive with the API will be stored here.
  static token;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${TMDB_BEARER_TOKEN}` };
    const params = (method === "get")
      ? data
      : {};
    console.log('MovieApi at work')
    try {
      console.log('inside try for MovieApi')
      const userResponse = (await axios({ url, method, data, params, headers })).data;
      console.log('user response done')
      console.log({ url, method, data, params, headers })
      console.log({ userResponse })
      return userResponse;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error || "Unknown error occurred."
      throw Array.isArray(message) ? message : [message];
    }
  }

  //Quiz Routes

  /**Get an instance of the latest quiz version */
  static async getLatestQuiz() {
    let res = await this.request('quiz', {}, 'get');
    console.log(res)
    return res;
  }

  /**Submit the a user's instance of a completed quiz */
  static async submitQuiz(data) {
    const { answers } = data;
    console.log({ answers })
    console.log('submitted quiz', data);
    let res = await this.request('quiz/submit', data, 'post');
    console.log({ res })
    return res;
  }

  static async getQuizRecommendations(id) {
    try {
      const res = await this.request(`quiz/${id}`, {}, 'get');
      console.log({ res });
      return res;
    } catch (error) {
      console.error("Error fetching quiz version:", error);
      return { quizVersion: undefined };
    }
  }

  static async getMediaDetails(mediaType, mediaExternalId) {
    try {
      const res = await this.request(`media/${mediaType}/${mediaExternalId}`, {}, 'get');
      console.log({ res });
      return res;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response?.data?.status_message || "Unknown error occurred.";
      throw Array.isArray(message) ? message : [message];
    }
  }




  // User API routes

  /** Get details on a user by username. */
  static async getUser(username) {
    let res = await this.request(`users/${username}`, {}, 'get');
    return res.user;
  }

  /** Get all users */

  static async getUsers() {
    let res = await this.request('users', {}, 'get');
    return res.users;
  }

  /** Register a new user. */
  static async postUser(data) {
    console.log('creating user:', data)
    let res = await this.request('auth/register', data, 'post');
    console.log({ res });
    return res.token;
  }

  /** Update a user. */
  static async patchUser(username, data) {
    let res = await this.request(`users/${username}`, data, 'patch');
    console.log({ usernameInPatchUser: username })
    console.log({ res })
    return res;
  }

  /** Delete a user. */
  static async deleteUser(username) {
    let res = await this.request(`users/${username}`, {}, 'delete');
    return res.message;
  }

  /** Login for users */
  static async login(data) {
    let res = await this.request('auth/token', data, 'post');
    MovieApi.token = res.token;
    return res.token;
  }

  /**Answer API routes*/

  /** Get an answer's information by id*/
  static async getAnswer(id) {
    let res = await this.request(`answers/${id}`, {}, 'get');
    return res.answer;
  }

  /**Get all answers */
  static async getAnswers() {
    let res = await this.request(`answers`, {}, 'get')
    return res.answers;
  }

  /**Update an answer */
  static async updateAnswer(id, data) {
    let res = await this.request(`answers/${id}`, data, 'patch');
    return res.answer;
  }

  /**Delete an answer */
  static async deleteAnswer(id) {
    let res = await this.request(`answers/${id}`, {}, 'delete');
    return res.message;
  }
}

export default MovieApi;

