// import * as tfconv from '@tensorflow/tfjs-converter'
import * as tf from '@tensorflow/tfjs'

// import { CLASSES } from './classes'
const classes_url = "https://fungi-models.s3.us-west-1.amazonaws.com/GBIF/google.inaturalist.inception_v3.03/classes.json"
const model_url = "https://fungi-models.s3.us-west-1.amazonaws.com/GBIF/2023_03_30-07_22_16/model.json"


const IMAGE_SIZE = 299

export async function load(): Promise<ImageClassifierModel> {
  if (tf == null) {
    throw new Error(
      `Cannot find TensorFlow.js. If you are using a <script> tag, please ` +
        `also include @tensorflow/tfjs on the page before using this model.`,
    )
  }

  const inputMin = 0
  const inputMax = 1

  const response = await fetch( classes_url )
  const CLASSES = await response.json()

  const model = new ImageClassifierModelImpl(
    model_url,
    inputMin,
    inputMax,
    CLASSES,
  )
  await model.load()
  return model
}

export interface ImageClassifierModel {
  load(): Promise<void>
  infer(
    img:
      | tf.Tensor
      | ImageData
      | HTMLImageElement
      | HTMLCanvasElement
      | HTMLVideoElement,
  ): tf.Tensor
  classify(
    img:
      | tf.Tensor3D
      | ImageData
      | HTMLImageElement
      | HTMLCanvasElement
      | HTMLVideoElement,
    topk?: number,
  ): Promise<Array<{ className: string; probability: number }>>
}

class ImageClassifierModelImpl implements ImageClassifierModel {

  model: tf.GraphModel

  // Values read from images are in the range [0.0, 255.0], but they must
  // be normalized to [min, max] before passing to the mobilenet classifier.
  // Different implementations of mobilenet have different values of [min, max].
  // We store the appropriate normalization parameters using these two scalars
  // such that:
  // out = (in / 255.0) * (inputMax - inputMin) + inputMin;
  private normalizationConstant: number

  constructor(
    public modelUrl: string | tf.io.IOHandler,
    public inputMin = -1,
    public inputMax = 1,
    public classes,
  ) {
    this.normalizationConstant = (inputMax - inputMin) / 255.0
    // this.classes = classes,
  }

  async load() {
    if (this.modelUrl) {
      // console.log(this.modelUrl)
      this.model = await tf.loadGraphModel(this.modelUrl)
      // Expect that models loaded by URL should be normalized to [-1, 1]
    }

    // Warmup the model.
    const result = tf.tidy(() =>
      this.model.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])),
    ) as tf.Tensor
    await result.data()
    result.dispose()
  }

  /**
   * Computes the logits for the provided image.
   *
   * @param img The image to classify. Can be a tensor or a DOM element image,
   *     video, or canvas.
   */
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
        this.inputMin,
      )

      // print_tensor(normalized)

      // const normalized: tf.Tensor3D = tf.cast(img, 'float32')

      // Resize the image to
      let resized = normalized
      if (img.shape[0] !== IMAGE_SIZE || img.shape[1] !== IMAGE_SIZE) {
        const alignCorners = true
        resized = tf.image.resizeBilinear(
          normalized,
          [IMAGE_SIZE, IMAGE_SIZE],
          alignCorners,
        )
      }

      // Reshape so we can pass it to predict.
      const batched = tf.reshape(resized, [-1, IMAGE_SIZE, IMAGE_SIZE, 3])

      const logits = this.model.predict(batched) as tf.Tensor2D

      // Remove the very first logit (background noise).
      //const result: tf.Tensor2D = tf.slice(logits1001, [0, 1], [-1, NUM_CLASSES - 1])

      const logits_softmax = tf.softmax( logits )

      return logits_softmax
    })
  }

  /**
   * Classifies an image from the model's classes returning a map of
   * the most likely class names to their probability.
   *
   * @param img The image to classify. Can be a tensor or a DOM element image,
   * video, or canvas.
   * @param topk How many top values to use. Defaults to 3.
   */
  async classify(
    img:
      | tf.Tensor3D
      | ImageData
      | HTMLImageElement
      | HTMLCanvasElement
      | HTMLVideoElement,
    topk = 3,
  ): Promise<Array<{ className: string; probability: number }>> {

    const logits = this.infer(img) as tf.Tensor2D
    // print_tensor( logits )

    const classes = await getTopKClasses(logits, topk, this.classes)

    logits.dispose()

    return classes
  }
}

function print_tensor( t ){
  console.log(tf.min(t).dataSync())
  console.log(tf.max(t).dataSync())
}

async function getTopKClasses(
  logits: tf.Tensor2D,
  topK: number,
  classes,
): Promise<Array<{ className: string; probability: number }>> {
  // const softmax = tf.softmax(logits)
  // const values = await softmax.data()
  // softmax.dispose()
  //console.log(logits)
  const values = await logits.data()

  const valuesAndIndices = []
  for (let i = 0; i < values.length; i++) {
    // console.log(values[i])
    valuesAndIndices.push({ value: values[i], index: i })
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
      probability: topkValues[i],
    })
  }
  return topClassesAndProbs
}
