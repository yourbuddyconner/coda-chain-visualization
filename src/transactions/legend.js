import { Gradient } from 'react-gradient';
import React from 'react';
import * as d3 from "d3"

const { useState, useEffect, useRef, useCallback} = React;


const gradients = [
    ["grey", "green", "yellow", "orange", "red"],
  ];

const Legend = () => {
    // create a list of keys
    useEffect(() => {
        var Svg = d3.select("#my_dataviz2")

        Svg.append("rect").attr("x",47).attr("y",27).attr("width", 20).attr("height", 6).style("fill", "blue")
        Svg.append("rect").attr("x",47).attr("y",87).attr("width", 20).attr("height", 6).style("fill", "red")
        Svg.append("rect").attr("x",47).attr("y",147).attr("width", 20).attr("height", 6).style("fill", "orange")
        //Svg.append("circle").attr("cx",50).attr("cy",50).attr("r", 6).style("fill", "red")
        //Svg.append("circle").attr("cx",50).attr("cy",70).attr("r", 6).style("fill", "orange")
        Svg.append("text").attr("x", 80).attr("y", 30).text("User Commands").style("font-size", "30px").attr("alignment-baseline","middle")
        Svg.append("text").attr("x", 80).attr("y", 90).text("Transaction Fees").style("font-size", "30px").attr("alignment-baseline","middle")
        Svg.append("text").attr("x", 80).attr("y", 150).text("Fee Transfers").style("font-size", "30px").attr("alignment-baseline","middle")

        Svg.append("circle").attr("cx", 50).attr("cy",210).attr("r", 12).style("fill", "navy")
        Svg.append("text").attr("x", 80).attr("y", 210).text("Wallet").style("font-size", "30px").attr("alignment-baseline","middle")
    })
    return (
        <div>
            <svg id="my_dataviz2" height="300" width="450"></svg>
        </div>
    );
}
export default Legend