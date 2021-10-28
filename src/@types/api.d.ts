import type { GameKind, ScoreData } from "./common";

export type APIKey = "electron";
export type API = {
  fetchScoreData: <K extends GameKind>(gameKind: K) => Promise<ScoreData<K>[]>;
  insertScoreData: <K extends GameKind>(
    gameKind: K,
    data: ScoreData<K>
  ) => Promise<ScoreData<K> | undefined>;
  updateScoreData: <K extends GameKind>(
    gameKind: K,
    data: ScoreData<K>
  ) => Promise<ScoreData<K> | undefined>;
  removeScoreData: <K extends GameKind>(
    gameKind: K,
    primaryKey: ScoreData<K>
  ) => Promise<ScoreData<K> | undefined>;
};
