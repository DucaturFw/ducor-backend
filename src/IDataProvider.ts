import { IOracleData } from "./IOracleData"

export type IDataProvider<TParams> = (params: TParams) => Promise<IOracleData>