import ScoreBoard, {
  CustomEntryView,
  ScoreDataQuerySample,
} from "./ScoreBoard";
import { ReactNode } from "react";
import { useGlobalSelector } from "../hooks";
import { Arcaea } from "../@types/common";
import { styled } from "@mui/material/styles";

export type RawRank = RangeOf<7>;
export type Rank = "D" | "C" | "B" | "A" | "AA" | "EX" | "EX+" | "PM";

const RANK_NAMES: Rank[] = ["D", "C", "B", "A", "AA", "EX", "EX+", "PM"];

const DifficultyDiv = styled("div")<{ difficulty: Arcaea.Difficulty }>(
  ({ difficulty }) => {
    let color;
    switch (difficulty) {
      case "PAST":
        color = "#24d4e0";
        break;
      case "PRESENT":
        color = "#3cd66f";
        break;
      case "FUTURE":
        color = "#994aa1";
        break;
      case "BEYOND":
        color = "#992f43";
        break;
    }
    return {
      color,
    };
  }
);

function getDifficultyName(difficulty: Arcaea.RawDifficulty) {
  switch (difficulty) {
    case 0:
      return "PAST";
    case 1:
      return "PRESENT";
    case 2:
      return "FUTURE";
    case 3:
      return "BEYOND";
  }
}

function difficultyToReactNode(difficulty: Arcaea.RawDifficulty): ReactNode {
  const difficultyName = getDifficultyName(difficulty);
  return (
    <DifficultyDiv difficulty={difficultyName}>{difficultyName}</DifficultyDiv>
  );
}

function rankToReactNode(rank: RawRank): ReactNode {
  let color;
  switch (rank) {
    case 0:
      color = "#7a0f0f";
      break;
    case 1:
      color = "#827022";
      break;
    case 2:
      color = "#6f8519";
      break;
    case 3:
      color = "#4d0530";
      break;
    case 4:
      color = "#ab116d";
      break;
    case 5:
      color = "#eb2eef";
      break;
    case 6:
      color = "#2e74ff";
      break;
    case 7:
      color = "#ffe68c";
      break;
  }
  return <div style={{ color }}>{RANK_NAMES[rank]}</div>;
}

const scoreHeader = {
  name: "楽曲名",
  difficulty: "難易度",
  score: "スコア",
  constant: "譜面定数",
  rank: "ランク",
  potential: "ポテンシャル",
  updated_at: "最終更新",
};

type ScoreEntry = {
  name: string;
  difficulty: Arcaea.RawDifficulty;
  score: number;
  constant: number;
  rank: RawRank;
  potential: number;
  updated_at: string;
};

const title = "arcaea";
const rateName = "Potential";
const getBestRate = (scoreEntries: ScoreEntry[]): number => {
  const scores30 = scoreEntries
    .map((entry) => entry.potential)
    .sort((l: number, r: number) => {
      if (l > r) return -1;
      else if (l < r) return 1;
      else return 0;
    })
    .slice(0, 30);
  const data_cnt = Math.min(30, scores30.length);

  const rate = scores30.reduce((acc, v) => acc + v) / data_cnt;
  return Math.floor(rate * 10000) / 10000;
};

function scoreToRank(score: number): RawRank {
  return score < 8600000
    ? 0
    : score < 8900000
    ? 1
    : score < 9200000
    ? 2
    : score < 9500000
    ? 3
    : score < 9800000
    ? 4
    : score < 9900000
    ? 5
    : score < 10000000
    ? 6
    : 7;
}

function scoreToPotential(score: number, constant: number): number {
  const potential =
    score <= 9800000
      ? Math.max(0, constant + (score - 9500000) / 300000)
      : score <= 10000000
      ? constant + 1.0 + (score - 9800000) / 200000
      : constant + 2.0;
  return Math.floor(potential * 1000) / 1000;
}

export default function ArcaeaScoreData() {
  const scoreDatas = useGlobalSelector((state) => state.arcaea);

  const scoreEntries: ScoreEntry[] =
    scoreDatas?.map((data) => {
      const rank = scoreToRank(data.score);
      const potential = scoreToPotential(data.score, data.constant);
      const entry: ScoreEntry = {
        name: data.name,
        difficulty: data.difficulty,
        score: data.score,
        constant: data.constant,
        rank,
        potential,
        updated_at: data.updated_at,
      };
      return entry;
    }) ?? [];

  const scoreDataQuerySample: ScoreDataQuerySample<"arcaea"> = {
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

  const customEntryView: CustomEntryView<ScoreEntry> = {
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
