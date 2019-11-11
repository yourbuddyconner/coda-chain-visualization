import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

export default graphql(gql`
query {
    blocks(first: 500) {
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
}`)