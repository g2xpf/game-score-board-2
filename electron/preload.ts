import { contextBridge, ipcRenderer } from "electron";
import type { API, APIKey } from "../src/@types/api";
import type { GameKind, ScoreData, ScoreDataQuery } from "../src/@types/common";

async function fetchScoreData<K extends GameKind>(
  gameKind: K
): Promise<ScoreData<K>[]> {
  return ipcRenderer.invoke(`fetch-${gameKind}-score-data`);
}

async function updateScoreData<K extends GameKind>(
  gameKind: K,
  data: ScoreDataQuery<K>
): Promise<ScoreData<K>> {
  return await ipcRenderer.invoke(`update-${gameKind}-score-data`, data);
}

async function insertScoreData<K extends GameKind>(
  gameKind: K,
  data: ScoreDataQuery<K>
): Promise<ScoreData<K>> {
  return await ipcRenderer.invoke(`insert-${gameKind}-score-data`, data);
}

async function removeScoreData<K extends GameKind>(
  gameKind: K,
  data: ScoreDataQuery<K>
): Promise<ScoreData<K>> {
  return await ipcRenderer.invoke(`remove-${gameKind}-score-data`, data);
}

const apiKey: APIKey = "electron";
const api: API = {
  fetchScoreData,
  updateScoreData,
  insertScoreData,
  removeScoreData,
};

contextBridge.exposeInMainWorld(apiKey, api);
