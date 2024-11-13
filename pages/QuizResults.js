import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Grid, Typography, Card, CardMedia, CardContent, Button, Box } from '@mui/material';
import MovieApi from '../services/api';

const QuizResult = ({ }) => {
  const { id } = useParams(); // Get quiz instance ID from URL params
  const [recommendations, setRecommendations] = useState({ high: [], medium: [], low: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch quiz results based on the quiz ID using MovieApi
  useEffect(() => {
    const fetchResults = async () => {
      if (!id) {
        console.error("ID is undefined.");
        setLoading(false);
      }
      try {
        let fetchedQuizResults;
        if (id) {
          // Fetch results from the DB
          fetchedQuizResults = await MovieApi.getQuizRecommendations(id);
        }

        console.log("Result of getQuizRecommendations:", { fetchedQuizResults });
        // Set recommendations into state
        setRecommendations({
          high: fetchedQuizResults.quiz.recommendations.high || [],
          medium: fetchedQuizResults.quiz.recommendations.medium || [],
          low: fetchedQuizResults.quiz.recommendations.low || [],
        });

        console.log("Recommendations on the frontend:", recommendations);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quiz results:", error);
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  const handleClick = (media) => {
    navigate(`/media/${media.mediaType}/${media.externalId}`);
  }

  if (loading) {
    return <Typography variant="h5">Loading your recommendations...</Typography>;
  }

  if (!loading && recommendations.high.length === 0 && recommendations.medium.length === 0 && recommendations.low.length === 0) {
    return <Typography variant="h5">No recommendations found for this quiz instance.</Typography>;
  }

  // Renders movie/show cards for each group
  const renderMediaCards = (mediaList) => {
    console.log({ mediaList })
    return (
      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
        {mediaList.slice(0, mediaList.length).map((media) => (
          <Grid item xs={12} sm={6} md={4} key={media.id} externalId={media.externalId} mediaType={media.mediaType} sx={{ maxWidth: '350px' }}>
            <Card
              onClick={() => handleClick(media)}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                m: 1, // adds margin around each card
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                boxShadow: 1, // adds a shadow to the card
                '&:hover': {
                  boxShadow: 4, // adds a larger shadow on hover
                  transform: 'translateY(-5px)'// lifts the card on hover
                }
              }}>
              <Box sx={{
                width: '100%',
                paddingTop: '100%',
                position: 'relative',
                maxHeight: '200px',
              }}>
                <CardMedia
                  component="img"
                  image={media.posterUrl}
                  alt={media.title}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    backgroundColor: '#f5f5f5' // light grey background
                  }}
                />
              </Box>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>{media.title}</Typography>
                <Typography variant="body2">{media.overview}</Typography>
                <Typography variant='body2'>{media.releaseDate}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  };

  return (
    <Box sx={{ padding: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        Your Quiz Results
      </Typography>


      <Typography variant="h5" gutterBottom>
        High Priority Picks
      </Typography>
      <Grid container spacing={2}>
        {renderMediaCards(recommendations.high)}
      </Grid>


      <Typography variant="h5" gutterBottom sx={{ marginTop: '2rem' }}>
        Medium Priority Picks
      </Typography>
      <Grid container spacing={2}>
        {renderMediaCards(recommendations.medium)}
      </Grid>


      <Typography variant="h5" gutterBottom sx={{ marginTop: '2rem' }}>
        Low Priority Picks
      </Typography>
      <Grid container spacing={2}>
        {renderMediaCards(recommendations.low)}
      </Grid>


      <Box sx={{ marginTop: '2rem', textAlign: 'center' }}>
        <Button variant="contained" color="primary" component={Link} to="/quiz">
          Take Another Quiz
        </Button>
      </Box>
    </Box>
  );
};

export default QuizResult;
