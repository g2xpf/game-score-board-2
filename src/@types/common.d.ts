export type GameKind = "arcaea" | "chunithm";

export type PrimaryKey<K extends GameKind> = K extends "arcaea"
  ? Arcaea.PrimaryKey
  : K extends "chunithm"
  ? Chunithm.PrimaryKey
  : never;
export type ScoreData<K extends GameKind> = K extends "arcaea"
  ? Arcaea.ScoreData
  : K extends "chunithm"
  ? Chunithm.ScoreData
  : never;
export type ScoreDataQuery<K extends GameKind> = K extends "arcaea"
  ? Arcaea.ScoreDataQuery
  : K extends "chunithm"
  ? Chunithm.ScoreDataQuery
  : never;
export type ScoreDataQueryKey<K extends GameKind> = keyof ScoreDataQuery<K>;
export type ScoreDataQueryValue<K extends GameKind> =
  ScoreDataQuery<K>[ScoreDataQueryKey<K>];
export type ScoreDataKey<K extends GameKind> = keyof ScoreData<K>;
export type ScoreDataValue<K extends GameKind> = ScoreData<K>[ScoreDataKey<K>];

export namespace Arcaea {
  export type Difficulty = "PAST" | "PRESENT" | "FUTURE" | "BEYOND";
  export type RawDifficulty = 0 | 1 | 2 | 3;

  export interface ScoreDataQuery {
    name: string;
    difficulty: RawDifficulty;
    score: number;
    constant: number;
  }

  export type PrimaryKey = {
    name: string;
    difficulty: RawDifficulty;
  };

  export interface ScoreData extends PrimaryKey {
    score: number;
    constant: number;
    updated_at: string;
  }
}

export namespace Chunithm {
  export type Difficulty = "BASIC" | "ADVANCED" | "EXPERT" | "MASTER";
  export type RawDifficulty = 0 | 1 | 2 | 3;

  export interface ScoreDataQuery {
    name: string;
    difficulty: RawDifficulty;
    score: number;
    constant: number;
  }

  export type PrimaryKey = {
    name: string;
    difficulty: RawDifficulty;
  };

  export interface ScoreData extends PrimaryKey {
    score: number;
    constant: number;
    updated_at: string;
  }
}
