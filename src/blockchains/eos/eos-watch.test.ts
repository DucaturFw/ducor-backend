require("dotenv").config()

import "jest-extended"
import {
  parsers,
  IContext,
  parseRequestArguments,
  prepareContext
} from "./eos-watch"

describe("eos watcher", () => {
  let context: IContext
  beforeAll(async () => {
    context = await prepareContext()
  })
  describe("deserialize args", () => {
    it("should deserialize random", async () => {
      const randomArgs = "0200010864000000d0070000"
      const args = await parseRequestArguments(context)(randomArgs)

      expect(args).toHaveLength(2)
      expect(args).toEqual([ 100, 2000 ])
    })
    it("should deserialize big structure", async () => {
      const rawArgs =
        "07000102030405002ef6ffffff14000000f6ffffffffffffff1400000000000000030502080d0c48656c6c6f20576f726c64000cfeffff"
      const args = await parseRequestArguments(context)(rawArgs)

      expect(args).toHaveLength(7)
      expect(args).toEqual([ -10, 20, '-10', '20', '050208', 'Hello World', -500 ])
    })
  })
})
