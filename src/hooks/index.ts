import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { GlobalState, GlobalDispatch } from "../store";

export const useGlobalSelector: TypedUseSelectorHook<GlobalState> = useSelector;
export const useGlobalDispatch = () => useDispatch<GlobalDispatch>();
