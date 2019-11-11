import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { forOfStatement } from '@babel/types';
import { ForceGraph2D, ForceGraph3D } from 'react-force-graph';

const { useState, useEffect, useRef, useCallback } = React;
const DynamicGraph = () => {
    const [data, setData] = useState({ nodes: [], links: [] });
    const { loading, error, data: query_data, refetch } = useQuery(GET_BLOCKS, {pollInterval: 10000});
    const fgRef = useRef();
    // filter out all the existing nodes
    // call setData with the rest
    const receivedNodes = query_data && query_data.blocks.nodes || []
    const newNodes = receivedNodes.filter((new_node) => {
        return !data.nodes.some(node => node.id === new_node.stateHash)   
    })

    if (newNodes.length !== 0) {
        const graphNodes = newNodes.map((node) => ({ 
            id: node.stateHash, 
            name: node.stateHash,
            value: node.stateHash,
            previousStateHash: node.protocolState.previousStateHash
        }))
        const allNodes = data.nodes.concat(graphNodes)

        const newLinks = graphNodes.map((node) => {
            return {
                 source: node.id, 
                 target: node.previousStateHash 
            } 
        }).filter(link => allNodes.some(node => node.id === link.target))

        const newData = {
            links: data.links.concat(newLinks),
            nodes: allNodes,
        }

        setData(newData)
    }

        // query_data.blocks.nodes.forEach((node) => {
        //     const graph_node = { 
        //         id: node.stateHash, 
        //         name: node.stateHash,
        //         value: node.stateHash
        //     }
        //     const link = {
        //          source: node.stateHash, 
        //          target: node.protocolState.previousStateHash 
        //     } 

        //     if ( !data.nodes.some(node => node.id == new_node.id ) ) new_payload.nodes.add(new_node)
            
        //     if ( new_payload.nodes.some(node => node.id == link.target) || prev_data.nodes.some(node => node.id == link.target) ){
        //         new_payload.links.add(link)
        //     }   
        // });

    return <ForceGraph2D
    ref={fgRef}
    enableNodeDrag={true}
    graphData={data}
    />;
};

const GET_BLOCKS = gql`
  query {
      blocks(first: 75) {
          nodes {
              creator
              stateHash
              protocolState {
                  previousStateHash
                  blockchainState {
                      date
                      snarkedLedgerHash
                      stagedLedgerHash
                  }
                  consensusState {
                    epoch
                    slot
                  }
              }
              transactions {
                  userCommands{
                      id
                      isDelegation
                      nonce
                      from
                      to
                      amount
                      fee
                      memo
                  }
                  feeTransfer {
                      recipient
                      fee
                  }
                  coinbase
              }
              snarkJobs {
                  prover
                  fee
                  workIds
              }
          }
          pageInfo {
              hasNextPage
              hasPreviousPage
              firstCursor
              lastCursor
          }
          totalCount
      }
  }`

export default DynamicGraph