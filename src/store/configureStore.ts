import { configureStore, ConfigureStoreOptions } from "@reduxjs/toolkit";
import reducer, { GlobalState } from "../reducers";

const config: ConfigureStoreOptions<GlobalState> = {
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["updated_at"],
      },
    }),
};
const ConfigureStore = () => configureStore(config);
export default ConfigureStore;
