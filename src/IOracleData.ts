import { IDataProviderRequestArg } from "./IDataProvider"

export type IDataType = "bytes" | "int" | "float" | "string" | "price" | "uint"
export interface IDataGeneric<TType extends IDataType, TData> {
  type: TType
  data: TData
}
export type IOracleData =
  | IDataGeneric<"bytes", string | Buffer>
  | IDataGeneric<"int", number>
  | IDataGeneric<"uint", number>
  | IDataGeneric<"float", number>
  | IDataGeneric<"string", string>
  | IDataGeneric<"price", { price: number; decimals: number }>

export type IFlatObj = { [key: string]: string | number | boolean }
export interface IDataHashSource {
  category: string
  provider: string
  config: IFlatObj
}

export interface IDataDefinition extends IDataHashSource {
  type: IDataType
  hash: string
}

export interface IContractEndpoint {
  hash: string
  type: IDataType
  name: string
  args: IDataProviderRequestArg[]
}

export interface IContractEndpointSettings extends IContractEndpoint {
  updateFreq: number
  lifetime: number
}

export type IContractGenerator = (
  endpoints: IContractEndpointSettings[]
) => string
