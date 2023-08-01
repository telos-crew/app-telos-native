export const formatVoteCount = (count: number) => {
	if (Math.abs(count) > 999999) {
		return `${(count / 1000000).toFixed(1)}M`
	}
	if (Math.abs(count) > 999) {
		return `${(count / 1000).toFixed(1)}K`
	}

	return count.toFixed(0)
}
