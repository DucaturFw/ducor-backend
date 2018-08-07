import { getExchanges, pairsListRequest } from '../../providers/crypto'

export type categoriesNames = 'crypto' | 'stocks' | 'sports' | 'random'

export type IConfigMethod = (a: { allPairs: string[], providersWithPairs: Array<[ string, string[] ]> }) => {
  categories: Array<{
    name: categoriesNames,
    types?: string[],
    providers?: Array<{
      id: string,
      name: string,
      types: string[],
    }>,
  }>,
}

const zip = (arr: any[], ...arrs: any[][]): any[] =>
  arr.map((v, i) => arrs.reduce((a, b) => [...a, b[i]], [v]))

const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1)

export const initProviders = async () => {
  const providers = getExchanges()
  const providersPairsRequests = providers.map(pairsListRequest as (provider: string) => Promise<string[]>)
  const pairs = await Promise.all(providersPairsRequests)
  const providersWithPairs: [ string, string[] ][] = zip(providers, pairs)
  const allPairs = [ ...new Set(pairs.reduce((a, b) => [ ...a, ...b ], [])) ]

  return { providers, pairs, providersWithPairs, allPairs }
}

export const config: IConfigMethod = ({ allPairs, providersWithPairs }) => ({
  categories: [
    {
      name: 'crypto',
      types: allPairs,
      providers: providersWithPairs.map(([ id, types ]) => ({
        id, name: capitalizeFirstLetter(id), types,
      })),
    },
    {
      name: 'stocks',
    },
    {
      name: 'sports',
    },
    {
      name: 'random',
    },
  ],
})

export default config
