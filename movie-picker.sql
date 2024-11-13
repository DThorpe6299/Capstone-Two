\echo 'Delete and recreate movie_picker db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE movie_picker;
CREATE DATABASE movie_picker;
\connect movie_picker

\i movie-picker-schema.sql
\i movie-picker-seed.sql

\echo 'Delete and recreate movie_picker_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE movie_picker_test;
CREATE DATABASE movie_picker_test;
\connect movie_picker_test

\i movie-picker-schema.sql