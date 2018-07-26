import express from "express"

export let app = express()

export let CONFIG = {
	config: () => ({ }),
	generate: ({blockchain, category, provider, updatefreq, lifetime}: {
		blockchain: string
		category: string
		provider: string
		updatefreq: string
		lifetime: string
	}) => ({
		contract: `generated_contract_${blockchain}_${category}_${provider}_${updatefreq}_${lifetime}`,
		instructions: "contract_instructions"
	})
}

app.get('/time', (req, res) => res.json({ time: Date.now() }))
app.get('/config', (req, res) => res.json(CONFIG.config()))
app.get('/generate/:blockchain/:category/:provider', (req, res) => res.json(CONFIG.generate({
	blockchain: req.params.blockchain,
	category: req.params.category,
	provider: req.params.provider,
	updatefreq: req.query.updatefreq,
	lifetime: req.query.lifetime,
})))