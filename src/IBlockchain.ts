import { IOracleData } from "./IOracleData";

export interface IDataRequest
{
	dataHash: string
	requestId: string
	receiver: string
	blockchain: string
	timestamp: number
}

export type RequestHandler = (req: IDataRequest) => Promise<boolean>

export interface IBlockchainReader
{
	on(event: "request", listener: RequestHandler): void
	off(event: "request", listener: RequestHandler): void
}
export interface ITxPushResult<T>
{
	txhash: string
	result: T
}

export interface IBlockchainPusher<TTxResult>
{
	pushData(receiver: string, data: IOracleData): Promise<ITxPushResult<TTxResult>>
}