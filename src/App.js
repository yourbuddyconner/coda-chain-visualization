import React from 'react';
import logo from './logo.svg';
import './App.css';
import { GiPayMoney, GiGearHammer, GiTakeMyMoney } from "react-icons/gi";
import { AiOutlinePlusCircle } from "react-icons/ai";
import DynamicGraph from './transactions/transactions';
import Legend from './transactions/legend';

const { useState, useEffect, useRef, useCallback } = React;

function Control({ filterGraph }) {
  return (
    <div class="graph-filters">
      <div className="filter-icon" onClick={() => filterGraph("userCommands")}><GiPayMoney /></div>
      <div className="filter-icon" onClick={() => filterGraph("feeTransfers")}><GiGearHammer /></div>
      <div className="filter-icon" onClick={() => filterGraph("transactionFees")}><GiTakeMyMoney /></div>
      <div className="filter-icon" onClick={() => filterGraph("all")}><AiOutlinePlusCircle /></div>
    </div>
  )
}


function App() {
  const [state, setState] = useState({filterOn: "userCommands"})

  return (
    <div className="App">
      <div className="header">
        <h1>CODA Graph Viewer</h1>
      </div>
      <div className="app-container">
        <Control filterGraph={(filterOn) => {
          setState({ filterOn: filterOn })
        }}/>
        <div className="legend">
          <Legend/>
        </div>
        <div className="graph">
          <DynamicGraph filterOn={state.filterOn}>
            {/* <Blocks/> */}
          </DynamicGraph>
        </div>
        
      </div>
    </div>
  );
}

export default App;
