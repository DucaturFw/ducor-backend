import { IOracleData } from "./IOracleData";

export interface IDataProvider<TProviderDataParams>
{
	requestData(params: TProviderDataParams): Promise<IOracleData>
}