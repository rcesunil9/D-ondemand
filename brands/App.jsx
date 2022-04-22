import React from 'react'

import '@dailykit/react-tabulator/css/bootstrap/tabulator_bootstrap.min.css'
import '@dailykit/react-tabulator/lib/styles.css'

import Main from './sections/Main'
import { ErrorBoundary } from '../../shared/components'

const App = () => {
   return (
      <ErrorBoundary>
         <Main />
      </ErrorBoundary>
   )
}

export default App
