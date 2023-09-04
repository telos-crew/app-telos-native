import { gt, lt, div } from 'biggystring'

export const formatVoteCount = (count: number): string => {
	if (count < 0) return '0'
	if (Math.abs(count) > 999999) {
		return `${(count / 1000000).toFixed(1)}M`
	}
	if (Math.abs(count) > 999) {
		return `${(count / 1000).toFixed(1)}K`
	}

	return count.toFixed(0)
}

export const formatVoteCountAsStrings = (count: string): string => {
	// console.log('typeof count', typeof count)
	if (lt(count, '0')) return '0'
	if (gt(count, '999999')) {
		const ratio = div(count, '1000000')
		return `${ratio}M`
	}
	if (gt(count, '999')) {
		const ratio = div(count, '1000')
		return `${ratio}K`
	}

	return count.split('.')[0]
}
