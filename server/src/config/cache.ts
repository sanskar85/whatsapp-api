import Logger from 'n23-logger';
import { createClient } from 'redis';
import { CACHE_TIMEOUT } from './const';

const cache = createClient({
	url: 'redis://127.0.0.1:6379',
});

export function getOrCache<T>(key: string, cb: () => Promise<T>) {
	return new Promise((resolve: (value: T) => void, reject) => {
		cache
			.get(key)
			.then(async (value) => {
				if (value) {
					resolve(JSON.parse(value));
					return;
				}
				const updatedData = await cb();
				cache.setEx(key, CACHE_TIMEOUT, JSON.stringify(updatedData));
				resolve(updatedData);
			})
			.catch((err) => {
				Logger.error('Error getting cached: ' + key, err);
			});
	});
}

export default cache;
