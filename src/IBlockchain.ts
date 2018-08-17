import { IOracleData } from "./IOracleData"

export interface IDataRequest
{
	dataHash: string
	requestId: string
	receiver: string
	blockchain: string
	timestamp: number
	args?: any[]
	memo?: string
}

export type RequestHandler = (req: IDataRequest) => Promise<boolean>

export type IBlockchainReader = (listener: RequestHandler) => Promise<{ stop: () => Promise<void> }>
export type IBlockchainPusher<TTxResult> = (receiver: string, dataHash: string, data: IOracleData, memo?: string) => Promise<ITxPushResult<TTxResult>>

export interface ITxPushResult<T>
{
	txhash: string
	result: T
}