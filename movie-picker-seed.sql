
INSERT INTO quiz_versions (version_number) VALUES (1);

INSERT INTO languages (iso_639_1, english_name) VALUES
    ('bi', 'Bislama'),
    ('cs', 'Czech'),
    ('ba', 'Bashkir'),
    ('ae', 'Avestan'),
    ('av', 'Avaric'),
    ('de', 'German'),
    ('mt', 'Maltese'),
    ('om', 'Oromo'),
    ('rm', 'Raeto-Romance'),
    ('so', 'Somali'),
    ('ts', 'Tsonga'),
    ('vi', 'Vietnamese'),
    ('gn', 'Guarani'),
    ('ig', 'Igbo'),
    ('it', 'Italian'),
    ('ki', 'Kikuyu'),
    ('ku', 'Kurdish'),
    ('la', 'Latin'),
    ('ln', 'Lingala'),
    ('lb', 'Letzeburgesch'),
    ('ny', 'Chichewa Nyanja'),
    ('pl', 'Polish'),
    ('si', 'Sinhalese'),
    ('to', 'Tonga'),
    ('az', 'Azerbaijani'),
    ('ce', 'Chechen'),
    ('cu', 'Slavic'),
    ('da', 'Danish'),
    ('hz', 'Herero'),
    ('ie', 'Interlingue'),
    ('rw', 'Kinyarwanda'),
    ('mi', 'Maori'),
    ('no', 'Norwegian'),
    ('pi', 'Pali'),
    ('sk', 'Slovak'),
    ('se', 'Northern Sami'),
    ('sm', 'Samoan'),
    ('uk', 'Ukrainian'),
    ('en', 'English'),
    ('ay', 'Aymara'),
    ('ca', 'Catalan'),
    ('eo', 'Esperanto'),
    ('ha', 'Hausa'),
    ('ho', 'Hiri Motu'),
    ('hu', 'Hungarian'),
    ('io', 'Ido'),
    ('ii', 'Yi'),
    ('kn', 'Kannada'),
    ('kv', 'Komi'),
    ('li', 'Limburgish'),
    ('oj', 'Ojibwa'),
    ('ru', 'Russian'),
    ('sr', 'Serbian'),
    ('sv', 'Swedish'),
    ('ty', 'Tahitian'),
    ('zu', 'Zulu'),
    ('ka', 'Georgian'),
    ('ch', 'Chamorro'),
    ('be', 'Belarusian'),
    ('br', 'Breton'),
    ('kw', 'Cornish'),
    ('fi', 'Finnish'),
    ('sh', 'Serbo-Croatian'),
    ('nn', 'Norwegian Nynorsk'),
    ('tt', 'Tatar'),
    ('tg', 'Tajik'),
    ('vo', 'Volapük'),
    ('ps', 'Pushto'),
    ('mk', 'Macedonian'),
    ('fr', 'French'),
    ('bm', 'Bambara'),
    ('eu', 'Basque'),
    ('fj', 'Fijian'),
    ('lg', 'Ganda'),
    ('nl', 'Dutch'),
    ('cy', 'Welsh'),
    ('ja', 'Japanese'),
    ('es', 'Spanish'),
    ('ko', 'Korean');



-- Insert movie and show genres
INSERT INTO genres (type, external_id, name) VALUES
    ('movie', '28', 'Action'),
    ('movie', '12', 'Adventure'),
    ('movie', '16', 'Animation'),
    ('movie', '35', 'Comedy'),
    ('movie', '80', 'Crime'),
    ('movie', '99', 'Documentary'),
    ('movie', '18', 'Drama'),
    ('movie', '10751', 'Family'),
    ('movie', '14', 'Fantasy'),
    ('movie', '36', 'History'),
    ('movie', '27', 'Horror'),
    ('movie', '10402', 'Music'),
    ('movie', '9648', 'Mystery'),
    ('movie', '10749', 'Romance'),
    ('movie', '878', 'Science Fiction'),
    ('movie', '10770', 'TV Movie'),
    ('movie', '53', 'Thriller'),
    ('movie', '10752', 'War'),
    ('movie', '37', 'Western'),

    ('show', '10759', 'Action & Adventure'),
    ('show', '16', 'Animation'),
    ('show', '35', 'Comedy'),
    ('show', '80', 'Crime'),
    ('show', '99', 'Documentary'),
    ('show', '18', 'Drama'),
    ('show', '10751', 'Family'),
    ('show', '10762', 'Kvalues'),
    ('show', '9648', 'Mystery'),
    ('show', '10763', 'News'),
    ('show', '10764', 'Reality'),
    ('show', '10765', 'Sci-Fi & Fantasy'),
    ('show', '10766', 'Soap'),
    ('show', '10767', 'Talk'),
    ('show', '10768', 'War & Politics'),
    ('show', '37', 'Western');

INSERT INTO questions (quiz_version_id, text) VALUES
    (1, 'Do you prefer movies or TV shows?'),
    (1, 'What genre do you prefer?'),
    (1, 'How much time do you have to watch?'),
    (1, 'What language do you prefer?'),
    (1, 'What is your preferred viewing time?'),
    (1, 'What pace do you prefer in your movies/TV shows?');


INSERT INTO answers (question_id, type, text) 
VALUES 
    (1, 'preference', 'movies'),
    (1, 'preference', 'shows'),
    (1, 'preference', 'both');


WITH genre_data AS (
    SELECT id, name FROM genres
) 
INSERT INTO answers (question_id, type, text) 
SELECT 2, 'genre', name 
FROM genre_data;


INSERT INTO answers (question_id, type, text) 
VALUES 
    (3, 'time available', 'less than 45 minutes'), --short film or episode
    (3, 'time available', '45 minutes - 1 hour'), --tv show or short film
    (3, 'time available', '1 - 2 hours'), --longer tv show episode or standard length for a movie
    (3, 'time available', '2 - 3 hours'), --longer movie or movie and episode of a show, or binge short episodes
    (3, 'time available', '3 - 4 hours'), -- binge longer episodes/ a whole season or a few movies
    (3, 'time available', '4+ hours');    --binge watching seasons of a show or movie marathon the cap could be around 6 or 7 hours.




INSERT INTO answers (question_id, type, text) 
SELECT 4, 'language', english_name 
FROM languages;

INSERT INTO answers (question_id, type, text) 
VALUES 
    (5, 'watch time', 'Morning'),
    (5, 'watch time', 'Afternoon'),
    (5, 'watch time', 'Evening'),
    (5, 'watch time', 'Nighttime'),

    (6, 'pace', 'Slow and Steady'),
    (6, 'pace', 'Moderate'),
    (6, 'pace', 'Fast-Paced');


-- Insert genres for movies, shows, and all genres for both
INSERT INTO answers_genres (answer_id, genre_id)
SELECT a.id, g.id
FROM answers a
JOIN genres g
ON (
  (a.text = 'movies' AND g.type = 'movie') OR
  (a.text = 'shows' AND g.type = 'show') OR
  (a.text = 'both' AND (g.type = 'movie' OR g.type = 'show'))
)
WHERE a.question_id = 1;

--tag answers to genre names for Q2
INSERT INTO answers_genres (answer_id, genre_id)
SELECT a.id, g.id
FROM answers a
JOIN genres g ON a.text = g.name
WHERE a.question_id = 2;

--tag genres to avaiable times
--INSERT INTO answers_genres (answer_id, genre_id)
--SELECT a.id, g.id
--FROM answers a
--JOIN genres g ON (TRUE) -- no direct relationship between answers and genres tables (no foreign keys)
--WHERE a.question_id = 3
--  AND (a.text = '45 minutes - 1 hour' AND g.name IN ('Comedy', 'Action', 'Thriller', 'Drama', 'Horror', 'Documentary'))
--  OR (a.text = '1 - 2 hours' AND g.name IN ('Comedy', 'Action', 'Drama', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary'))
--  OR (a.text = '2 - 3 hours' AND g.name IN ('Action', 'Drama', 'Sci-Fi', 'Fantasy', 'Romance', 'Thriller', 'Documentary'))
--  OR (a.text = '3 - 4 hours' AND g.name IN ('Action', 'Drama', 'Sci-Fi', 'Fantasy', 'Thriller', 'Documentary'))
--  OR (a.text = '4+ hours' AND g.name IN ('Action', 'Drama', 'Sci-Fi', 'Fantasy', 'Thriller', 'Documentary'));

--Languages question will have no bearing on genres so inserts an empty result.
--INSERT INTO answers_genres (answer_id, genre_id)
--SELECT a.id, g.id
--FROM answers a
--JOIN genres g
--WHERE a.question_id = 4

--tagging answers for viewing time to likely genres
INSERT INTO answers_genres (answer_id, genre_id)
SELECT a.id, g.id
FROM answers a
JOIN genres g ON (TRUE)
WHERE a.question_id = 5
  AND (a.text = 'Morning' AND g.name IN ('Family', 'Comedy', 'Drama', 'Documentary'))
  OR (a.text = 'Afternoon' AND g.name IN ('Comedy', 'Talk', 'Drama', 'Sci-Fi', 'Romance'))
  OR (a.text = 'Evening' AND g.name IN ('Action', 'Thriller', 'Drama', 'Sci-Fi', 'Romance'))
  OR (a.text = 'Nighttime' AND g.name IN ('Horror', 'Thriller', 'Drama', 'Sci-Fi', 'Fantasy'));


--tagging desired pace to likely genre options
INSERT INTO answers_genres (answer_id, genre_id)
SELECT a.id, g.id
FROM answers a
JOIN genres g ON (TRUE)
WHERE a.question_id = 6
  AND (a.text = 'Slow and Steady' AND g.name IN ('Drama', 'Romance', 'Documentary', 'Historical'))
  OR (a.text = 'Moderate' AND g.name IN ('Action', 'Comedy', 'Sci-Fi', 'Mystery'))
  OR (a.text = 'Fast-Paced' AND g.name IN ('Action', 'Thriller', 'Sci-Fi', 'Adventure'));