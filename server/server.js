import Express from 'express'
import BodyParser from 'body-parser'
import favicon from 'express-favicon'
import path from 'path'
import axios from 'axios'

import API from './api/api.js'
import CORS from './cors.js'
import DB from './db/db.js'

import fs from 'fs'

import compression from 'compression'

// Test if .env file exists
try { 
  fs.lstatSync( '.env' ) 
} catch ( error ) {
  console.log( 'Can\'t lstat .env file...' )
  console.log( 'Try running `yarn env` to link to ~/.env' )
  process.exit(1)
}

const __dirname = path.dirname( new URL( import.meta.url ).pathname )

const port = process.env.PORT || 8080
const app = Express()

app.use( compression() )

/* CORS Policy */
CORS( app )

/* DB connection */
DB(app)

/* parse requests of content-type: application/json */
app.use( BodyParser.json() )
/* parse requests of content-type: application/x-www-form-urlencoded */
app.use( BodyParser.urlencoded( {
  extended: true,
} ) )

/* ## API */
API( app )

// console.log("REACT_APP_STAGING=" + process.env.REACT_APP_STAGING)
// console.log("REACT_APP_ENV=" + process.env.REACT_APP_STAGING)

if ( process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ) {

  /* Serve files in production optimized 'client/build' directory */
  app.use( Express.static( path.join( __dirname, 'client', 'build' ) ) )
  app.use( Express.static( path.join( __dirname, 'client', 'public' ) ) )

  /* Handle React routing, return all requests to React app */
  app.use( (req, res, next) => {
    res.sendFile( path.join( __dirname, 'client', 'build', 'index.html') )
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

// If we aren't in production or staging environement, run tests
if ( ! ( process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ) ) {
  // await tests()
}

async function tests() {
  try {
    await userTests()
  } catch (exception) {
    console.log('!!!!!TEST ERROR!!!!!!!')
    if ( exception.response ) console.dir(exception.response.data)
    else console.dir(exception)
  }
}

/* tests CRUD API operations for User */
async function userTests() {

  /* tests */
  console.log('***************** testing api endpoints *****************')
  console.log( port )

  let id

  // CREATE
  console.log("START CREATE")
  await axios.post(`http://localhost:${port}/user`, {
    email: 'testa@gmail.com',
    password: 'password',
  } ).then( response => {
    console.log(response.data)
    id = response.data.id
  } )
  console.log("END CREATE")

  // READ
  console.log("START READ")
  await axios.get( `http://localhost:${port}/user/${id}`).then( response => {
    console.log(response.data)
    console.assert( response.data !== '' )
  } )
  console.log("END READ")

  // UPDATE
  console.log("START UPDATE")
  await axios.put( `http://localhost:${port}/user/${id}`, {
    email: 'asdftesta@gmail.com',
    password: 'testpass',
  } ).then( ( response ) => {
    console.dir( response.data )
  } )
  console.log("END UPDATE")

  console.log("START READ 2")
  await axios.get( `http://localhost:${port}/user/${id}`).then( response => {
    console.assert(response.data.email === 'asdftesta@gmail.com')
    console.log( response.data )
  } )
  console.log("END READ 2")

  // DELETE
  console.log("START DELETE")
  await axios.delete( `http://localhost:${port}/user/${id}`).then( response => {
    console.log(response.data)
    console.assert( response.data === 1 )
  } )
  console.log("END DELETE")

  console.log("START READ 3")
  await axios.get( `http://localhost:${port}/user/${id}`).then( response => {
    console.assert( response.data === '' )
    console.log(`"${response.data}"`)
  } )
  console.log("END READ 3")

}


