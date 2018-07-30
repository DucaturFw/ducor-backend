import push, { sell } from "./eos-push"

async function exec() {
  console.log(process.env.EOS_PRIVATEKEY)
  await push(
    "oraclized",
    "0xfa6bfea31ea21819ca2de9f530fcc2ebc80d0a1b6130c600f5c3c085a335fdec",
    {
      type: "price",
      data: {
        price: Math.floor(Math.random() * 10000 * 1e5),
        decimals: 5
      }
    }
  )

  await push(
    "oraclized",
    "0xa171dc074ec6e8322d342075684229733fc8d05c97cae16c031249a04998b874",
    {
      type: "uint",
      data: Math.floor(Math.random() * 100000)
    }
  )
  await push(
    "oraclized",
    "0x43f298fa9ef0590967e26fd3d183de6c13475ab810b287ea643a94ce75806eb9",
    {
      type: "uint",
      data: Math.floor(Math.random() * 10000)
    }
  )

  await sell("oraclized")
}

exec()
