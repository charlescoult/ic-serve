import React from 'react'

import { Box, Typography } from '@mui/material'

import WolfImage from 'wolf.svg'

// import { useGoogleRecaptchaVerify } from 'utility'

const NotFound = ({ ...props }) => {
  return (
    <Box
      sx={{
        padding: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '1',
      }}
    >
      <Typography align="center" variant="h5">
        This is not the page you are looking for...
      </Typography>

      <img alt="notFoundImage" src={WolfImage} />
    </Box>
  )
}

export default NotFound
