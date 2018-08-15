import { IOracleData } from "./IOracleData"

export type IDataProvider<TArgs extends any[]> = (ident: string, ...args: TArgs) => Promise<IOracleData>