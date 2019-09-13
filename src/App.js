import React from 'react';
import logo from './logo.svg';
import './App.css';

import Blocks from './block/block';

function App() {
  return (
    <div className="App">
      <Blocks metric={(node) => node.snarkJobs.length}/>
      {/* <Blocks/> */}
    </div>
  );
}

export default App;
