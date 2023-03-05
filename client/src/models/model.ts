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
    public class_loader: () => Promise<string[]>,
    public metadata: ModelMetadata,
  ) {
    this.normalizationConstant = (inputMax - inputMin) / 255.0;
  }

  async load(): Promise<void> {
    this.model = await this.model_loader()
    this.classes = await this.class_loader()
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
        img = tf.browser.fromPixels(img);
      }

      // Normalize the image from [0, 255] to [inputMin, inputMax].
      const normalized: tf.Tensor3D = tf.add(
        tf.mul(tf.cast(img, 'float32'), this.normalizationConstant),
        this.inputMin);

        // Resize the image to
        let resized = normalized;
        if (img.shape[0] !== IMAGE_SIZE || img.shape[1] !== IMAGE_SIZE) {
          const alignCorners = true;
          resized = tf.image.resizeBilinear(
            normalized, [IMAGE_SIZE, IMAGE_SIZE], alignCorners);
        }

        // Reshape so we can pass it to predict.
        const batched = tf.reshape(resized, [-1, IMAGE_SIZE, IMAGE_SIZE, 3]);

        let result: tf.Tensor2D;

        if (embedding) {
          const embeddingName = EMBEDDING_NODES[this.version];
          const internal =
            this.model.execute(batched, embeddingName) as tf.Tensor4D;
          result = tf.squeeze(internal, [1, 2]);
        } else {
          const logits1001 = this.model.predict(batched) as tf.Tensor2D;
          // Remove the very first logit (background noise).
          result = tf.slice(logits1001, [0, 1], [-1, 1000]);
        }

        return result;
    });
  }

  async classify(
    img: tf.Tensor3D|ImageData|HTMLImageElement|HTMLCanvasElement|
    HTMLVideoElement,
    topk = 3): Promise<Array<{className: string, probability: number}>> {
      const logits = this.infer(img) as tf.Tensor2D;

      const classes = await getTopKClasses(logits, topk, this.classes);

      logits.dispose();

      return classes;
    }
}

async function getTopKClasses(
  logits: tf.Tensor2D,
  topK: number,
  classes: [ string ],
):
  Promise<Array<{className: string, probability: number}>> {
  const softmax = tf.softmax(logits);
  const values = await softmax.data();
  softmax.dispose();

  const valuesAndIndices = [];
  for (let i = 0; i < values.length; i++) {
    valuesAndIndices.push({value: values[i], index: i});
  }
  valuesAndIndices.sort((a, b) => {
    return b.value - a.value;
  });
  const topkValues = new Float32Array(topK);
  const topkIndices = new Int32Array(topK);
  for (let i = 0; i < topK; i++) {
    topkValues[i] = valuesAndIndices[i].value;
    topkIndices[i] = valuesAndIndices[i].index;
  }

  const topClassesAndProbs = [];
  for (let i = 0; i < topkIndices.length; i++) {
    topClassesAndProbs.push({
      className: classes[topkIndices[i]],
      probability: topkValues[i]
    });
  }
  return topClassesAndProbs;
}




























export {
  Model as default,
  ModelMetadata,
  ModelSource,
}
