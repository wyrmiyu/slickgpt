import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { DATABASE_URL, STORAGE_TYPE } from '$env/static/public';
import { db, loadChatFromDb } from '$misc/firebase';
import { ref, set, update } from 'firebase/database';
import { connectToMongoDB, getMongoDBItem, setMongoDBItem, removeMongoDBItem, clearMongoDB } from '$misc/mongodb';

interface StorageService {
	getItem<T>(key: string): Promise<T | null>;
	setItem<T>(key: string, value: T): Promise<void>;
	removeItem(key: string): Promise<boolean>;
	clear(): Promise<void>;
}

interface MyDB extends DBSchema {
	chatStore: {
		key: string;
		value: any;
	};
}

class IdbStorageService implements StorageService {
	private dbName = 'slickGPT';
	private storeName: 'chatStore' = 'chatStore';
	private db: IDBPDatabase<MyDB> | null = null;

	public async initDb(): Promise<void> {
		try {
			this.db = await openDB<MyDB>(this.dbName, 1, {
				upgrade(db) {
					db.createObjectStore('chatStore');
				}
			});
		} catch (error) {
			console.error('Failed to initialize IndexedDB:', error);
		}
	}

	private async getDb(): Promise<IDBPDatabase<MyDB> | null> {
		if (!this.db) {
			await this.initDb();
		}
		return this.db;
	}

	async getItem<T>(key: string): Promise<T | null> {
		try {
			const db = await this.getDb();
			if (!db) return null;
			return db.get(this.storeName, key);
		} catch (error) {
			return null;
		}
	}

	async setItem<T>(key: string, value: T): Promise<void> {
		try {
			const db = await this.getDb();
			if (!db) return;
			await db.put(this.storeName, value, key);
		} catch (error) {
			console.error('Error in setItem:', error);
		}
	}

	async removeItem(key: string): Promise<boolean> {
		try {
			const db = await this.getDb();
			if (!db) return false;
			await db.delete(this.storeName, key);
			return true;
		} catch (error) {
			console.error('Error in removeItem:', error);
			return false;
		}
	}

	async clear(): Promise<void> {
		try {
			const db = await this.getDb();
			if (!db) return;
			await db.clear(this.storeName);
		} catch (error) {
			console.error('Error in clear:', error);
		}
	}

	async migrateLocalStorageToIndexedDB() {
		const keys = Object.keys(localStorage);

		const authSubstrings = ['msal.', 'mode', 'shipbit']; // don't migrate these

		for (const key of keys) {
			const value = localStorage.getItem(key);
			if (value) {
				try {
					const isAuthKey = authSubstrings.some(substring => key.includes(substring));
					if (!isAuthKey) {
						const parsedValue = JSON.parse(value);
						await this.setItem(key, parsedValue);
						localStorage.removeItem(key);
					}
				} catch (e) {
					console.error(`Failed to migrate key "${key}"`, e);
				}
			}
		}
	}
}

class InMemoryStorageService implements StorageService {
	private storage: Map<string, any> = new Map();

	getItem<T>(key: string): Promise<T | null> {
		return this.storage.get(key) || null;
	}

	async setItem<T>(key: string, value: T): Promise<void> {
		this.storage.set(key, value);
	}

	async removeItem(key: string): Promise<boolean> {
		return this.storage.delete(key);
	}

	async clear(): Promise<void> {
		this.storage.clear();
	}
}

class SelfHostedStorageService implements StorageService {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	async getItem<T>(key: string): Promise<T | null> {
		try {
			const response = await fetch(`${this.baseUrl}/${key}`);
			if (!response.ok) {
				throw new Error('Failed to fetch item');
			}
			return await response.json();
		} catch (error) {
			console.error('Error in getItem:', error);
			return null;
		}
	}

	async setItem<T>(key: string, value: T): Promise<void> {
		try {
			const response = await fetch(`${this.baseUrl}/${key}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(value)
			});
			if (!response.ok) {
				throw new Error('Failed to set item');
			}
		} catch (error) {
			console.error('Error in setItem:', error);
		}
	}

	async removeItem(key: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}/${key}`, {
				method: 'DELETE'
			});
			if (!response.ok) {
				throw new Error('Failed to remove item');
			}
			return true;
		} catch (error) {
			console.error('Error in removeItem:', error);
			return false;
		}
	}

	async clear(): Promise<void> {
		try {
			const response = await fetch(`${this.baseUrl}/clear`, {
				method: 'POST'
			});
			if (!response.ok) {
				throw new Error('Failed to clear items');
			}
		} catch (error) {
			console.error('Error in clear:', error);
		}
	}
}

class FirebaseStorageService implements StorageService {
	async getItem<T>(key: string): Promise<T | null> {
		try {
			const response = await loadChatFromDb(key);
			return response as T;
		} catch (error) {
			console.error('Error in getItem:', error);
			return null;
		}
	}

	async setItem<T>(key: string, value: T): Promise<void> {
		try {
			await set(ref(db, `sharedchats/${key}`), value);
		} catch (error) {
			console.error('Error in setItem:', error);
		}
	}

	async removeItem(key: string): Promise<boolean> {
		try {
			await update(ref(db), { [`sharedchats/${key}`]: null });
			return true;
		} catch (error) {
			console.error('Error in removeItem:', error);
			return false;
		}
	}

	async clear(): Promise<void> {
		try {
			// Implement clear logic if needed
		} catch (error) {
			console.error('Error in clear:', error);
		}
	}
}

class MongoDBStorageService implements StorageService {
	async getItem<T>(key: string): Promise<T | null> {
		try {
			return await getMongoDBItem<T>(key);
		} catch (error) {
			console.error('Error in getItem:', error);
			return null;
		}
	}

	async setItem<T>(key: string, value: T): Promise<void> {
		try {
			await setMongoDBItem(key, value);
		} catch (error) {
			console.error('Error in setItem:', error);
		}
	}

	async removeItem(key: string): Promise<boolean> {
		try {
			await removeMongoDBItem(key);
			return true;
		} catch (error) {
			console.error('Error in removeItem:', error);
			return false;
		}
	}

	async clear(): Promise<void> {
		try {
			await clearMongoDB();
		} catch (error) {
			console.error('Error in clear:', error);
		}
	}
}

const createStorageService = async (): Promise<StorageService> => {
	switch (STORAGE_TYPE) {
		case 'self-hosted':
			if (DATABASE_URL) {
				return new SelfHostedStorageService(DATABASE_URL);
			}
			break;
		case 'firebase':
			return new FirebaseStorageService();
		case 'mongodb':
			await connectToMongoDB(DATABASE_URL);
			return new MongoDBStorageService();
		case 'local':
			if (typeof window !== 'undefined' && 'indexedDB' in window) {
				const idbService = new IdbStorageService();
				await idbService.migrateLocalStorageToIndexedDB();
				await idbService.initDb();
				return idbService;
			}
			break;
		default:
			return new InMemoryStorageService();
	}
	return new InMemoryStorageService();
};

const storageService: Promise<StorageService> = createStorageService();

export default storageService;
