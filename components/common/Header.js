import { logoUrl } from '../../constants/constants';
import { AppBar, Toolbar, styled, Box, Typography, InputBase} from '@mui/material';
import { Menu, Bookmark, Star } from '@mui/icons-material';
import { useState } from 'react';
import HeaderMenu from './HeaderMenu';

//A customizer for the Toolbar component
const StyledToolBar = styled(Toolbar)`
    background: #121212;
    min-height: 56px !important;
    padding: 0 115px;
    justify-content: space-between;
    & * {
        padding: 0 16px:
    }
    & > div {
    display: flex;
    align-items: center;
    cursor: pointer;
    } & > p {
        font-size: 14px;
        font-weight: 600; 
    } & > p {
        font-size: 14px;
        font-weight: 600; 
    }
` /**this has highest rule */;

const Logo = styled('img')({
    width: 64
})

const RightBox = styled(Box)`
  display: flex;
  margin-left: auto;
  align-items: center;
  gap: 20px; /* Adjust the gap as needed */
`;

const InputSearchField = styled(InputBase)`
    background: #FFFFFF;
    height: 30px;
    width: 55%;
    border-radius: 5px;
`

const Header = () =>{
const [open, setOpen] = useState(null);

const handleClick = (e) => {
    setOpen(e.currentTarget);
}

const handleClose = () =>{
    setOpen(null);
}

    return (
        <AppBar position='static'>
            <StyledToolBar>
                <Logo src={logoUrl} alt='logo'/>
                <Box onClick={handleClick}>
                    <Menu />
                    <Typography>Menu</Typography>
                </Box>
                <HeaderMenu open={open} handleClose={handleClose}/>
                <InputSearchField />
                <RightBox>
                    <Typography>Sign Up/Login</Typography>
                    <Typography>Pick a Flick</Typography>
                    <Star />
                    <Typography>WatchList</Typography>{/**WatchList and Watched Movies will be conditionally rendered if a user is authenticated */}
                    <Bookmark />
                    <Typography>Watched Movies</Typography>
                </RightBox>
            </StyledToolBar>
        </AppBar>
    )
}
export default Header;