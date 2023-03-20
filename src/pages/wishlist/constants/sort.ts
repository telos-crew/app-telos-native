import { Ballot } from '../types/blockchain'
import { getBallotResults } from '../../resolve/util/blockchain'

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
