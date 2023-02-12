import React, { useEffect, useState, useContext, useRef } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { 
  Typography,
  Container,
  Stack,
  Box,
  Button,
  TextField,
  LinearProgress,
} from '@mui/material'

import '@tensorflow/tfjs-backend-webgl'

import * as tf from '@tensorflow/tfjs'

import * as MobileNet from '@tensorflow-models/mobilenet'

// https://dev.to/omrigm/run-machine-learning-models-in-your-browser-with-tensorflow-js-reactjs-48pe

const modelUrl = ""

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

  const onSubmit = async data => {
    setSubmitting( true )

    // load image preview
    let image = undefined

    if (data.file && data.file.length > 0) {
      image = URL.createObjectURL(data.file[0])
    } else if (data.url) {
      image = data.url
    }

    setImage(image)

    reset()


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
        5
      ).then( res => {
        console.log(res)
        setResults(res)
      } ).catch( err => {
        console.err(err)
      } )
    }

    setSubmitting(false)
    // run query

  }

  return (
    <Box
      sx={{
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack
        component='form'
        spacing={ 2 }
        padding={ 2 } 
        alignItems="center"
        onSubmit={ handleSubmit( onSubmit ) }
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
          Upload File
          <input
            hidden
            accept="image/*"
            type="file"
            { ...register('file') }
          />
        </Button>

        <Button
          disabled={ submitting }
          variant="contained"
          type="submit"
        >
          Submit
        </Button>

        { image &&
          ( 
            <Container
              disableGutters
              component='img'
              src={ image }
            />
          )
        }

        { results && 
          (
            <Stack
              direction="column"
              alignItems="stretch"
              spacing={ 2 }
              sx={ { width: '100%' } }
            >
              { results.map( result => (
                <Box
                  key={ result.className }
                >
                  <Typography
                    variant='h6'
                    align='center'
                  >
                    { result.className + ": " + ( 100 * result.probability ).toFixed(2) + '%' }
                  </Typography>
                  <LinearProgress
                    key={ result.className }
                    variant="determinate"
                    value={ 100 * result.probability }
                    sx={ {
                    } }
                  >
                  </LinearProgress>
                </Box>
              ) ) }
            </Stack>
        )
        }

      </Stack>

    </Box>
  )
}

export default HomePage
