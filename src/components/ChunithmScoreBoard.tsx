import ScoreBoard, { ScoreDataQuerySample } from "./ScoreBoard";
import { ReactNode } from "react";
import { Chunithm } from "../@types/common";
import { useGlobalSelector } from "../hooks";

export type RawRank = RangeOf<11>;
export type Rank =
  | "D"
  | "C"
  | "B"
  | "BB"
  | "BBB"
  | "A"
  | "AA"
  | "AAA"
  | "S"
  | "SS"
  | "SS+"
  | "SSS";

const RANK_NAMES: Rank[] = [
  "D",
  "C",
  "B",
  "BB",
  "BBB",
  "A",
  "AA",
  "AAA",
  "S",
  "SS",
  "SS+",
  "SSS",
];

type ScoreEntry = {
  name: string;
  difficulty: Chunithm.RawDifficulty;
  score: number;
  constant: number;
  rank: RawRank;
  rate: number;
  updated_at: string;
};

const scoreHeader = {
  name: "楽曲名",
  difficulty: "難易度",
  score: "スコア",
  constant: "譜面定数",
  rank: "ランク",
  rate: "レート",
  updated_at: "最終更新",
};

type Color = string;
function rankToColor(rank: RawRank): Color {
  switch (rank) {
    case 0:
      return "#0068B7";
    case 1:
      return "#0068B7";
    case 2:
      return "#0068B7";
    case 3:
      return "#0068B7";
    case 4:
      return "#00A0E9";
    case 5:
      return "#009E96";
    case 6:
      return "#009944";
    case 7:
      return "#8FC31F";
    case 8:
      return "#8FC31F";
    case 9:
      return "#FFF100";
    case 10:
      return "#F39800";
    case 11:
      return "#E60012";
  }
}

function getRank(score: number): RawRank {
  return score <= 499999
    ? 0
    : score < 600000
    ? 1
    : score < 700000
    ? 2
    : score < 800000
    ? 3
    : score < 900000
    ? 4
    : score < 925000
    ? 5
    : score < 950000
    ? 6
    : score < 975000
    ? 7
    : score < 1000000
    ? 8
    : score < 1005000
    ? 9
    : score < 1007500
    ? 10
    : 11;
}

function getRate(score: number, constant: number): number {
  const rate =
    score >= 1007500
      ? constant + 2.0
      : score >= 1005000
      ? constant + 1.5 + ((score - 1005000) * 10) / 50000
      : score >= 1000000
      ? constant + 1.0 + ((score - 1000000) * 5) / 50000
      : score >= 975000
      ? constant + 0.0 + ((score - 975000) * 2) / 50000
      : score >= 950000
      ? constant - 1.5 + ((score - 950000) * 3) / 50000
      : score >= 925000
      ? constant - 3.0 + ((score - 925000) * 3) / 50000
      : score >= 900000
      ? constant - 5.0 + ((score - 900000) * 4) / 50000
      : 0;
  return Math.floor(rate * 10000) / 10000;
}

function getBestRate(data: ScoreEntry[]) {
  const scores30 = data
    .map((e) => e.rate)
    .sort((l: number, r: number) => {
      if (l > r) return -1;
      else if (l < r) return 1;
      else return 0;
    })
    .slice(0, 30);
  const data_cnt = Math.min(30, scores30.length);

  const rate = scores30.reduce((acc, v) => acc + v) / data_cnt;
  return Math.floor(rate * 10000) / 10000;
}

function getDifficultyName(
  difficulty: Chunithm.RawDifficulty
): Chunithm.Difficulty {
  switch (difficulty) {
    case 0:
      return "BASIC";
    case 1:
      return "ADVANCED";
    case 2:
      return "EXPERT";
    case 3:
      return "MASTER";
  }
}

function difficultyToReactNode(difficulty: Chunithm.RawDifficulty) {
  const difficultyName = getDifficultyName(difficulty);
  let color;
  switch (difficultyName) {
    case "BASIC":
      color = "#1ae851";
      break;
    case "ADVANCED":
      color = "#edb118";
      break;
    case "EXPERT":
      color = "#e35146";
      break;
    case "MASTER":
      color = "#9b22f2";
      break;
  }

  return <div style={{ color }}>{difficultyName}</div>;
}

function rankToReactNode(rank: RawRank): ReactNode {
  const rankName = RANK_NAMES[rank];
  const color = rankToColor(rank);
  return <div style={{ color }}>{rankName}</div>;
}

const title = "chunithm";
const rateName = "Rate";

export default function ChunithmScoreData() {
  const scoreDatas = useGlobalSelector((state) => state.chunithm);

  const scoreEntries: ScoreEntry[] =
    scoreDatas?.map((data) => {
      const rank = getRank(data.score);
      const rate = getRate(data.score, data.constant);
      const entry: ScoreEntry = {
        rank,
        rate,
        ...data,
      };
      return entry;
    }) ?? [];

  const scoreDataQuerySample: ScoreDataQuerySample<"chunithm"> = {
    name: {
      defaultValue: "",
      label: "楽曲名",
    },
    constant: {
      defaultValue: 0,
      label: "譜面定数",
    },
    difficulty: {
      defaultValue: 0,
      label: "難易度",
    },
    score: {
      defaultValue: 0,
      label: "スコア",
    },
  };

  const customEntryView = {
    difficulty: difficultyToReactNode,
    rank: rankToReactNode,
  };

  return (
    <>
      {scoreDatas !== null && (
        <ScoreBoard
          title={title}
          header={scoreHeader}
          scoreEntries={scoreEntries}
          rateName={rateName}
          getBestRate={getBestRate}
          customEntryView={customEntryView}
          scoreDataQuerySample={scoreDataQuerySample}
        />
      )}
    </>
  );
}
