import axios from "axios";
import { BALLOTS_SEARCH_ENDPOINT } from "src/const/endpoints";

export const fetchBallots = async () => {
  const { data: { data: ballotData } } = await axios({
    method: "GET",
    url: `${process.env.GOODBLOCK_HOSTNAME}/${BALLOTS_SEARCH_ENDPOINT}/wish.gen.`
  })
  console.log("ballots: ", ballotData);
  return ballotData;
}

export const fetchBallot = async (ballot_name: string) => {
  console.log('fetchBallot ballot_name: ', ballot_name)
  const { data: ballotData } = await axios({
    method: "GET",
    url: `${process.env.GOODBLOCK_HOSTNAME}/ballot/${ballot_name}`
  })
  console.log("fetchBallot ballot: ", ballotData);
  return ballotData;
}

export const fetchVoter = async (account_name: string, treasury_symbol: string) => {
  const { data: voterData } = await axios({
    method: "POST",
    url: `${process.env.GOODBLOCK_HOSTNAME}/treasury-voter`,
    data: {
      account_name,
      treasury_symbol
    }
  })
  return voterData;
}

export const fetchVoterVotes = async (account_name: string) => {
  const { data: { votes: { data }} } = await axios({
    method: "GET",
    url: `${process.env.GOODBLOCK_HOSTNAME}/votes/${account_name}/4,VOTE`,
  })
  return data;
}
