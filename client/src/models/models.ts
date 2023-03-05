import * as tf from '@tensorflow/tfjs'
import Model, {
  ModelMetadata,
  ModelSource,
} from 'models/model'

const models = [
  new Model(
    async () => {
      const url = 'models/test/model.json'
      return tf.loadGraphModel( url )
    },
    0,
    1,
    async () => {
      const resp = await fetch( 'models/test/classes.json' ) 
      return await resp.json()
    },
    new ModelMetadata(
      'Local Test Model',
      ModelSource.Local,
      128,
    ),
  ),
  /* tfhub - imagenet/mobilenet_v2_130_224/classification */
  new Model(
    async () => {
      const url = 'https://tfhub.dev/google/imagenet/mobilenet_v1_025_224/classification/1'
      return tf.loadGraphModel( url, { fromTFHub: true } )
    },
    -1,
    1,
    async () => {
      const resp = await fetch( 'https://storage.googleapis.com/download.te    nsorflow.org/data/ImageNetLabels.txt' )
      console.log(resp)
      return resp.split('\n')
    },
    new ModelMetadata(
      'tfhub.dev - MobileNet v2',
      ModelSource.TFHub,
      20.55,
    ),

  ),
]

























export {
  models as default,
}
