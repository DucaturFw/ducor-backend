import { IOracleData } from "./IOracleData";

export type IDataProvider<TProviderDataParams> = (params: TProviderDataParams) => Promise<IOracleData>