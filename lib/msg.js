const { proto, downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys')
const fs = require('fs')
const path = require('path')

async function streamToBuffer(stream) {
	let buffer = Buffer.from([])
	for await (const chunk of stream) {
		buffer = Buffer.concat([buffer, chunk])
	}
	return buffer
}

const downloadMediaMessage = async (m, filename = 'file') => {
	try {
		if (m.type === 'viewOnceMessage') m.type = m.msg.type

		const mimeMap = {
			imageMessage: 'image',
			videoMessage: 'video',
			audioMessage: 'audio',
			stickerMessage: 'sticker',
			documentMessage: 'document'
		}

		const type = mimeMap[m.type]
		if (!type) return null

		const stream = await downloadContentFromMessage(m.msg, type)
		const buffer = await streamToBuffer(stream)

		let ext = 'bin'

		if (m.type === 'imageMessage') ext = 'jpg'
		if (m.type === 'videoMessage') ext = 'mp4'
		if (m.type === 'audioMessage') ext = 'mp3'
		if (m.type === 'stickerMessage') ext = 'webp'

		if (m.type === 'documentMessage') {
			const name = m.msg.fileName || 'file.bin'
			ext = path.extname(name).replace('.', '') || 'bin'
		}

		const filePath = `${filename}.${ext}`
		fs.writeFileSync(filePath, buffer)

		return buffer
	} catch (err) {
		console.error("downloadMedia error:", err)
		return null
	}
}

const sms = (conn, m) => {

	if (m.key) {
		m.id = m.key.id
		m.chat = m.key.remoteJid
		m.fromMe = m.key.fromMe
		m.isGroup = m.chat.endsWith('@g.us')
		m.sender = m.fromMe
			? conn.user.id.split(':')[0] + '@s.whatsapp.net'
			: m.isGroup
				? m.key.participant
				: m.key.remoteJid
	}

	if (m.message) {
		m.type = getContentType(m.message)

		m.msg = m.type === 'viewOnceMessage'
			? m.message[m.type].message[getContentType(m.message[m.type].message)]
			: m.message[m.type]

		m.body =
			m.msg?.text ||
			m.msg?.caption ||
			m.msg?.conversation ||
			''
	}

	m.download = (filename) => downloadMediaMessage(m, filename)

	m.reply = (text) =>
		conn.sendMessage(m.chat, { text }, { quoted: m })

	m.react = (emoji) =>
		conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })

	return m
}

module.exports = { sms, downloadMediaMessage }
