import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import {Box} from '@mui/material';

const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
};


const Banner = ({movies}) =>{


    return(
        <Box>
            <Carousel responsive={responsive}>
                {movies.map(movie =>{
                  
                })}
            </Carousel>
        </Box>
    )
}

export default Banner;