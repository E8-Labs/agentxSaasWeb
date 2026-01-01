import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'

// Import slices
import userSlice from './slices/userSlice'
import dialerSlice from './slices/dialerSlice'

// SSR-safe storage wrapper
const createNoopStorage = () => ({
  getItem: () => Promise.resolve(null),
  setItem: (_key, value) => Promise.resolve(value),
  removeItem: () => Promise.resolve(),
})

const storage =
  typeof window !== 'undefined'
    ? require('redux-persist/lib/storage').default
    : createNoopStorage()

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  // Whitelist specific slices to persist
  // NOTE: 'dialer' is NOT persisted - we reset dialer state on page refresh
  // to prevent trying to restore disconnected Twilio calls
  whitelist: ['user'],
  // Transform to maintain compatibility with existing localStorage structure
  transforms: [],
}

// Root reducer combining all slices
const rootReducer = combineReducers({
  user: userSlice,
  dialer: dialerSlice,
})

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

// TypeScript types would go in a separate .d.ts file or .ts file
// For JavaScript projects, these exports are not needed
