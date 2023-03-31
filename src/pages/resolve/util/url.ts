import { scroll } from 'quasar'
const { getScrollTarget, setVerticalScrollPosition } = scroll

export const getUrlParam = (url: string, param: string) => {
	const paramMap = getParamMap(url)
	return paramMap[param]
}

export const getParamMap = (url: string): any => {
	try {
		const urlData = new URL(url)
		const params: string[] = urlData.search.replace('?', '').split('&')
		const paramMap: { [key: string]: string } = {}
		params.forEach((item) => {
			const data = item.split('=')
			paramMap[data[0]] = data[1]
		})
		return paramMap
	} catch (err) {
		console.log('getUrlParam err: ', err)
	}
}

export const scrollToHash = (newHash: string) => {
	const el = document.getElementById(newHash)
	if (!el) return
	const target = getScrollTarget(el)
	const offset = el.offsetTop
	const duration = 500
	setVerticalScrollPosition(target, offset - 100, duration)
}
