import { IOracleData, IFlatObj, IDataType } from "./IOracleData"

export type IDataProvider<TConfig extends IFlatObj, TArgs extends any[]> = (config: TConfig, ...args: TArgs) => Promise<IOracleData>
export type ITypeProvider<TConfig extends IFlatObj> = (config: TConfig) => { type: IDataType, name: string }