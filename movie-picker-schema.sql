CREATE TABLE quiz_versions (
    id SERIAL PRIMARY KEY,
    version_number INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    iso_639_1 VARCHAR(10) UNIQUE NOT NULL,
    english_name TEXT NOT NULL
);


CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('movie', 'show')),
    external_id VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_version_id INT REFERENCES quiz_versions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    question_id INT REFERENCES questions(id) ON DELETE CASCADE,
    type TEXT DEFAULT NULL,
    text TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quiz_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movies (
    id SERIAL PRIMARY KEY,                     
    genre_id INTEGER REFERENCES genres(id) ON DELETE SET NULL, 
    title VARCHAR(255) NOT NULL,               
    plot TEXT,                                 
    poster_url TEXT,                           
    trailer_url TEXT,                         
    runtime INTEGER, 
    release_date DATE,                         
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shows (
    id SERIAL PRIMARY KEY,
    genre_id INTEGER REFERENCES genres(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    plot TEXT,
    poster_url TEXT,
    trailer_url TEXT,
    runtime INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE film_type AS ENUM ('movie', 'show');

--use to grab associated movies for the quiz_recommendations table
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    external_id INTEGER NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    media_type film_type NOT NULL,
    overview TEXT,
    poster_url TEXT,
    release_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_external_id_and_media_type UNIQUE (external_id, media_type)
);

CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    poster_url TEXT,
    backdrop_url TEXT
);

CREATE TABLE collections_media (
    collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
    media_id INTEGER REFERENCES media(id) ON DELETE CASCADE,
    PRIMARY KEY (collection_id, media_id)
);


CREATE TABLE media_genres (
    media_id INTEGER REFERENCES media(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (media_id, genre_id)
);


CREATE TABLE actors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movies_actors (
    movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    actor_id INTEGER REFERENCES actors(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, actor_id) -- Composite primary key
);

CREATE TABLE shows_actors (
    show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
    actor_id INTEGER REFERENCES actors(id) ON DELETE CASCADE,
    PRIMARY KEY (show_id, actor_id) -- Composite primary key
);

CREATE TABLE quiz_answers (
    id SERIAL PRIMARY KEY,
    quiz_version_id INTEGER REFERENCES quiz_versions(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    answer_id INTEGER REFERENCES answers(id) ON DELETE CASCADE,
    quiz_instance_id UUID REFERENCES quiz_instances(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE group_priority AS ENUM ('high', 'medium', 'low');
CREATE TABLE quiz_recommendations (
    id SERIAL PRIMARY KEY,
    quiz_instance_id UUID REFERENCES quiz_instances(id) ON DELETE CASCADE,
    group_level group_priority NOT NULL,
    media_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE answers_genres (
    answer_id INT NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    genre_id INT NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (answer_id, genre_id),  -- no duplicate pairs with unique ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quiz_genre_frequency (
    id SERIAL PRIMARY KEY,
    quiz_instance_id UUID NOT NULL REFERENCES quiz_instances(id) ON DELETE CASCADE,
    genre_id INT REFERENCES genres(id) ON DELETE CASCADE,
    genre_external_id VARCHAR(10) NOT NULL,
    genre_type VARCHAR(10),
    frequency INT DEFAULT 0,
    CONSTRAINT fk_genres FOREIGN KEY (genre_external_id, genre_type)
    REFERENCES genres (external_id, type),
    CONSTRAINT quiz_genre_frequency_unique
    UNIQUE (quiz_instance_id, genre_id, genre_external_id, genre_type);
);