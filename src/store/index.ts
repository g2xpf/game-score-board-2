import configureStore from "./configureStore";

const store = configureStore();
export default store;

export type GlobalState = ReturnType<typeof store.getState>;
export type GlobalDispatch = typeof store.dispatch;
