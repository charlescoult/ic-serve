import React, { useState, useEffect } from 'react'

import { Routes, Route } from 'react-router-dom'

/* Routes */
// import ObjectivityApp from 'objectivity'

/* Pages */
import NotFoundPage from 'pages/notFound.page'
import HomePage from 'pages/home.page'

const App = ({ ...props }) => {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
