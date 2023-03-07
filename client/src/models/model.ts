import * as tf from '@tensorflow/tfjs'

enum ModelSource {
  Local,
  TFHub,
  S3,
  Server,
}

class ModelMetadata {
  constructor(
    public name: string,
    public source: ModelSource,
    public size: number,
    public logs?: any,
  ) {
  }
}

class Model  {

  public model: tf.GraphModel
  private normalizationConstant: number

  constructor(
    public model_loader: () => Promise<tf.GraphModel[]>,
    public inputMin: number,
    public inputMax: number,
    public image_size: number,
    public class_loader: () => Promise<string[]>,
    public metadata: ModelMetadata,
    public applySoftmax: boolean = false,
  ) {
    this.normalizationConstant = (inputMax - inputMin) / 255.0
  }

  async load(
    onProgressCallback,
  ): Promise<void> {

    /* load Model */
    this.model = await this.model_loader( onProgressCallback )

    /* load Class Catalogue */
    this.classes = await this.class_loader()

    /* Warmup the model */
    const result = tf.tidy(
      () => this.model.predict(
        tf.zeros( [ 1, this.image_size, this.image_size, 3 ] )
      ),
    ) as tf.Tensor
    await result.data()
    result.dispose()
  }

  async unload(): Promise<void> {
    model.dispose()
  }

  infer(
    img:
      | tf.Tensor
      | ImageData
      | HTMLImageElement
      | HTMLCanvasElement
      | HTMLVideoElement,
  ): tf.Tensor {
    return tf.tidy(() => {
      if (!(img instanceof tf.Tensor)) {
        img = tf.browser.fromPixels(img)
      }

      // Normalize the image from [0, 255] to [inputMin, inputMax].
      const normalized: tf.Tensor3D = tf.add(
        tf.mul(tf.cast(img, 'float32'), this.normalizationConstant),
        this.inputMin
      )

      // Resize the image to
      let resized = normalized
      if (img.shape[0] !== this.image_size || img.shape[1] !== this.image_size) {
        const alignCorners = true
        resized = tf.image.resizeBilinear(
          normalized,
          [this.image_size, this.image_size],
          alignCorners
        )
      }

      // Reshape so we can pass it to predict.
      const batched = tf.reshape(resized, [-1, this.image_size, this.image_size, 3])

      // let result: tf.Tensor2D

      const logits = this.model.predict(batched) as tf.Tensor2D

      // Remove the very first logit (background noise).
      // result = tf.slice(logits1001, [0, 1], [-1, 1000])

      return logits
    })
  }

  async classify(
    img: tf.Tensor3D|ImageData|HTMLImageElement|HTMLCanvasElement|
    HTMLVideoElement,
    topk = 3): Promise<Array<{className: string, probability: number}>> {
      const logits = this.infer(img) as tf.Tensor2D

      const classes = await getTopKClasses(logits, topk, this.classes, this.applySoftmax)

      logits.dispose()

      return classes
    }
}

async function getTopKClasses(
  logits: tf.Tensor2D,
  topK: number,
  classes: [ string ],
  applySoftmax: boolean,
): Promise<Array<{className: string, probability: number}>> {

  let values

  if ( applySoftmax ) {
    const softmax = tf.softmax(logits)
    values = await softmax.data()
    softmax.dispose()
  } else {
    values = await logits.data()
  }

  console.log(await tf.min(logits).data())
  console.log(await tf.max(logits).data())

  console.log(await tf.min(values).data())
  console.log(await tf.max(values).data())

  const valuesAndIndices = []
  for (let i = 0; i < values.length; i++) {
    valuesAndIndices.push({value: values[i], index: i})
  }
  valuesAndIndices.sort((a, b) => {
    return b.value - a.value
  })
  const topkValues = new Float32Array(topK)
  const topkIndices = new Int32Array(topK)
  for (let i = 0; i < topK; i++) {
    topkValues[i] = valuesAndIndices[i].value
    topkIndices[i] = valuesAndIndices[i].index 
  }

  const topClassesAndProbs = []
  for (let i = 0; i < topkIndices.length; i++) {
    topClassesAndProbs.push({
      className: classes[topkIndices[i]],
      probability: topkValues[i]
    })
  }
  return topClassesAndProbs
}




























export {
  Model as default,
  ModelMetadata,
  ModelSource,
}
