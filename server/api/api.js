import LoadModelController from './loadModel.controller.js'
import path from 'path'
import Express from 'express'

const __dirname = path.dirname( new URL( import.meta.url ).pathname )

const restrictionExample = ( req, res, next ) => {
	next()
}

const API = app => {

	console.log("API loading...")

	/*
	app.get(
		'/tfjs/model',
		[
			restrictionExample,
		],
		( req, res ) => LoadModelController.sendModel( req, res ),
	)
	*/

	console.log(__dirname)

	app.use(
		'/tfjs/model',
		// Express.static(path.join(__dirname, "models/google.inaturalist.inception_v3.03"))
		Express.static(path.join(__dirname, "models/Xception.03"))
	)

}

export default API
