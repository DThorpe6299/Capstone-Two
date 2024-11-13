import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Grid, Typography, Card, CardMedia, CardContent, Box } from "@mui/material";
import MovieApi from "../services/api";

const Media = () => {
    const { mediaType, externalId } = useParams();
    const [media, setMedia] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMediaDetails = async () => {
            try {
                let fetchedMedia;
                if (mediaType && externalId) {
                    fetchedMedia = await MovieApi.getMediaDetails(mediaType, externalId);
                }
                setLoading(true);

                setMedia(fetchedMedia.media);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching media details in component:", err);
            }
        }
        fetchMediaDetails();
    }, [mediaType, externalId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!media && !loading) {
        return <div>Media not found</div>;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} md={8} textAlign="center">
                    <Typography variant="h4" gutterBottom>{media.title}</Typography>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                        {media.tagline ? media.tagline : ""}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Release Date: {media.releaseDate} | Runtime: {media.runtime || media.episodeRunTime || 0} minutes
                    </Typography>
                </Grid>

                <Grid item xs={12} md={8} lg={6}>
                    <Card sx={{ boxShadow: 3 }}>
                        <CardMedia
                            component="img"
                            image={media.posterUrl}
                            alt={media.title}
                            sx={{
                                width: "100%",
                                height: "auto",
                                borderRadius: 2,
                                display: 'block',
                                mx: 'auto'
                            }}
                        />
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Overview</Typography>
                        <Typography variant="body1" paragraph>{media.overview}</Typography>

                        {media.seasons ? (
                            <Typography variant="body2" color="textSecondary">Seasons: {media.seasons}</Typography>
                        ) : null}
                        {media.episodes ? (
                            <Typography variant="body2" color="textSecondary">Episodes: {media.episodes}</Typography>
                        ) : null}
                        {media.lastAirDate ? (
                            <Typography variant="body2" color="textSecondary">Last Air Date: {media.lastAirDate}</Typography>
                        ) : null}
                        {media.status ? (
                            <Typography variant="body2" color="textSecondary">Status: {media.status}</Typography>
                        ) : null}
                        <Typography variant="body2" color="textSecondary">Spoken Languages: {media.spokenLanguages}</Typography>
                        <Typography variant="body2" color="textSecondary">Production Companies: {media.productionCompanies}</Typography>
                    </CardContent>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Media;
