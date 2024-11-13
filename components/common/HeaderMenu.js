import {Menu, MenuItem} from '@mui/material'
import { Link } from 'react-router-dom';


const HeaderMenu = ({open, handleClose}) =>{
    
    const openMenu = Boolean(open);
    

    return(
        <Menu
            id="basic-menu"
            anchorEl={open}
            open={open}
            onClose={handleClose}
            MenuListProps={{
            'aria-labelledby': 'basic-button',
            }}
        >
            <MenuItem onClick={handleClose}><Link to='/movies'>Movies</Link></MenuItem>
            <MenuItem onClick={handleClose}><Link to='/tv-shows'>TV Shows</Link></MenuItem>
            <MenuItem onClick={handleClose}><Link to='/profile'>Profile</Link></MenuItem> {/**conditionally render Profile and Log In/Sign Up and Logout */}
            <MenuItem onClick={handleClose}>Logout</MenuItem> 
      </Menu>
    )
}
export default HeaderMenu;