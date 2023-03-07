import * as tf from '@tensorflow/tfjs'
import Model, {
  ModelMetadata,
  ModelSource,
} from 'models/model'
import * as ts from 'typescript'

import * as MobileNet from '@tensorflow-models/mobilenet'

const models = [

  // #######################################################
  new Model(
    async onProgressCallback => {
      const url = 'models/test/model.json'
      onProgressCallback('test')
      return tf.loadGraphModel(
        url,
        {
          onProgress: onProgressCallback,
        },
      )
    },
    0,
    1,
    299,
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

  // #######################################################
  /* tfhub - imagenet/mobilenet_v2_130_224/classification */
  new Model(
    async onProgressCallback => {

      onProgressCallback(0)
      const mobileNet = await MobileNet.load()
      onProgressCallback(1)
      return mobileNet.model
    },
    -1,
    1,
    224,
    async () => {
      const class_catalog = await fetch( 'class_catalogs/imagenet.class_catalog.json' )
      return await class_catalog.json()
    },
    new ModelMetadata(
      '@tensorflow-models/mobilenet',
      ModelSource.TFHub,
      20.55,
    ),
    true,
  ),

]

























export {
  models as default,
}
