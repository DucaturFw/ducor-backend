import { start as eosRead, push as eosPush } from "./eos"
import { start as ethRead, push as ethPush } from "./eth"
import { start as fakeRead, push as fakePush } from "./fake"

export const readers = [ eosRead, ethRead, fakeRead ]
export const writers = { eos: eosPush, eth: ethPush, fake: fakePush }
