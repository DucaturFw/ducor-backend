export function mapObject<TSourceObj extends { }, TTargetValue>(obj: TSourceObj, mapValues: (val: TSourceObj[keyof typeof obj]) => TTargetValue)
{
	return (Object.keys(obj) as (keyof typeof obj)[]).reduce((acc, key) => { acc[key] = mapValues(obj[key]); return acc }, {} as { [P in keyof TSourceObj]: TTargetValue })
}