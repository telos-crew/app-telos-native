export type Ballot = {
	ballot_name: string;
	begin_time: string;
	category: string;
	cleaned_count: 0;
	content: string;
	description: string;
	end_time: string;
	max_options: number;
	min_options: number;
	options: { key: string; value: string }[];
	publisher: string;
	settings: { key: string; value: number };
	status: string;
	title: string;
	total_delegates: 0;
	total_raw_weight: string;
	total_voters: 2;
	treasury_symbol: string;
	voting_method: string;
};

export type BallotCommentPayload = {
	account_name: string;
	ballot_name: string;
	parent_id: number | null;
	content: any;
};
