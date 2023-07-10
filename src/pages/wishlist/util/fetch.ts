import axios from 'axios'
import { BALLOTS_SEARCH_ENDPOINT } from 'src/const/endpoints'
import { FetchItemConfig } from '../types/blockchain'

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
		url: `${process.env.GOODBLOCK_HOSTNAME}/${BALLOTS_SEARCH_ENDPOINT}/wish.gen.`
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
		url: `${process.env.GOODBLOCK_HOSTNAME}/votes/${account_name}/4,VOTE`
	})
	return data
}

export type PostBallotCommentPayload = {
	ballot_name: string
	content: string
	account_name: string
	parent_hash: null | undefined | string
}

export const fetchItemComments = async (config: FetchItemConfig) => {
	const path = `${process.env.COMMENT_INDEXER_HOSTNAME}/item/comments`
	const searchParams = config
	console.log('config: ', config)
	const url = stringifyUrlParams(path, searchParams)
	console.log('url', url)
	const { data } = await axios({
		method: 'GET',
		url
	})
	console.log('fetchItemComments: ', data)
	return data
}

export const fetchBallotComments = async (
	ballot_name: string,
	parent_hash: string | null
) => {
	const config = {
		contract: 'telos.decide',
		scope: 'telos.decide',
		table: 'ballots',
		primary_key: ballot_name,
		parent_hash: parent_hash || null
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
	parent_hash?: string | null
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
	const [nonce, expiration] = response.split(':')
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
			const { data } = await callback()
			return data
		} catch (err: any) {
			console.log('authFetch->exec err: ', err)
			if (err.response.status === 401) {
				await getAuth(store)
				const { data } = await callback()
				return data
			}
		}
	}
	await exec()
}

export const saveItemComment = async (payload: any, store: any) => {
	console.log('saveItemComment store: ', store)
	await authFetch(
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
