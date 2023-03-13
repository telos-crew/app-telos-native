import axios from "axios";
import { BALLOTS_SEARCH_ENDPOINT } from "src/const/endpoints";

export const fetchBallots = async () => {
  // const { rows: ballotData } = await this.$store.$api.getTableRows({
  //   code: "telos.decide",
  //   scope: "telos.decide",
  //   table: "ballots",
  //   index_position: "4",
  //   key_type: "i64",
  //   upper_bound: "VOTE",
  //   lower_bound: "VOTE",
  // });
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
