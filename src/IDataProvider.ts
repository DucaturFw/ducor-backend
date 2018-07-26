import { IOracleData } from "./IOracleData"

export type IDataProvider = (ident: string) => Promise<IOracleData>