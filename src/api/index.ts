import express from "express"

export let app = express()

app.get('/time', (req, res) =>
{
	res.json({ time: Date.now() })
})