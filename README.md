# The Visualization

![Chain Visualization Gif](/docs/assets/chain-visualization.gif)

This was a quick weekend project that I worked on with my roommate [@reem](https://github.com/reem). The goal was to take blocks from the Coda Daemon's GraphQL Endpoint and display them as a force-directed graph. 

It is utilizing the [React-Vis-Force](https://github.com/uber/react-vis-force) library from Uber.

# Next Steps / Lessons Learned

This is a super rough MVP to prove to myself that I could write a block explorer/visualization. Here's some stuff I learned if I were to try and do this for real: 
- React-Vis-Force doesn't allow you to dynamically add and remove nodes in the graph without reloading the whole thing. To accomplish this, I'd have to fork their library or craft my own D3-based react components. 
- The `blocks` query in the Coda Daemon's GraphQL endponint doesn't *actually* support pagination at the time of writing, so loading the page gets slow as nBlocks increases. Though, even if it did support pagination, you'd still have to load all the blocks first due to #1. 
- When there's a lot of nodes on the graph, it takes a really long time to work all the crossings out. I wished there was a way I could have laid out the nodes from left-right/top-bottom by their timestamp at render time. 
- The Archive node's endpoint is *dangerous* in that there is no authentication, so anyone with access could change the Daemon's internal state. As such, this only works when running a Daemon on the same machine as the visualization. I would love to build out a GraphQL Proxy of some kind in order to mitigate this risk. 

# The Query

The application uses one query from the Daemon: 
```
{
    blocks{
    nodes {
        creator
        stateHash
        protocolState {
        previousStateHash
        blockchainState{
            date
            snarkedLedgerHash
            stagedLedgerHash
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
    }
}
```

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

