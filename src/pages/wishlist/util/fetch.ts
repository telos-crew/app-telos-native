import axios from 'axios'
import { sub } from 'biggystring'
import { BALLOTS_SEARCH_ENDPOINT } from 'src/const/endpoints'
import { FetchItemConfig } from '../types/blockchain'
import { TABLE_ROWS_ENDPOINT } from 'src/pages/resolve/constants'
import { getSymbolInfo } from 'src/pages/resolve/util'

export const stringifyUrlParams = (
	url: string,
	params: { [key: string]: any }
) => {
	console.log('url: ', url)
	console.log('params: ', params)
	let newURL = new URL(url)
	for (const key in params) {
		let serializedParam
		if (typeof params[key] === 'string') {
			serializedParam = params[key]
		} else if (params[key] === null) {
			continue
		} else {
			params[key].toString()
		}
		newURL.searchParams.set(key, serializedParam)
	}
	return newURL.toString()
}

export const fetchBallots = async () => {
	const {
		data: { data: ballotData }
	} = await axios({
		method: 'GET',
		url: `${process.env.GOODBLOCK_HOSTNAME}/${BALLOTS_SEARCH_ENDPOINT}`
	})
	console.log('ballots: ', ballotData)
	return ballotData
}

export const fetchBallot = async (ballot_name: string) => {
	console.log('fetchBallot ballot_name: ', ballot_name)
	const { data: ballotData } = await axios({
		method: 'GET',
		url: `${process.env.GOODBLOCK_HOSTNAME}/ballot/${ballot_name}`
	})
	console.log('fetchBallot ballot: ', ballotData)
	return ballotData
}

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
	})
	return voterData
}

export const fetchVoterVotes = async (account_name: string) => {
	const {
		data: {
			votes: { data }
		}
	} = await axios({
		method: 'GET',
		url: `${process.env.GOODBLOCK_HOSTNAME}/votes/${account_name}/4,WISH`
	})
	return data
}

export type PostBallotCommentPayload = {
	ballot_name: string
	content: string
	account_name: string
	parent_id: null | undefined | string
}

// ballots for treasury, ballots=ballots on
// votes voter = voter eosio_token_balances

export const fetchResults = async () => {
	const {
		data
	} = await axios({
		method: 'GET',
		url: `${process.env.GOODBLOCK_HOSTNAME}/results`
	})
	return data
}

export const fetchItemComments = async (config: FetchItemConfig) => {
	const path = `${process.env.COMMENT_INDEXER_HOSTNAME}/item/comments`
	const searchParams = config
	console.log('config: ', config)
	// because we want to use 'get' and not 'post'
	const url = stringifyUrlParams(path, searchParams)
	console.log('url', url)
	const { data } = await axios({
		method: 'GET',
		url
	})
	console.log('fetchItemComments: ', data)
	return data
}

export const fetchTop2CommentLevels = async (config: FetchItemConfig) => {
	const path = `${process.env.COMMENT_INDEXER_HOSTNAME}/item/comments/top`
	const searchParams = config
	// because we want to use 'get' and not 'post'
	const url = stringifyUrlParams(path, searchParams)
	const { data } = await axios({
		method: 'GET',
		url
	})
	return data
}

export const fetchReplies = async (id: number) => {
	const url = `${process.env.COMMENT_INDEXER_HOSTNAME}/replies/${id}`
	const { data } = await axios({
		method: 'GET',
		url
	})
	return data
}

export const fetchBallotComments = async (
	ballot_name: string,
	parent_id: string | null
) => {
	const config = {
		contract: 'telos.decide',
		scope: 'telos.decide',
		table: 'ballots',
		primary_key: ballot_name,
		parent_id: parent_id || null
	}
	console.log('fetchBallotComments config: ', config)
	const itemComments = await fetchItemComments(config)
	return itemComments
}

export const fetchCommentByHash = async (content_hash: string) => {
	try {
		const { data } = await axios(
			`${process.env.COMMENT_INDEXER_HOSTNAME}/comment/${content_hash}`
		)
		return data[0]
	} catch (err: any) {
		console.log('err: ', err)
		throw new Error(err?.message)
	}
}

type BallotCommentData = {
	body: object
	folder_path: string
	comment: string
	onUploadProgress: (progress: number) => void
}

export const postBallotComment2 = async (
	data: BallotCommentData
): Promise<string> => {
	const formData = new FormData()
	const blob = new Blob([JSON.stringify(data.body)], {
		type: 'application/json'
	})
	const filename = new Date().getTime()
	formData.append('file', blob, `${filename}.json`)
	const accessToken = await fetchDstorAccessToken()
	const uploadToken = await fetchDstorUploadToken(data.folder_path, accessToken)
	await uploadFileToDstor(
		formData,
		accessToken,
		uploadToken,
		data.comment,
		data.onUploadProgress
	)
	const hash: string = await fetchDstorUploadStatus(
		accessToken,
		uploadToken,
		data.onUploadProgress
	)
	return hash
}

export const fetchDstorAccessToken = async () => {
	let accessToken
	const expiration = new Date().getTime() / 1000 + 3600 * 24
	try {
		const headers = {
			'api-key':
				'OY77xJwvfIucJxOsv9h9IEGGUCKbFlmXkKdKz2HsjJhjwmlixyxUaer9D7ekXrPg',
			'x-expiration': expiration
		}
		const {
			data: { access_token }
		} = await axios({
			url: 'https://api.dstor.cloud/v1/dev/temp-token',
			headers
		})
		accessToken = access_token
	} catch (err: any) {
		console.log('access_token error: ', err)
		throw new Error(err && err.message)
	}
	return accessToken
}

export const fetchDstorUploadToken = async (
	folder_path: string,
	access_token: string
) => {
	let uploadToken
	try {
		const {
			data: { token }
		} = await axios({
			method: 'POST',
			url: 'https://api.dstor.cloud/v1/upload/get-token/',
			headers: {
				Authorization: `Bearer ${access_token}`
			},
			data: {
				chunks_number: 1,
				folder_path
			}
		})
		uploadToken = token
	} catch (err: any) {
		console.log('upload token error: ', err)
		throw new Error(err && err.message)
	}
	return uploadToken
}

export const uploadFileToDstor = async (
	formData: any,
	accessToken: string,
	uploadToken: string,
	comment: string,
	onUploadProgress: any
) => {
	try {
		const config = {
			type: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				// "Access-Control-Allow-Origin": "*",
				'Content-Type': 'multipart/form-data',
				// "x-dstor-parent-id": 0, // root folder,
				'x-dstor-comment': comment,
				'x-dstor-upload-token': uploadToken
			},
			onUploadProgress
		}
		await axios.post('https://api.dstor.cloud/v1/upload/', formData, config)
	} catch (err) {
		console.log('upload error: ', err)
	}
}

export const fetchDstorUploadStatus = async (
	accessToken: string,
	uploadToken: string,
	setProgress: (progress: number) => void
): Promise<string> => {
	return new Promise((resolve, reject) => {
		let interval = 2000
		let timeout
		setTimeout(reject, 60000)
		const checkStatus = async () => {
			try {
				const { data: statusData } = await axios(
					'https://api.dstor.cloud/v1/upload/get-status/',
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
							'x-dstor-upload-token': uploadToken
						}
					}
				)
				interval = interval + 250
				timeout = setTimeout(checkStatus, interval)
				switch (statusData.status) {
					case 'ADDING_TO_IPFS':
						setProgress(80)
						break
					case 'SAVING_DATA':
						setProgress(90)
						break
					case 'DONE':
						clearTimeout(timeout)
						setProgress(100)
						setTimeout(() => {
							const newHash = statusData.data[0].Hash
							setProgress(0)
							return resolve(newHash)
						}, 1000)
				}
			} catch (err: any) {
				setProgress(0)
				throw new Error(err && err.message)
			}
		}
		return checkStatus()
	})
}

export type CommentUploadPayload = {
	parent_id?: string | null
	content: string
	table: string
	contract: string
	scope: string
	primary_key?: string
	poster: string
}

export const postBallotComment = async (
	data: CommentUploadPayload
): Promise<string> => {
	if (!process.env.COMMENT_INDEXER_HOSTNAME)
		throw new Error('COMMENT_INDEXER_HOSTNAME env variable not set')
	const {
		data: { hash }
	} = await axios.post(`${process.env.COMMENT_INDEXER_HOSTNAME}/upload`, data)
	return hash
}

export const uploadMedia = async (payload: FormData, onUploadProgress: any) => {
	if (!process.env.COMMENT_INDEXER_HOSTNAME)
		throw new Error('COMMENT_INDEXER_HOSTNAME env variable not set')
	console.log('uploadMedia'), payload
	const { data } = await axios.post(
		`${process.env.COMMENT_INDEXER_HOSTNAME}/upload/media`,
		payload,
		{
			onUploadProgress
		}
	)
	return data
}

export const fetchNonce = async (account_name: string) => {
	if (!process.env.COMMENT_INDEXER_HOSTNAME)
		throw new Error('COMMENT_INDEXER_HOSTNAME env variable not set')
	const {
		data: { nonce }
	} = await axios.get(
		`${process.env.COMMENT_INDEXER_HOSTNAME}/auth/nonce?account_name=${account_name}`,
		{
			withCredentials: true,
			headers: {
				'Access-Control-Allow-Credentials': true
			}
		}
	)
	console.log('nonce: ', nonce)
	return nonce
}

export const validateNonce = async (
	account_name: string,
	transaction: any,
	nonce: any
) => {
	if (!process.env.COMMENT_INDEXER_HOSTNAME)
		throw new Error('COMMENT_INDEXER_HOSTNAME env variable not set')
	try {
		await axios.post(
			`${process.env.COMMENT_INDEXER_HOSTNAME}/auth/nonce`,
			{
				account_name,
				...formatTxForFetch(transaction),
				nonce
			},
			{
				withCredentials: true,
				headers: {
					'Access-Control-Allow-Credentials': true
				}
			}
		)
		return true
	} catch (err) {
		return false
	}
}

export const getAuth = async (store: any) => {
	const { account: account_name } = store.state.accounts
	await store.$auth.showApprovalDialog()
	const response = await fetchNonce(account_name)
	const [nonce] = response.split(':')
	console.log('nonce2: ', nonce)
	const { transaction } = await store.$api.signTransaction(
		[
			{
				account: 'testcomments',
				name: 'auth',
				data: {
					account_name,
					nonce
				}
			}
		],
		{ broadcast: false }
	)
	await validateNonce(account_name, transaction, nonce)
}

export const authFetch = async (
	callback: Function,
	tryAgain = false,
	store: any
) => {
	console.log(
		'authFetch store.state.accounts.account: ',
		store.state.accounts.account
	)
	const exec = async () => {
		try {
			const response = await callback()
			return response
		} catch (err: any) {
			console.log('authFetch->exec err: ', err)
			if (err.response.status === 401) {
				await getAuth(store)
				const response = await callback()
				return response
			}
		}
	}
	const output = await exec()
	return output
}

export const saveItemComment = async (payload: any, store: any) => {
	console.log('saveItemComment store: ', store)
	const response = await authFetch(
		async () => {
			const response = await axios.post(
				`${process.env.COMMENT_INDEXER_HOSTNAME}/item/comment`,
				{
					data: payload
				},
				{
					withCredentials: true,
					headers: {
						'Access-Control-Allow-Credentials': true
					}
				}
			)
			console.log('saveItemComment->authFetch response: ', response)
			return response
		},
		true,
		store
	)
	console.log('saveItemComment response: ', response)
	return response
}

export const testFetch = async () => {
	console.log('testing fetch')
	await axios.get(`${process.env.COMMENT_INDEXER_HOSTNAME}/auth/test`)
}

export const formatTxForFetch = (transaction: any) => {
	return {
		serializedTransaction: btoa(
			String.fromCharCode.apply(null, transaction.serializedTransaction)
		),
		signatures: transaction.signatures
	}
}

export const isUserTreasuryVoter = async (
	account_name: string,
	treasury_symbol: string
): Promise<boolean> => {
	if (!account_name) return false
	// get user from treasury
	const payload = {
		code: 'telos.decide',
		table: 'voters',
		scope: account_name,
		// index_position: 'string', // 1
		// key_type: 'string', / i64,
		upper_bound: treasury_symbol,
		lower_bound: treasury_symbol,
		json: true
	}
	// TABLE_ROWS_ENDPOINT should be passed in or this._____
	const {
		data: { rows }
	} = await axios.post(TABLE_ROWS_ENDPOINT, payload)
	const [row] = rows
	return !!row
}

export const getFeeAmount = async (
	contract: string,
	feeKey: string
): Promise<string> => {
	const payload = {
		code: contract,
		table: 'config',
		scope: contract,
		json: true
	}
	const {
		data: { rows }
	} = await axios.post(TABLE_ROWS_ENDPOINT, payload)
	const [row] = rows
	if (!row || !row.fees) throw new Error('No config row found')
	const result = row.fees.find((item: any) => item.key === feeKey)
	if (!result) throw new Error('No fee found')
	return result.value
}

export const getUserContractBalance = async (
	contract: string,
	account_name: string
) => {
	const payload = {
		code: contract,
		table: 'accounts',
		scope: account_name,
		json: true
	}
	const {
		data: { rows }
	} = await axios.post(TABLE_ROWS_ENDPOINT, payload)
	const [row] = rows
	if (!row || !row.balance) throw new Error('No balance row found')
	return row.balance
}

export const calculateDecideFeeDeficit = async (account_name: string) => {
	const feeAmountSyntax = await getFeeAmount('telos.decide', 'ballot')
	const { amount: feeAmount } = getSymbolInfo(feeAmountSyntax)
	const userBalanceSyntax = await getUserContractBalance(
		'telos.decide',
		account_name
	)
	const { amount: userBalance } = getSymbolInfo(userBalanceSyntax)
	// backwards because we want the **deficit**
	const deficit = sub(feeAmount, userBalance)
	return deficit
}
