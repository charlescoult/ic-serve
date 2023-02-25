import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Routes, Route } from 'react-router-dom'

/* Routes */
// import ObjectivityApp from 'objectivity'

/* Pages */
import NotFoundPage from 'pages/notFound.page'
import HomePage from 'pages/home.page'
import BoardPage from 'pages/board.page'

/* Components */
// import Sidebar from 'components/sidebar'

import { createTheme } from 'theme'

import {
  SwipeableDrawer,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Drawer,
  Button,
  CssBaseline,
  Paper,
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'


const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={<HomePage />}
    />

    <Route
      path="/board"
      element={<BoardPage />}
    />

    <Route
      path="*"
      element={<NotFoundPage />}
    />
  </Routes>
)

const HUDAppBar = ({ ...props }) => (
  <AppBar
    position='static'
    { ...props }
  >
    <Toolbar>
      <Typography variant='h6'
        component='div'
        sx={ {
          flexGrow: 1,
        } }
      >
        Test
      </Typography>
    </Toolbar>
  </AppBar>
)

const HUDSideBar = ({ ...props }) => {
  return (
    <Paper
      { ...props }
      open={ true }
      square
    >
      test
    </Paper>
  )
}

const HUD = ({ ...props }) => {
  console.log(props)
  return (
    <Box
      { ...props }
      sx={{
        flexGrow: 1,
        height: '100vh',
        width: '100vw',
        // background: 'red',
        overflow: 'hidden',
      }}
    >
      <HUDAppBar
      />

      <Box
        sx={ {
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'auto',
          height: '100%',
          // width: '100%', // flexGrow takes care of this
          // background: 'yellow',
        } }
      >

        <HUDSideBar
        />

        <Box
          sx={ {
            flexGrow: 1,
          } }
        >
          { 
            props.children
          }
        </Box>

      </Box>

    </Box>
  )
}

HUD.propTypes = {
  children: PropTypes.any,
}

const App = ({ ...props }) => {
  const theme = createTheme()

  return (
    <React.Fragment
      key="anchor"
    >
      <ThemeProvider
        theme={theme}
      >
        <CssBaseline />

        <HUD
        >

          {/* TODO ConditionalWrapper based on isMobile */}
          <Box
            sx={ {
              // background: 'yellow',
              height: '100%',
              overflow: 'auto',
            } }
          >
            <Container
              elevation={3}
              fixed
              sx={{
                marginY: 2,
                display: 'flex',
                flexDirection: 'column',
                // background: 'blue',
              }}
            >
              <AppRoutes
              />
            </Container>
          </Box>

        </HUD>

      </ThemeProvider>
    </React.Fragment>
  )
}

export default App
