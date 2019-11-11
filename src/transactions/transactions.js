import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { forOfStatement } from '@babel/types';
import { ForceGraph2D, ForceGraph3D } from 'react-force-graph';
import _ from "lodash";
import Rainbow from "rainbowvis.js"
import * as d3 from "d3"

const { useState, useEffect, useRef, useCallback} = React;

const DynamicGraph = (state) => {
    const [data, setData] = useState({ nodes: [], links: [] });
    const [nodeIndex, setNodeIndex] = useState({})
    //    [node.publicKey]: {
    //        index: int
    //    }
    const [linkIndex, setLinkIndex] = useState({})
    //    [tx.to + tx.from]: {
    //        index: int
    //    } 

    const prevStateRef = useRef(state);
    useEffect(() => {
        prevStateRef.current = state;
    });
    const prevState = prevStateRef.current;

    const { loading, error, data: query_data, refetch } = useQuery(GET_BLOCKS, {pollInterval: 10000});
    const fgRef = useRef();
    //Set the force sim
    useEffect(() => {
        const fg = fgRef.current;
        let chargeForce = d3.forceManyBody()
        chargeForce.strength((node) => { 
            return -100;
        })
        chargeForce.distanceMin(5)

        fg.d3Force('charge', chargeForce);
    })
    // General Idea: 
    // maintain a second state which is a nice format of what nodes and links do you have now
    // when you get data, you use the second state to compute which nodes/links are new
    // then you update both the first (graph) and second state with the data 

    // Known Public Keys (for labels)
    const knownKeys = require('../knownKeys.json');
    const filterOn = state.filterOn;
    // Parse Out Various Kinds of Transactions
    let receivedTransactions = {};
    if ( query_data ) { 
        query_data.blocks.nodes.forEach(node => {
            const blockProducer = node.creator
            
            // If we should display userCommands
            if (filterOn ===  "userCommands" || filterOn ===  "all") { 
                // Get User Commands
                node.transactions.userCommands.forEach(command => {
                    const key = "userCommand-" + command.from + "-" + command.to
                    if ( key in receivedTransactions ){
                        receivedTransactions[key].totalFees += parseInt(command.fee)
                        receivedTransactions[key].totalSent += parseInt(command.amount)
                        receivedTransactions[key].totalTransactions += 1
                    } 
                    else {
                        receivedTransactions[key] = {
                            id: key,
                            target: command.to,
                            source: command.from,
                            type: "userCommand",
                            totalFees: parseInt(command.fee),
                            totalSent: parseInt(command.amount),
                            totalTransactions: 1
                        }
                    }
                });
            }
            if (filterOn === "transactionFees" || filterOn ===  "userCommands" || filterOn ===  "all") { 
                // Get Transaction Fees
                node.transactions.userCommands.forEach(command => {
                    const key = "transactionFee-" + command.from + blockProducer
                    if ( key in receivedTransactions ){
                        receivedTransactions[key].totalSent += parseInt(command.fee)
                        receivedTransactions[key].totalTransactions += 1
                    } 
                    else { 
                        receivedTransactions[key] = {
                            id: key,
                            target: blockProducer,
                            source: command.from,
                            type: "transactionFee",
                            totalSent: parseInt(command.fee),
                            totalFees: 0,
                            totalTransactions: 1
                        }
                    }
                });
            }
            
            if (filterOn ===  "feeTransfers" || filterOn ===  "all") { 
                // Get Fee Transfers (Block Producer -> Snark Worker)
                node.transactions.feeTransfer.forEach(transfer => {
                    const key = "feeTransfer-" + blockProducer + "-" + transfer.recipient
                    if ( key in receivedTransactions ){
                        receivedTransactions[key].totalFees += parseInt(transfer.fee)
                        receivedTransactions[key].totalTransactions += 1
                    }
                    else {
                        receivedTransactions[key] = {
                            id: key,
                            target: transfer.recipient,
                            source: blockProducer,
                            type: "feeTransfer",
                            totalSent: parseInt(transfer.fee),
                            totalFees: 0, 
                            totalTransactions: 1
                        }
                    }
                })
            }
        });
    }  

    let txKeys = Object.keys(receivedTransactions)

    // Compute New Nodes
    const observedKeys = txKeys.map((txKey) => {
        let tx = receivedTransactions[txKey]
        return [tx.source, tx.target]
    }).flat()

    
    const dedupedKeys = observedKeys.filter(function(item, pos) {
        return observedKeys.indexOf(item) == pos;
    })

    //console.log("dedupedKeys: ", observedKeys)

    const newKeys = dedupedKeys.filter((key) => {
        return !(key in nodeIndex)
    })

    const newNodes = newKeys.map(key => {
        return {
            id: key, 
            name: knownKeys[key],
            publicKey: key,
        }
    })

    // Compute New Links
    const observedLinks = Object.values(receivedTransactions)

    const newLinks = observedLinks.filter((link) => {
        const key = link.id
        return !(key in linkIndex)
    })

    // If the filter properties have changed 
    // Clear out nodes, links, and indexes
    if ( state !== prevState && prevState !== undefined) {
        console.log(state, prevState)
        setData(({nodes, links}) => {
            return {
                nodes: [],
                links: []
            }
        })
        setNodeIndex((index) => {
            return {}
        })
        setLinkIndex((index) => {
            return {}
        })
        prevStateRef.current = state;
    }
    
    // Add New Nodes
    if ( newNodes ){
        newNodes.forEach(newNode => {
            setData(({nodes, links}) => {
                setNodeIndex((index) => {
                    index[newNode.id] = nodes.length
                    return index
                })
                return {
                    nodes: [...nodes, newNode],
                    links: links
                }
            })
        })
    }

    // Add New Links
    if ( newLinks ) {
        newLinks.forEach(link => {
            if ( link.target in nodeIndex && link.source in nodeIndex ){
                setData(({nodes, links}) => {
                    setLinkIndex((index) => {
                        index[link.id] = links.length
                        return index
                    })
                    return {
                        nodes: nodes,
                        links: [...links, link]
                    }
                })
            }
        })
    }
        

    // Check if data has Updated


    return <ForceGraph2D
    d3VelocityDecay={0.7}
    ref={fgRef}
    enableNodeDrag={true}
    nodeLabel={(node) => {
        return `Discord: ${node.name} </br>
        Public Key: ${node.publicKey.substring(0,8)}
        `
    }}
    linkLabel={(link) => {
        if (link.type === "userCommand") {
            return `User Commands: ${link.source.name} -> ${link.target.name} </br>
            Total Transactions: ${link.totalTransactions} </br>
            Total Sent: ${link.totalSent} </br>
            `
        }
        if (link.type === "feeTransfer") {
            return `Fee Transfers: ${link.source.name} -> ${link.target.name} </br>
            Total Transfers: ${link.totalTransactions} </br>
            Fees Collected: ${link.totalSent} </br>
            `
        }
        if (link.type === "transactionFee") {
            return `Transaction Fees: ${link.source.name} -> ${link.target.name} </br>
            Total Transfers: ${link.totalTransactions} </br>
            Fees Collecteds: ${link.totalSent} </br>
            `
        }
    }}
    linkCurvature={.25}
    linkDirectionalArrowLength={5}
    linkWidth={(link) => {
        const nTx = link.totalTransactions
        // if (nTx < 5) return 1
        // if (nTx < 25) return 2
        // if (nTx < 50) return 3
        // if (nTx < 100) return 4
        // if (nTx < 250) return 5
        // if (nTx < 500) return 6
        const nSent = link.totalSent 
        if (nSent <= 50) return 1
        if (nSent < 350) return 2
        if (nSent < 500) return 3
        if (nSent < 800) return 4
        if (nSent < 1000) return 5
        if (nSent < 1300) return 6
        return 10
    }}
    linkColor={(link) => {
        // let max = 400;
        // let rainbow = new Rainbow(); 
        // rainbow.setNumberRange(0, 750);
        // rainbow.setSpectrum("grey", "green", "yellow", "orange", "red");
        if (link.type === "userCommand") return "blue";
        if (link.type === "feeTransfer") return "orange";
        if (link.type === "transactionFee") return "red";
        return "black"
            
    }}
    graphData={data}
    />;
};

const GET_BLOCKS = gql`
query MyQuery {
    blocks(first: 500) {
      nodes {
        transactions {
          feeTransfer {
            fee
            recipient
          }
          userCommands {
            fee
            from
            to
            id
            amount
          }
        }
        creator
      }
    }
}`

export default DynamicGraph