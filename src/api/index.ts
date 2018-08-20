import express from "express"

export let app = express()

export let CONFIG = {
	config: () => ({ }),
	generate: ({blockchain, category, provider, config, updatefreq, lifetime}: {
		blockchain: string
		category: string
		config: any
		provider: string
		updatefreq: string
		lifetime: string
	}) => ({
		contract: `generated_contract_${blockchain}_${category}_${provider}_${updatefreq}_${lifetime}_${config}`,
		instructions: "contract_instructions"
	})
}

// CORS
app.use((req, res, next) =>
{
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
	next()
})

app.get('/time', (req, res) => res.json({ time: Date.now() }))
app.get('/config', (req, res) => res.json(CONFIG.config()))
app.get('/generate/:blockchain/:category/:provider', (req, res, next) =>
{
	let { blockchain, category, provider } = req.params
	let { config, updatefreq, lifetime } = req.query
	
	try
	{
		return res.json(CONFIG.generate({
			blockchain,
			category,
			provider,
			config: JSON.parse(config),
			updatefreq,
			lifetime,
		}))
	}
	catch(e)
	{
		let msg = ("message" in e) ? e.message : e
		return res.json({ error: msg })
	}
})

export type IConfigGenerateFunction = typeof CONFIG.generate
export type IConfigFunction = typeof CONFIG.config