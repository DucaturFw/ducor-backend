import {IContractEndpointSettings, IContractGenerator} from "../../IOracleData"
import { getContractBase } from './eth_generator/codepresets'
import {
    decimalsMapper,
    IWideDataType,
    typeMapper
} from "./eth_generator/consts"

export { start } from './eth-watch'
export { push } from './eth-push'

export let contract: IContractGenerator = endpoints => getContractBase('NEW_CONTRACT', endpoints.map(ethPrepare))


const ethPrepare = (e: IContractEndpointSettings): IWideDataType => {
  return <IWideDataType>({
    hash: `0x${e.hash}`,
    name: e.name,
    type: typeMapper(e.type),
    decimals: decimalsMapper(e.type),
    life: e.lifetime,
    update: e.updateFreq
  })
}