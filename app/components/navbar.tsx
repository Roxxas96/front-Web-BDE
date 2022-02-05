import { Link, LoaderFunction } from "remix";
import { User } from "~/models/User";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { Grid } from "@mui/material";
import React from "react";

const pages = ["Products", "Pricing", "Blog"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

export const loader: LoaderFunction = () => {
  console.log("test");
};

function displayAuthMenu(userInfo?: User) {
  if (!userInfo) {
    return (
      <div>
        <Link
          style={{ textDecoration: "none", color: "white" }}
          className="link"
          to="/login"
        >
          <Button color="inherit" variant="text">
            Login
          </Button>
        </Link>
        <Link
          style={{ textDecoration: "none", color: "white" }}
          className="link"
          to="/register"
        >
          <Button color="inherit" variant="text">
            Register
          </Button>
        </Link>
      </div>
    );
  } else {
    console.log(userInfo);
    return (
      <div>
        <Grid container>
          <Typography
            variant="h5"
            component="div"
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "none", lg: "block" },
            }}
            style={{ marginRight: "10px" }}
          >
            {userInfo.pseudo},
          </Typography>
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1 }}
            style={{ marginRight: "50px" }}
          >
            Wallet : <b>{userInfo.wallet}</b>
          </Typography>
          <form method="post" action="/logout">
            <Button type="submit" color="inherit" variant="text">
              Logout
            </Button>
          </form>
        </Grid>
      </div>
    );
  }
}

export default function NavBar({ userInfo }: { userInfo?: User }) {
  let leftLinks: { name: string; link: string }[] = [];

  if (userInfo) {
    leftLinks.push(
      {
        name: "Home",
        link: "/",
      },
      {
        name: "Challenges",
        link: "/challenges",
      },
      {
        name: "Shop",
        link: "/shop",
      }
    );

    if (userInfo?.privilege && userInfo?.privilege > 0) {
      leftLinks.push(
        { name: "Challenge Admin", link: "/challenges/admin" },
        { name: "Shop Admin", link: "/shop/admin" }
      );
    }
  } else {
    leftLinks.push({
      name: "Home",
      link: "/",
    });
  }

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <div className="navbar">
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Box
              sx={{
                flexGrow: 1,
                display: { md: "flex", lg: "none" },
              }}
            >
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { md: "flex", lg: "none" },
                }}
              >
                {leftLinks.map((link, index) => (
                  <Link
                    style={{ textDecoration: "none", color: "black" }}
                    to={link.link}
                  >
                    <MenuItem key={index} onClick={handleCloseNavMenu}>
                      <Typography textAlign="center">{link.name}</Typography>
                    </MenuItem>
                  </Link>
                ))}
              </Menu>
            </Box>
            <Typography
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "none", lg: "block" },
              }}
            >
              {leftLinks.map((link) => {
                return (
                  <Link
                    style={{ textDecoration: "none", color: "white" }}
                    className="link"
                    to={link.link}
                  >
                    <Button color="inherit" variant="text">
                      {link.name}
                    </Button>
                  </Link>
                );
              })}
            </Typography>
            {displayAuthMenu(userInfo)}
          </Toolbar>
        </AppBar>
      </Box>
    </div>
  );
}
