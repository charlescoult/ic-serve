import Express from 'express'
import BodyParser from 'body-parser'
import favicon from 'express-favicon'
import path from 'path'
import axios from 'axios'
import fs from 'fs'
import compression from 'compression'

// Test if .env file exists
/*
try { 
  fs.lstatSync( '.env' ) 
} catch ( error ) {
  console.log( 'Can\'t lstat .env file...' )
  console.log( 'Try running `yarn env` to link to ~/.env' )
  process.exit(1)
}
*/

// const __dirname = path.dirname( new URL( import.meta.url ).pathname )
const __dirname = path.dirname( new URL( import.meta.url ).pathname )

const port = process.env.PORT || 8080
const app = Express()

app.use( compression() )

/* parse requests of content-type: application/json */
app.use( BodyParser.json() )
/* parse requests of content-type: application/x-www-form-urlencoded */
app.use( BodyParser.urlencoded( {
  extended: true,
} ) )

if ( process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ) {

  /* Serve files in production optimized 'client/build' directory */
  app.use( Express.static( path.join( __dirname, '..', 'client', 'build' ) ) )
  app.use( Express.static( path.join( __dirname, '..', 'client', 'public' ) ) )

  /* Handle React routing, return all requests to React app */
  app.use( (req, res, next) => {
    res.sendFile( path.join( __dirname, '..', 'client', 'build', 'index.html') )
  } )

} else {
  /* No client running on this thread, just give a default response */
  app.get('/', (req, res) => {
    res.json( {
      message: 'Server is running',
    } )
  } )
}

app.listen( port, () => console.log(`Listening on port ${port}`) )
