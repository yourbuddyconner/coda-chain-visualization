import React from 'react';
import {InteractiveForceGraph, ForceGraphNode, ForceGraphLink} from 'react-vis-force';
import _ from 'lodash'

import query from './query.js'

class BlockMetadata extends React.Component {
    render() {
        if(this.props.selectedBlock) {
            return <div style={{position: "fixed", zIndex: 100}}>
                <p>Creator: {this.props.selectedBlock.creator}</p>
                <p>StateHash: {this.props.selectedBlock.stateHash}</p>
                <p>Date Produced: {new Date(parseInt(this.props.selectedBlock.protocolState.blockchainState.date)).toString()}</p>
                <p>nTransactions: {this.props.selectedBlock.transactions.userCommands.length}</p>
                <p>nFeeTransfer: {this.props.selectedBlock.transactions.feeTransfer.length}</p>
                <p>SNARK Jobs: {this.props.selectedBlock.snarkJobs.length}</p>
            </div>
        }
        else {
            return <div></div>
        }
    }
}

class Blocks extends React.Component {
    static defaultProps = {
        metric: (node) => node.transactions.userCommands.length + node.transactions.feeTransfer.length,
    }

    state = {
        selectedBlock: null,
    }

    static getDerivedStateFromProps(props, state) {
        const stateHashes = {}
        const previousStateHashes = {}

        if (props.data.loading) {
            return { stateHashes, previousStateHashes }
        }

        if (props.data.error) {
            return { stateHashes, previousStateHashes }
        }

        let minMetric = Infinity
        let maxMetric = 0

        props.data.blocks.nodes.forEach((node) => {
            stateHashes[node.stateHash] = node
            previousStateHashes[node.protocolState.previousStateHash] = true

            const metric = props.metric(node)

            if (metric > maxMetric) {
                maxMetric = metric
            }

            if (metric < minMetric) {
                minMetric = metric
            }
        })

        return {
            stateHashes,
            previousStateHashes,
            maxMetric,
            minMetric
        }
    }
    
    componentDidMount() {
        setInterval(() => {
            this.props.data.refetch()
        }, 1000 * 60 * 15)
    }

    computeMetricColor(metric) {
        const redness = (metric - this.state.minMetric) / (this.state.maxMetric - this.state.minMetric)
        const red = redness * 100 + (redness === 0 ? 0 : 155)

        console.log('computing', metric, this.state.minMetric, this.state.maxMetric, redness, red)
        return `rgb(${red},0,0)`
    }

    render() {
        if (this.props.data.loading) {
            return null
        }

        if (this.props.data.error) {
            return this.props.data.error
        }

        const height = 2500
        const width = 2500

        const simulationOptions = {
            alpha: 1,
            height,
            width,
            animate: true,
            strength: {
                charge: -140,
                x: 0.1,
            }
        }

        const numBlocks = this.props.data.blocks.nodes.length;

        return <>
            <BlockMetadata selectedBlock={this.state.stateHashes[this.state.selectedBlock]}/>
            <InteractiveForceGraph
                highlightDependencies
                simulationOptions={simulationOptions}
                onSelectNode={(ev, node) => this.setState({ selectedBlock: node.id })}
                onDeselectNode={(ev, node) => this.setState({ selectedBlock: null })}
            >
                {this.props.data.blocks.nodes.map((node, i) => {
                    const hasDependents = this.state.previousStateHashes[node.stateHash];
                    //const fill = hasDependents ? this.computeMetricColor(this.props.metric(node)) : "green"
                    const fill = this.computeMetricColor(this.props.metric(node))

                    return <ForceGraphNode 
                        key={node.stateHash} 
                        fill={fill}
                        node={{
                          id: node.stateHash,
                          radius: 8
                        }}
                    />
                })}
                {_.flatten(this.props.data.blocks.nodes
                .map((node) => {
                    if (!this.state.stateHashes[node.protocolState.previousStateHash]) {
                        return [
                            <ForceGraphNode
                            key={node.protocolState.previousStateHash}
                            fill="black"
                            node={{ id: node.protocolState.previousStateHash }}
                            />,
                            <ForceGraphLink 
                                key={'link+'+node.stateHash} 
                                fill="green"
                                link={{ source: node.protocolState.previousStateHash, target: node.stateHash }}
                            />
                        ]
                    }

                    return <ForceGraphLink 
                    key={'link+'+node.stateHash} 
                    fill="blue"
                    link={{ source: node.protocolState.previousStateHash, target: node.stateHash }}
                    />
                }))}
            </InteractiveForceGraph>
        </>
    }
}

export default query(Blocks)