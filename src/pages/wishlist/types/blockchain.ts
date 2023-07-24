export type Ballot = {
	ballot_name: string
	begin_time: string
	category: string
	cleaned_count: 0
	content: string
	description: string
	end_time: string
	max_options: number
	min_options: number
	options: { key: string; value: string }[]
	publisher: string
	settings: { key: string; value: number }
	status: string
	title: string
	total_delegates: 0
	total_raw_weight: string
	total_voters: 2
	treasury_symbol: string
	voting_method: string
}

export type BallotCommentPayload = {
	account_name: string
	ballot_name: string
	parent_id: number
	content: any
}

export type BallotComment = {
	account_name: string
	ballot_name: string
	content: string
	created_at: string
	id: number
	is_deleted: false
	parent_id: string | null
	updated_at: string
	level: number
}

export type AnchorResponse = {
	status: string
	transaction: any
	transactionId: string
	wasBroadcasted: boolean
}

export type FetchItemConfig = {
	contract: string
	scope: string
	table: string
	primary_key: string
	parent_id: string | null
}
