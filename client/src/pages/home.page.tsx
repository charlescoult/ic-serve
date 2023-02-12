import React, { useEffect, useState, useContext, useRef } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { 
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

// https://dev.to/omrigm/run-machine-learning-models-in-your-browser-with-tensorflow-js-reactjs-48pe

const modelUrl = ""
const defaultNumResults = 5

const HomePage = ({
  ...props 
}) => {

  const [ model, setModel ] = useState(undefined)

  /*
     const loadModel = async url => {
     try {
     const model = await tf.loadLayersModel(url)
     setModel(model)
     } catch (err) {
     console.log( err )
     }
     }

     useEffect( () => {
     tf.ready().then( () => {
     loadModel(modelUrl)
     } )
     }, [] )
   */

  useEffect( () => {

    const loadModel = async () => {
      const model = await MobileNet.load()
      setModel(model)
    }

    loadModel().catch(console.error)

  }, [] )

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
    }
  })

  const [ submitting, setSubmitting ] = useState( false )

  const [ image, setImage ] = useState( undefined )

  const [ results, setResults ] = useState( undefined )
  const [ numResults, setNumResults ] = useState( defaultNumResults )
  const [ error, setError ] = useState( undefined )

  const watchFileUpload = watch("file")

  const onSubmit = async data => {
    setSubmitting( true )
    setError(undefined)

    // load image preview
    let image = undefined

    if (data.file && data.file.length > 0) {
      image = URL.createObjectURL(data.file[0])
    } else if (data.url) {
      image = data.url
    }

    setImage(image)

    reset()

    // await new Promise( res => setTimeout(res, 3000) )

    // https://www.oreilly.com/library/view/learning-tensorflowjs/9781492090786/ch04.html
    const imageData = new Image()
    imageData.crossOrigin = 'anonymous'
    imageData.src = image
    imageData.onload = () => {
      const imageTensor = tf.browser.fromPixels(imageData)
      console.log(
        `Successful conversion from Image() to a ${imageTensor.shape} tensor`
      )
      const predictions = model.classify(
        imageTensor,
        numResults,
      ).then( res => {
        setResults(res)
      } ).catch( err => {
        /* Error retrieving prediction from model */
        console.error(err)
        setImage(undefined)
        setResults(undefined)
        setError({
          message: "Error retrieving prediction from model",
        } )
      } ).finally( () => {
        setSubmitting(false)
      } )
    }
    imageData.onerror = err => {
      /* Error loading image */
      console.error(err)
      setImage(undefined)
      setResults(undefined)
      setError( {
        message: "Error loading file:",
        file: image,
      } )
      setSubmitting(false)
    }

  }

  console.log("render")

  return (
    <Stack
      component='form'
      spacing={ 2 }
      alignItems="stretch"
      onSubmit={ handleSubmit( onSubmit ) }
    >

      <Paper
        elevation={3}
      >
        <Typography
          variant='h5'
          margin={ 2 }
        >
          Model
        </Typography>

        <Divider
        />
        <Stack
          spacing={ 2 }
          alignItems="center"
          padding={ 2 }
        >
          <Select
            label="Select Model"
            value={ 10 }
          >
            <MenuItem
              value={ 10 }
            >
              10
            </MenuItem>
          </Select>
        </Stack>
      </Paper>

      <Paper
        elevation={3}
      >
        <Typography
          variant='h5'
          margin={ 2 }
        >
          Input
        </Typography>

        <Divider
        />

        <Stack
          spacing={ 2 }
          alignItems="center"
          padding={ 2 }
        >

          <TextField
            sx={ {
              alignSelf: 'stretch'
            } }
            label='URL'
            disabled={ submitting }
            error={ !!errors.url }
            { ...register( 'url', {
            } ) }
          />

          <Button
            disabled={ submitting }
            variant="outlined"
            component="label"
          >
            {
              'Load Local File' + ( watchFileUpload && watchFileUpload.length > 0 ? ": " + watchFileUpload[0].name : '')
            }
            <input
              hidden
              accept="image/*"
              type="file"
              { ...register('file') }
            />
          </Button>

          { error && (
            <Alert severity="error">
              { error.message }
              { error.file && (
                <>
                  <br/>
                  { error.file }
                </>
              ) }
            </Alert>
          ) }

          <Button
            disabled={ submitting }
            variant="contained"
            type="submit"
          >
            Classify
          </Button>
        </Stack>

      </Paper>

      { ( submitting || results ) && 
        (
          <Paper
            elevation={3}
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
        <Typography
          variant='h5'
          margin={ 2 }
        >
          Output
        </Typography>

        <Divider
        />
            <Stack
              padding={ 2 }
              direction="column"
              alignItems="stretch"
              spacing={ 2 }
              sx={ { width: '100%' } }
            >
              { submitting && 
                [...Array(numResults)].map( (e, i) => (
                  <Box
                    key={ 'results.skeleton' + i }
                  >
                    <Typography
                      variant='h6'
                      align='center'
                    >
                      <Skeleton /> 
                    </Typography>
                  </Box>
              ) ) || 
                results.map( result => (
                  <Box
                    key={ 'results.' + result.className }
                  >
                    <Typography
                      variant='h6'
                      align='center'
                    >
                      { submitting ?
                        <Skeleton /> : 
                        result.className + ": " + ( 100 * result.probability ).toFixed(2) + '%'
                      }
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={ 100 * result.probability }
                    />
                  </Box>
              ) ) }
            </Stack>
          </Paper>
      ) }

      { ( submitting || image ) &&
        ( 
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            { submitting && 
              (
                <Skeleton
                  variant='rectangular'
                  height={ 300 }
                />
            ) || (
              <Container
                disableGutters
                component='img'
                src={ image }
              />
            ) }
          </Paper>
        ) }

    </Stack>
  )
}

export default HomePage
