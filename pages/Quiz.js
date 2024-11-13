import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, RadioGroup, Radio, FormControlLabel, Typography, Container } from "@mui/material";
import { MobileStepper } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import MovieApi from "../services/api"

const Quiz = () => {
  const navigate = useNavigate();
  const [quizFormData, setQuizFormData] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [quiz, setQuiz] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [maxSteps, setMaxSteps] = useState(0);
  const [isNextEnabled, setIsNextEnabled] = useState(false);

  // Fetch quiz questions from backend on component mount
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const quizData = await MovieApi.getLatestQuiz();
        console.log({quizData})
        setQuiz(quizData.questions);
        setMaxSteps(quizData.questions.length);
      } catch (err) {
        console.error("Error fetching quiz", err);
      }
    }
    fetchQuiz();
  }, []);

  // Handle answer selection
  const handleAnswerSelect = (questionId, answerId) => {
    setSelectedAnswer(answerId);
    setIsNextEnabled(true);
    setQuizFormData({
      ...quizFormData,
      [questionId]: answerId, // Store questionId and answerId in quizFormData  
    });
    console.log({quizFormData})
  };

  // Move to the next question or submit the quiz
  const handleNext = async () => {
    if (activeStep === maxSteps - 1) {
      // If it's the last step, the quiz is submitted
      console.log({quizFormData})
      handleSubmit();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setIsNextEnabled(false); 
      setSelectedAnswer(null);
    }
  };


  // Go to the previous question
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    console.log('Quiz submission in progress');
  
    try {
      const answers = Object.keys(quizFormData).map((questionId) => ({
        questionId: parseInt(questionId),
        answerId: parseInt(quizFormData[questionId])
      }));
  
      const dataToSubmit = { answers };
      const response = await MovieApi.submitQuiz(dataToSubmit);
      console.log("Quiz submission successful:", response);
  
      const { quizInstanceId } = response;
      navigate(`/quiz/${quizInstanceId}`);  // Redirect to QuizResult page with quizInstanceId
  
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };
  

  if (!quiz.length) return <Typography>Loading Quiz...</Typography>;

  const currentQuestion = quiz[activeStep];

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Need A Suggestion?
      </Typography>

      <Box>
        {/* Render current question */}
        <Typography variant="h6">{currentQuestion.text}</Typography>
        <RadioGroup
          value={selectedAnswer}
          onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
        >
          {currentQuestion.answers.map((answer) => (
            <FormControlLabel
              key={answer.id}
              value={answer.id}
              control={<Radio />}
              label={answer.text}
            />
          ))}
        </RadioGroup>
      </Box>

      {/* Stepper for navigation */}
      <MobileStepper
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={!isNextEnabled} // Disable button until answer is selected
            variant="contained"
          >
            {activeStep === maxSteps -1 ? "Submit" : "Next"}
            {activeStep !== maxSteps-1 && <KeyboardArrowRight />}
          </Button>
        }
        backButton={
          <Button
            size="small"
            onClick={handleBack}
            disabled={activeStep === 0} // Disable on first step
            variant="contained"
          >
            <KeyboardArrowLeft />
            Back
          </Button>
        }
      />
    </Container>
  );
};

export default Quiz;
