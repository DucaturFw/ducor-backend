import Eos, { IEosjsCallsParams, IEosContract } from "eosjs"

export let EOS_PUSHER_PK = process.env.EOS_PUSHER_PK
export let EOS_RPC = process.env.EOS_RPC
export let EOS_CHAIN_ID = process.env.EOS_CHAIN_ID

console.assert(EOS_PUSHER_PK, "pk not found in config")
console.assert(EOS_RPC, "rpc not found in config")

let config = {
	chainId: EOS_CHAIN_ID, // 32 byte (64 char) hex string
	// chainId: null,
	keyProvider: EOS_PUSHER_PK, // WIF string or array of keys..
	httpEndpoint: EOS_RPC,
	// mockTransactions: () => 'pass', // or 'fail'
	/* transactionHeaders: (expireInSeconds: any, callback: (error: any, headers: any)) => {
		callback(undefined, headers)
	}, */
	expireInSeconds: 60,
	broadcast: false,
	// debug: false, // API and transactions
	// debug: true,
	sign: true,
}

export let eos = Eos(config)

export function getTableRows<T>(code: string, scope: string, table: string, json: boolean = true, limit: number = 10000)
{
	return eos.getTableRows<T>({
		code,
		scope,
		table,
		limit,
		json: json.toString()
	})
}

type IProp<T> = T[keyof T]
type IMethod<TArgs, TRes> = (args: TArgs, extra?: IEosjsCallsParams) => Promise<TRes>

export function callContract<TContract extends IEosContract, TArgs>(contract: string, method: keyof TContract, args: TArgs, extra: IEosjsCallsParams): Promise<any>
{
	return new Promise((resolve, reject) =>
	{
		eos.contract<TContract>(contract, extra, (err, res) =>
		{
			if (err)
				return reject(err)

			let m = res[method] as IProp<TContract> & IMethod<TArgs, any>

			return m(args, extra).then(resolve).catch(reject)
		})
	})
}