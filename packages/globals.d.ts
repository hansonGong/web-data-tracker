type Indexable<T> = {
	[index: string]: T
}

type Nullable<T> = T | null

type TrackInfo = Indexable<string | number>

type TimeoutHandle = ReturnType<typeof global.setTimeout>