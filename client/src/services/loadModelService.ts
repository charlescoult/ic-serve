
import axios from 'axios'

const endpoint = '/tfjs/model'

const LoadModelService =  {

	loadModel() {
		return new Promise( ( resolve, reject ) => {

			axios.get( endpoint ).then( response => {
				resolve( response )
			} ).catch ( error => {
				if ( error.response ) {
					reject( {
						response: error.response,
					} )
				} else {
					reject( {
						response: undefined,
					} )
				}
			} )

		} )
	}

}

export default LoadModelService
