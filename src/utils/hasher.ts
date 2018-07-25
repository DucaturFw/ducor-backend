type Obj = {[key: string]: string | number | boolean }

export let hashObj = (obj: Obj) => hash(prepare(obj))
export let prepare = (obj: Obj) => Object.keys(obj).sort().map(key => `${key}=${obj[key]}`).join(";")

const createKeccakHash = require('keccak')
export let keccak256 = () => createKeccakHash('keccak256')
export let hash = (s: string) => keccak256().update(s).digest('hex') as string