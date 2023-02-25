import React, { useEffect, useState, useContext, useRef } from 'react'

import { Controller, useForm } from 'react-hook-form'

import {
  Toolbar,
  AppBar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Skeleton,
  Paper,
  Typography,
  Container,
  Stack,
  Box,
  Button,
  TextField,
  LinearProgress,
} from '@mui/material'

// import '@tensorflow/tfjs-backend-webgl'
import * as tf from '@tensorflow/tfjs'

import * as MobileNet from '@tensorflow-models/mobilenet'
import * as TestNet from 'models/test/test'
import * as FungiNet from 'models/gbif/test'

import LoadModelService from 'services/loadModelService'

// https://dev.to/omrigm/run-machine-learning-models-in-your-browser-with-tensorflow-js-reactjs-48pe
const modelUrl = 'models/test/model.json'
const defaultNumResults = 5

const models = [
  {
    'name': 'MobileNet',
    'modelBase': MobileNet,
  },
  {
    'name': 'TestNet',
    'modelBase': TestNet,
  },
  {
    'name': 'FungiNet',
    'modelBase': FungiNet,
  },
]

const defaultModelSelection = 0

const HomePage = ({ ...props }) => {

  /* react-hook-form */
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      file: undefined,
      modelSelection: defaultModelSelection,
    },
  })


  /* ### MODEL ### */
  const modelSelection = watch('modelSelection')
  console.log(modelSelection)
  // Model after it has been set and loaded
  const [ loadedModel, setLoadedModel ] = useState(undefined)

  /* Whenever modelBase gets changed, load new model */
  useEffect(() => {
    const loadModel = async () => {
      console.log("loading Model")
      models[modelSelection].modelBase.load().then( model => {
        console.log("done loading  Model")
        setLoadedModel(model)
      } )
    }
    loadModel().catch(console.error)
  }, [ modelSelection ])

  const [submitting, setSubmitting] = useState(false)

  /* ### INPUT ### */
  const [image, setImage] = useState(undefined)

  /* ### OUTPUT ### */
  const [results, setResults] = useState(undefined)
  const [numResults, setNumResults] = useState(defaultNumResults)
  const [error, setError] = useState(undefined)

  const watchFileUpload = watch('file')

  const onSubmit = async (data) => {
    setSubmitting(true)
    setError(undefined)

    // load image preview
    let image = undefined

    if (data.file && data.file.length > 0) {
      image = URL.createObjectURL(data.file[0])
    } else if (data.url) {
      image = data.url
    }

    setImage(image)

    // https://www.oreilly.com/library/view/learning-tensorflowjs/9781492090786/ch04.html
    const imageData = new Image()
    imageData.crossOrigin = 'anonymous'
    imageData.src = image
    imageData.onload = () => {
      try {
        const imageTensor = tf.browser.fromPixels(imageData)
        console.log(
          `Successful conversion from Image() to a ${imageTensor.shape} tensor`,
        )
        const predictions = loadedModel
        .classify(imageTensor, numResults)
        .then((res) => {
          setResults(res)
        })
        .catch((err) => {
          /* Error retrieving prediction from loadedModel */
          console.error(err)
          setImage(undefined)
          setResults(undefined)
          setError({
            message: 'Error retrieving prediction from model',
          })
        })
        .finally(() => {
          setSubmitting(false)
        })
      } catch (error) {
        console.error(error)
        setImage(undefined)
        setResults(undefined)
        setError({
          message: 'Error feeding model',
        })
        setSubmitting(false)
      }
    }
    imageData.onerror = (err) => {
      /* Error loading image */
      console.error(err)
      setImage(undefined)
      setResults(undefined)
      setError({
        message: 'Error loading file:',
        file: image,
      })
      setSubmitting(false)
    }
  }

  return (
    <Stack
      component="form"
      spacing={2}
      alignItems="stretch"
      onSubmit={handleSubmit(onSubmit)}
    >

      <Paper elevation={3}>
        <Typography
          variant="h5"
          margin={2}
        >
          Model
        </Typography>

        <Divider />
        <Stack
          spacing={2}
          alignItems="center"
          padding={2}
        >

          <Controller
            name="modelSelection"
            control={ control }
            render={ ({ field }) => (
              <FormControl>
                <InputLabel
                  id='modelSelection-label'
                >
                  Select a model
                </InputLabel>
                <Select
                  labelId='modelSelection-label'
                  label="Select Field"
                  { ...field }
                >
                  {
                    models.map( (model, index) => (
                      <MenuItem
                        key={ 'key.modelSelection.' + model.name }
                        value={ index }
                      >
                        { model.name }
                      </MenuItem>
                    ) ) }
                </Select>
              </FormControl>
            ) }
          />

          { /*
               <FormControl
               fullWidth
               >
               <InputLabel
               id='model-select-label'
               >
               Select a Model
               </InputLabel>
               <Select
               labelId='model-select-label'
               id='model-select'
               defaultValue={ selectedModel }
               value={ selectedModel }
               label='Select a model'
               onChange={ event => setModel( event.target.value ) }
               >
               {
               models.map( (model, index) => (
               <MenuItem
               key={ model.name }
               value={ model }
               >
               { model.name }
               </MenuItem>
               ) ) }
               </Select>
               </FormControl>
             */ }


        </Stack>
      </Paper>

      <Paper elevation={3}>
        <Typography
          variant="h5"
          margin={2}
        >
          Input
        </Typography>

        <Divider />

        <Stack
          spacing={2}
          alignItems="center"
          padding={2}
        >
          <TextField
            sx={{
              alignSelf: 'stretch',
            }}
            label="URL"
            disabled={submitting}
            error={!!errors.url}
            {...register('url', {})}
          />

          <Button
            disabled={submitting}
            variant="outlined"
            component="label"
          >
            {'Load Local File' +
              (watchFileUpload && watchFileUpload.length > 0
                ? ': ' + watchFileUpload[0].name
                : '')}
            <input
              hidden
              accept="image/*"
              type="file"
              {...register('file')}
            />
          </Button>

          {error && (
            <Alert severity="error">
              {error.message}
              {error.file && (
                <>
                  <br />
                  {error.file}
                </>
              )}
            </Alert>
          )}

          <Button
            disabled={submitting}
            variant="contained"
            type="submit"
          >
            Classify
          </Button>
        </Stack>
      </Paper>

      {(submitting || results) && (
        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h5"
            margin={2}
          >
            Output
          </Typography>

          <Divider />
          <Stack
            padding={2}
            direction="column"
            alignItems="stretch"
            spacing={2}
            sx={{ width: '100%' }}
          >
            {(submitting &&
              [...Array(numResults)].map((e, i) => (
                <Box key={'results.skeleton' + i}>
                  <Typography
                    variant="h6"
                    align="center"
                  >
                    <Skeleton />
                  </Typography>
                </Box>
            ))) ||
              results.map((result) => (
                <Box key={'results.' + result.className}>
                  <Typography
                    variant="h6"
                    align="center"
                  >
                    {submitting ? (
                      <Skeleton />
                    ) : (
                    result.className +
                      ': ' +
                      (100 * result.probability).toFixed(2) +
                      '%'
                    )}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={100 * result.probability}
                  />
                </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {(submitting || image) && (
        <Paper
          elevation={3}
          sx={{
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {(submitting && (
            <Skeleton
              variant="rectangular"
              height={300}
            />
          )) || (
            <Container
              disableGutters
              component="img"
              src={image}
            />
          )}
        </Paper>
      )}
    </Stack>
  )
}

export default HomePage
