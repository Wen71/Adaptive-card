import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { ThemeProvider } from 'styled-components'
import { theme } from '@innovation/nova'


// const root = ReactDOM.createRoot(document.getElementById('root'));
ReactDOM.render(
    <ThemeProvider theme={theme}>
        <App/>
    </ThemeProvider>, 
    document.getElementById('root'))
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );


