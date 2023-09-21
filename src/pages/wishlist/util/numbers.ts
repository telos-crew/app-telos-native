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
	if (lt(count, '0')) return '0'
	if (gt(count, '999999')) {
		if (lt(count, '10000000')) {
			const ratio = div(count, '100000')
			return `${ratio.split('').join('.')}m`
		}
		const ratio = div(count, '1000000')
		return `${ratio}m`
	}
	if (gt(count, '999')) {
		if (lt(count, '10000')) {
			const ratio = div(count, '100')
			return `${ratio.split('').join('.')}k`
		}
		const ratio = div(count, '1000')
		return `${ratio}k`
	}

	return count.split('.')[0]
}
