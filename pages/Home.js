import Header from "../components/common/Header";


import Banner from "../components/common/Banner";

import {Box} from '@mui/material';

import { useEffect, useState } from "react";

const Home = () =>{

    const [movies, setMovies] = useState([]);

//     useEffect(()=>{
//         const getData = async () =>{
//         let response = await MovieCategories(TRENDING_MOVIES);
//         console.log({response})
//         setMovies(response.results)
//     }
//     getData();
// },[])

    return (
         <>  
            <Header />
            <Box>
                <Banner movies={movies}/>
            </Box>
        </>
    )
}
export default Home;