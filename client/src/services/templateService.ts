
import axios from 'axios'

const endpoint = '/tfjs/model'

class LoadModelService {

	loadModel() {
		return new Promise( ( res, rej ) => {

			axios.get( endpoint ).then( res => {
				res( response.data )
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

export default new LoadModelService()
