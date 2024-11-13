const express = require("express");
const Quiz = require("../models/quiz");
const { ExpressError } = require("../expressError");

const router = new express.Router();

/** GET / => { versionId, questions: [{ id, text, answers: [{ id, text }] }] }
 *
 * Fetches the latest quiz version along with its questions and answers.
 */
router.get("/", async function (req, res, next) {
  try {
    const quiz = await Quiz.getLatestQuizWithQuestionsAndAnswers();
    return res.status(200).json(quiz);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  console.log("Getting quiz results")
  try {
    const quiz = await Quiz.getQuizResults(req.params.id);
    console.log("Retireved quiz results successfully:", quiz)
    return res.status(200).json({ quiz });
  } catch (err) {
    return next(err);
  }
})

/** POST /submit { answers: [{ questionId, answerId }] } => { quizInstanceId, answers }
 *
 * Submits the user's quiz answers and creates a new quiz instance with recommendations.
 */
router.post("/submit", async function (req, res, next) {
  const { answers } = req.body;
  console.log('Received data:', req.body);
  if (!answers || answers.length === 0) {
    throw new ExpressError("No answers provided", 400);
  }

  console.log('Submitting quiz answers...')
  try {
    const quizInstance = await Quiz.submitQuizAnswers(req.body); // returns the quiz_instance_id, answers and weighted genre groups.
    return res.status(201).json(quizInstance);
  } catch (err) {
    return next(err);
  }
}
);

module.exports = router;