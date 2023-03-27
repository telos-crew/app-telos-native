import axios from 'axios'
import { BALLOTS_SEARCH_ENDPOINT } from 'src/const/endpoints'

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

export type postBallotCommentPaylot = {
	ballot_name: string
	content: string
	account_name: string
	parent_id: null | undefined | number
}

export const postBallotComment = async (payload: any) => {
	const { data } = await axios({
		method: 'POST',
		url: `${process.env.GOODBLOCK_HOSTNAME}/ballot/comment`,
		data: payload
	})
	return data
}

export const fetchBallotComments = async (ballot_name: string) => {
	const { data } = await axios({
		method: 'GET',
		url: `${process.env.GOODBLOCK_HOSTNAME}/ballot/comments/${ballot_name}`
	})
	console.log('fetchBallotComments: ', data)
	return data
}

type BallotCommentData = {
	body: object
	folder_path: string
	comment: string
	onUploadProgress: (progress: number) => void
}

export const postBallotComment2 = async (data: BallotCommentData) => {
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
	const hash = await fetchDstorUploadStatus(
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
) => {
	let interval = 2000
	let timeout
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
						return newHash
					}, 1000)
			}
		} catch (err: any) {
			setProgress(0)
			throw new Error(err && err.message)
		}
	}
	checkStatus()
}
