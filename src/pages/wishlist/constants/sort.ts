import { Ballot } from '../types/blockchain'
import {
	Results,
	getBallotResults,
	getBallotResultsAsStrings2
} from '../../resolve/util/blockchain'
import { gt } from 'biggystring'

export const BALLOT_SORT_MAP = {
	'highest-approval': (aBallot: Ballot, bBallot: Ballot) => {
		const aYes = getBallotResults(aBallot).yes
		const bYes = getBallotResults(bBallot).yes
		return bYes - aYes
	},
	'lowest-approval': (aBallot: Ballot, bBallot: Ballot) => {
		const aNo = getBallotResults(aBallot).no
		const bNo = getBallotResults(bBallot).no
		return bNo - aNo
	}
}

type ResultsResponse = {
	[key: string]: Results
}

export const OUTCOME_SORT_MAP = (results: ResultsResponse) => {
	return {
		'highest-approval': (aBallot: Ballot, bBallot: Ballot) => {
			const aYes = getBallotResultsAsStrings2(
				results[aBallot.ballot_name]
			).netYes
			const bYes = getBallotResultsAsStrings2(
				results[bBallot.ballot_name]
			).netYes
			if (gt(aYes, bYes)) return -1
			if (gt(bYes, aYes)) return 1
			return 0
		},
		'lowest-approval': (aBallot: Ballot, bBallot: Ballot) => {
			const aYes = getBallotResultsAsStrings2(
				results[aBallot.ballot_name]
			).netYes
			const bYes = getBallotResultsAsStrings2(
				results[bBallot.ballot_name]
			).netYes
			if (gt(aYes, bYes)) return 1
			if (gt(bYes, aYes)) return -1
			return 0
		}
	}
}
