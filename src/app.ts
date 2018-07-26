import { start as fakeRead, push as fakePush } from "./blockchains/fake"
import { request as fakeRequest } from "./providers/fake";
import { RequestHandler } from "./IBlockchain";
import { getDataDefByHash } from "./reverse_map";

console.log("hello")

let readers = [ fakeRead ]
let writers = {
	fake: fakePush
}
let providers = {
	fake: fakeRequest
}

let onRequest: RequestHandler = async req =>
{
	console.log("NEW REQUEST")
	console.log(req)
	let def = await getDataDefByHash(req.dataHash)
	if (!def)
		return console.log(`data hash not found! ${req.dataHash}`), false
	
	let response = await providers[def.provider as keyof typeof providers](def.params)
	let tx = await writers[def.provider as keyof typeof writers](req.receiver, response)
	return tx.result
}

let stoppers = readers.forEach(r => r(onRequest))