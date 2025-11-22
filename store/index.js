import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

// Import slices
import userSlice from './slices/userSlice'

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  // Whitelist specific slices to persist
  whitelist: ['user'],
  // Transform to maintain compatibility with existing localStorage structure
  transforms: [],
}

// Root reducer combining all slices
const rootReducer = combineReducers({
  user: userSlice,
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
