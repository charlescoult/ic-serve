import React, { useState, useContext } from 'react'

import { useForm } from 'react-hook-form'

import { 
  Stack,
  Box,
  Button,
  TextField,
} from '@mui/material'

type FormData = {
  name: string
}

const HomePage = ({
  ...props 
}) => {

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>()

  const [ submitting, setSubmitting ] = useState( false )

  const onSubmit = data => {
    console.log(data)
    setSubmitting( true )
    // run query
    setSubmitting( false )
  }

  // console.log(watch("example"))

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
        onSubmit={ handleSubmit( onSubmit ) }
      >

        <TextField
          label='URL'
          disabled={ submitting }
          error={ !!errors.example }
          { ...register( 'example', {
          } ) }
        />


        <Button
          type="submit"
        >
          test
        </Button>
      </Stack>

    </Box>
  )
}

export default HomePage
