import { IDataHashSource } from "../IOracleData";

type Obj = {[key: string]: string | number | boolean }

export let hashObj = (obj: Obj | string) => hash(prepare(obj))
export let prepare = (obj: Obj | string) =>
{
	if (typeof obj === "string")
		return obj
	
	return Object.keys(obj).sort().map(key => `${key}=${obj[key]}`).join(";")
}

const createKeccakHash = require('keccak')
export let keccak256 = () => createKeccakHash('keccak256')
export let hash = (s: string) => keccak256().update(s).digest('hex') as string

export let hashDataId = (obj: IDataHashSource) => hash(`${obj.category}/${obj.provider}:${prepare(obj.ident)}`)