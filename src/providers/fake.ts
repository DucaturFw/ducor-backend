import { IDataProvider } from "../IDataProvider"

export let request: IDataProvider<string, string> = async req => `response_${req}`