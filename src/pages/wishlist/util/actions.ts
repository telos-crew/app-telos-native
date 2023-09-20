export const getCastVoteActions = (
	account_name: string,
	ballot_name: string,
	options: string[]
) => {
	const action = [
		{
			account: 'telos.decide',
			name: 'refresh',
			data: {
				voter: account_name
			}
		},
		{
			account: 'telos.decide',
			name: 'castvote',
			data: {
				voter: account_name,
				ballot_name,
				options: [options]
			}
		}
	]
	return action
}

export const joinGroupAction = (account_name: string) => {
	const action = [
		{
			account: 'telos.decide',
			name: 'regvoter',
			data: {
				voter: account_name,
				treasury_symbol: '4,WISH'
			}
		}
	]
	return action
}
