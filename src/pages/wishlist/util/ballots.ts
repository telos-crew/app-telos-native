export const parseContent = (serializedContent: string) => {
	let contentUrls, imageUrls, optionData
	try {
		({ contentUrls, imageUrls, optionData } = JSON.parse(serializedContent))
	} catch (err) {
		try {
			contentUrls = new URL(serializedContent)
		} catch (err) {
			console.warn('Unable to parse content URL', serializedContent)
		}
	}
	return {
		contentUrls,
		imageUrls,
		optionData
	}
}
