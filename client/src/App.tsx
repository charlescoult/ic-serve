import React, {
  useState,
  useEffect
} from 'react'

import {
  Routes,
  Route
} from 'react-router-dom'

/* Routes */
// import ObjectivityApp from 'objectivity'

/* Pages */
import NotFoundPage from 'pages/notFound.page'
import HomePage from 'pages/home.page'

/* Components */
// import Sidebar from 'components/sidebar'

import { createTheme } from 'theme'

import {
  Box,
  Container,
  Drawer,
  Button,
  CssBaseline,
  Paper
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

const App = ({
  ...props 
}) => {
  const theme = createTheme()

  return (
    <React.Fragment key="anchor">
      <ThemeProvider theme={theme}>
        <CssBaseline />

        { /* TODO ConditionalWrapper based on isMobile */ }
        <Container
          elevation={ 3 }
          fixed
          sx={ {
            marginY: 2,
            display: 'flex',
            flexDirection: 'column',
          } }
        >
          <Routes>
            <Route
              path="/"
              element={<HomePage />}
            />

            <Route
              path="*"
              element={<NotFoundPage />}
            />
          </Routes>
        </Container>


      </ThemeProvider>
    </React.Fragment>
  )
}

export default App
