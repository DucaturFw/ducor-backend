import express from "express"

export let app = express()

export let CONFIG = {
	config: () => ({ }),
	generate: ({blockchain, category, provider, slug, updatefreq, lifetime}: {
		blockchain: string
		category: string
		slug: string
		provider: string
		updatefreq: string
		lifetime: string
	}) => ({
		contract: `generated_contract_${blockchain}_${category}_${provider}_${updatefreq}_${lifetime}_${slug}`,
		instructions: "contract_instructions"
	})
}

app.get('/time', (req, res) => res.json({ time: Date.now() }))
app.get('/config', (req, res) => res.json(CONFIG.config()))
app.get('/generate/:blockchain/:category/:provider/:slug', (req, res) => res.json(CONFIG.generate({
	blockchain: req.params.blockchain,
	slug: req.params.slug,
	category: req.params.category,
	provider: req.params.provider,
	updatefreq: req.query.updatefreq,
	lifetime: req.query.lifetime,
})))