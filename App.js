import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import QuizResults from './pages/QuizResults';
import Media from './pages/Media';

function App() {






  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          {/**<Route path='/profile' element={<Profile/>}/>*/}
          <Route path='/quiz' element={<Quiz />} />
          <Route path='/quiz/:id' element={<QuizResults />} />
          <Route path='/media/:mediaType/:externalId' element={<Media />} />
          <Route path='*' element={<Home />} />

          {/* <Route path='/movies' element={<MoviesHome/>} />
          <Route path='/movie/:id' element={<Movie/>}/>
          <Route path='/movies/pick-a-flick' element={<MoviePickerPage/>}/>
          <Route path='/movies/:type' element={<MovieGenreList/>}/> {/**This is for each genre. Same goes for shows *}
          <Route path='/movies/top-rated' element={<TopRatedMovies/>}/>
          <Route path='/movies/trending' element={<TrendingMovies/>}/>
          <Route path='/movies/fan-favorites/:period' element={<FanFavoriteMovies/>}/>
          <Route path='/movies/upcoming' element={<UpcomingMovies/>}/>


          <Route path='/tv-show/:id' element={<TVShow/>}/>
          <Route path='/tv-shows' element={<TVShowsHome/>}/>
          <Route path='/tv-shows/pick-a-flick' element={<TVShowPickerPage/>}/>
          <Route path='/tv-shows/:type' element={<ShowGenreList/>}/>
          <Route path='/tv-shows/top-rated' element={<TopRatedShows/>}/>
          <Route path='/tv-shows/trending' element={<TrendingShows/>}/>
          <Route path='/tv-shows/fan-favorites/:period' element={<FanFavoriteShows/>}/>
          <Route path='/tv-shows/upcoming' element={<UpcomingShows/>}/> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
