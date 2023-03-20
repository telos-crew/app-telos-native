import axios from 'axios';
import { BALLOTS_SEARCH_ENDPOINT } from 'src/const/endpoints';

export const fetchBallots = async () => {
	const {
		data: { data: ballotData }
	} = await axios({
		method: 'GET',
		url: `${process.env.GOODBLOCK_HOSTNAME}/${BALLOTS_SEARCH_ENDPOINT}/wish.gen.`
	});
	console.log('ballots: ', ballotData);
	return ballotData;
};

export const fetchBallot = async (ballot_name: string) => {
	console.log('fetchBallot ballot_name: ', ballot_name);
	const { data: ballotData } = await axios({
		method: 'GET',
		url: `${process.env.GOODBLOCK_HOSTNAME}/ballot/${ballot_name}`
	});
	console.log('fetchBallot ballot: ', ballotData);
	return ballotData;
};

export const fetchVoter = async (
	account_name: string,
	treasury_symbol: string
) => {
	const { data: voterData } = await axios({
		method: 'POST',
		url: `${process.env.GOODBLOCK_HOSTNAME}/treasury-voter`,
		data: {
			account_name,
			treasury_symbol
		}
	});
	return voterData;
};

export const fetchVoterVotes = async (account_name: string) => {
	const {
		data: {
			votes: { data }
		}
	} = await axios({
		method: 'GET',
		url: `${process.env.GOODBLOCK_HOSTNAME}/votes/${account_name}/4,VOTE`
	});
	return data;
};

export type postBallotCommentPaylot = {
	ballot_name: string,
	content: string,
	account_name: string,
	parent_id: null | undefined | number
}

export const postBallotComment = async (payload: any) => {
	const { data } = await axios({
		method: 'POST',
		url: `${process.env.GOODBLOCK_HOSTNAME}/ballot/comment`,
		data: payload
	});
	return data;
};

export const fetchBallotComments = async (ballot_name: string) => {
	const { data } = await axios({
		method: 'GET',
		url: `${process.env.GOODBLOCK_HOSTNAME}/ballot/comments/${ballot_name}`
	});
	console.log('fetchBallotComments: ', data);
	return data;
};
