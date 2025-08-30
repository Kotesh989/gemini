import React from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Main from './components/Main/Main';
import ContextProvider from './context/Context';
import './App.css';

function App() {
  return (
    <ContextProvider>
      <div className="App">
        <Sidebar />
        <Main />
      </div>
    </ContextProvider>
  );
}

export default App;