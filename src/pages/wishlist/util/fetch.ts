import axios from "axios";

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
    url: `http://localhost:3888/ballots/search/wish.gen.`
  })
  console.log("ballots: ", ballotData);
  return ballotData;
}

export const fetchBallot = async (ballotId: string) => {
  const { data: { data: ballotData } } = await axios({
    method: "GET",
    url: `http://localhost:3888/ballots/${ballotId}`
  })
  console.log("fetchBallot ballot: ", ballotData);
  return ballotData;
}
