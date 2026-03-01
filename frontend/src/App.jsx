import './styles/App.css'
import React from 'react'
import { FeedPage } from './pages/FeedPage.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <>
      <FeedPage />
      <ToastContainer position="bottom-center" autoClose={2500} />
    </>
  )
}

export default App
