export interface IDataGeneric<TType, TData>
{
	dataHash: string
	type: TType
	data: TData
}
export type IOracleData =
	| IDataGeneric<"bytes", string | Buffer>
	| IDataGeneric<"int", number>
	| IDataGeneric<"float", number>
	| IDataGeneric<"string", string>
	| IDataGeneric<"price", { price: number, decimals: number }>

export interface IDataHashSource<TProviderDataParams extends { [key: string]: string | number | boolean }>
{
	category: string
	provider: string
	params: TProviderDataParams
}

export interface IDataDefinition<TProviderDataParams extends { [key: string]: string | number | boolean }> extends IDataHashSource<TProviderDataParams>
{
	hash: string
}