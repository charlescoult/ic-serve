import { createTheme as muiCreateTheme, alpha } from '@mui/material/styles'

// import * as materialColors from '@mui/material/colors'

const defaultThemeOptions = {
  palette: {
    mode: 'dark',
  },
}

// const domain = 'charlescoult.com'

const createTheme = (options = defaultThemeOptions) => {
  let theme = muiCreateTheme(options)
  /*
    palette: {
      mode: 'dark',
    },
  } )
  */

  const colors = [
    theme.palette.primary.main,
    theme.palette.background.default,
    theme.palette.background.default,
    // materialColors.red[900],
    // materialColors.teal[900],
    // materialColors.orange[900],
    //'#6b6b6b',
    //'#2b2b2b',
    //'#95959500',
  ]

  /* Scrollbar setup */
  theme = muiCreateTheme(theme, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          /* set scrollbar to material colors */
          body: {
            scrollbarColor: `${colors[0]} ${colors[1]}`,
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              backgroundColor: 'transparent',
              height: '8px',
              width: '8px',
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              backgroundColor: colors[0],
              borderRadius: '20px',
              border: '2px solid transparent',
              backgroundClip: 'content-box',
            },
            '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
              backgroundColor: 'transparent',
            },
          },
        },
      },
    },
  })

  theme = muiCreateTheme(theme, {
    components: {
      /* Disable underline on Links */
      MuiLink: {
        defaultProps: {
          underline: 'none',
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          /* Hide recaptcha badge */
          '.grecaptcha-badge': {
            // display: 'none',
            visibility: 'hidden',
          },
          /* remove underline and color links */
          a: {
            color: theme.palette.primary.main,
            textDecoration: 'none',
          },
          /* add styling for blockquotes */
          blockquote: {
            '> *': {
              marginLeft: 8,
            },
            marginLeft: 15,
            color: `${theme.palette.text.secondary}`,
            borderLeft: `8px solid ${alpha(theme.palette.primary.main, 0.75)}`,
            borderRadius: theme.shape.borderRadius,
          },
        },
      },
    },
  })

  /* Inputs */
  theme = muiCreateTheme(theme, {
    components: {
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
    },
  })

  /* Pretty Tables */
  theme = muiCreateTheme(theme, {
    components: {
      MuiTable: {
        styleOverrides: {},
      },
    },
  })

  return theme
}

export { createTheme }

export default createTheme()
