const axios = require('axios')

const getBuffer = async (url, options = {}) => {
	try {
		const res = await axios({
			method: 'GET',
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			responseType: 'arraybuffer',
			...options
		})
		return res.data
	} catch (err) {
		console.error('getBuffer error:', err.message)
		return null
	}
}

const getGroupAdmins = (participants = []) => {
	const admins = []
	for (let p of participants) {
		if (p.admin) admins.push(p.id)
	}
	return admins
}

const getRandom = (ext = '') => {
	return `${Math.floor(Math.random() * 10000)}${ext}`
}

const h2k = (num) => {
	const units = ['', 'K', 'M', 'B', 'T', 'P', 'E']
	const tier = Math.floor(Math.log10(Math.abs(num)) / 3)

	if (!tier) return num

	const suffix = units[tier]
	const scale = Math.pow(10, tier * 3)
	let scaled = num / scale

	let formatted = scaled.toFixed(1)
	if (/\.0$/.test(formatted)) formatted = formatted.slice(0, -2)

	return formatted + suffix
}

const isUrl = (url = '') => {
	return /https?:\/\/[^\s]+/gi.test(url)
}

const Json = (obj) => JSON.stringify(obj, null, 2)

const runtime = (seconds) => {
	seconds = Number(seconds)

	const d = Math.floor(seconds / 86400)
	const h = Math.floor((seconds % 86400) / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = Math.floor(seconds % 60)

	return `${d ? d + 'd ' : ''}${h ? h + 'h ' : ''}${m ? m + 'm ' : ''}${s ? s + 's' : ''}`.trim()
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const fetchJson = async (url, options = {}) => {
	try {
		const res = await axios({
			method: 'GET',
			url,
			headers: {
				'User-Agent': 'Mozilla/5.0'
			},
			...options
		})
		return res.data
	} catch (err) {
		console.error('fetchJson error:', err.message)
		return null
	}
}

module.exports = {
	getBuffer,
	getGroupAdmins,
	getRandom,
	h2k,
	isUrl,
	Json,
	runtime,
	sleep,
	fetchJson
}
