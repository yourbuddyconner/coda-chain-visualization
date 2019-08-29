import React from 'react';
import {ForceGraph, ForceGraphNode, ForceGraphLink} from 'react-vis-force';

import query from './query.js'

class Blocks extends React.Component {
    render() {
        return <ForceGraph />
    }
}

export default query(Blocks)