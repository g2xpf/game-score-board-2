import {
  useCallback,
  ReactNode,
  useState,
  ChangeEvent,
  MouseEvent,
} from "react";
import { useDispatch } from "react-redux";
import {
  Divider,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableSortLabel,
  TablePagination,
  TableContainer,
  Toolbar,
  Tooltip,
  Dialog,
  TextField,
  DialogContent,
  DialogActions,
  Button,
  IconButton as MuiIconButton,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { asyncThunk } from "../reducers";
import {
  GameKind,
  ScoreData,
  ScoreDataKey,
  ScoreDataQuery,
  ScoreDataQueryKey,
} from "../@types/common";

export type ScoreDataQuerySampleEntry<
  Kind extends GameKind,
  K extends ScoreDataQueryKey<Kind>
> = {
  defaultValue: ScoreDataQuery<Kind>[K];
  label: string;
};
export type ScoreDataQuerySample<K extends GameKind> = {
  [key in ScoreDataQueryKey<K>]: ScoreDataQuerySampleEntry<K, key>;
};

export type CustomEntryView<E> = { [K in keyof E]?: (key: E[K]) => ReactNode };

const IconButton = styled(MuiIconButton)(() => ({
  backgroundColor: "#424242",
  "&:hover, &.Mui-focusVisible": { backgroundColor: "#808080" },
}));

export type ScoreBoardLegend<
  Kind extends GameKind,
  K extends ScoreDataKey<Kind>
> = Record<K, string>;

export type Props<
  Kind extends GameKind,
  K extends ScoreDataKey<Kind>,
  E extends ScoreData<Kind>
> = {
  title: GameKind;
  header: ScoreBoardLegend<Kind, K>;
  scoreEntries: Array<E>;
  rateName: string;
  getBestRate: (scoreEntries: Array<E>) => number;
  customEntryView?: CustomEntryView<E>;
  scoreDataQuerySample: ScoreDataQuerySample<Kind>;
};

type SortOrder = "asc" | "desc";

function descendingComparator<E, K extends keyof E>(
  lhs: E,
  rhs: E,
  orderBy: K
): number {
  if (lhs[orderBy] > rhs[orderBy]) {
    return -1;
  } else if (lhs[orderBy] < rhs[orderBy]) {
    return 1;
  } else {
    return 0;
  }
}

function createComparator<E, K extends keyof E>(
  order: SortOrder,
  orderBy: K
): (lhs: E, rhs: E) => number {
  return order === "desc"
    ? (lhs, rhs) => descendingComparator(lhs, rhs, orderBy)
    : (lhs, rhs) => -descendingComparator(lhs, rhs, orderBy);
}

const ROWS_PER_PAGES = [10, 30, 100];

export default function ScoreBoard<
  Kind extends GameKind,
  K extends ScoreDataKey<Kind>,
  E extends ScoreData<Kind>
>(props: Props<Kind, K, E>) {
  const dispatch = useDispatch();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGES[0]);

  const [order, setOrder] = useState<SortOrder>("asc");
  const [orderBy, setOrderBy] = useState<K>(
    (Object.keys(props.header) as K[])[0]
  );

  const [open, setOpen] = useState(false);

  const [scoreData, setScoreData] = useState<ScoreData<Kind>>(() => {
    const scoreData: any = {};
    for (const key of Object.keys(props.scoreDataQuerySample)) {
      scoreData[key] =
        props.scoreDataQuerySample[key as ScoreDataQueryKey<Kind>].defaultValue;
    }
    return scoreData as ScoreData<Kind>;
  });

  const createSortHandler = (key: K) => (_event: MouseEvent<unknown>) => {
    const isAsc = orderBy === key && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(key);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const applyCustomEntryView = useCallback(
    (key: K, value: E[K]): ReactNode => {
      if (props.customEntryView) {
        const customEntryView = props.customEntryView[key];
        if (customEntryView) {
          return customEntryView(value);
        }
      }
      return value;
    },
    [props.customEntryView]
  );

  const Header = (
    <>
      {Object.keys(props.header).map((key) => (
        <TableCell key={key}>
          <TableSortLabel
            active={orderBy === key}
            direction={orderBy === key ? order : "asc"}
            onClick={createSortHandler(key as K)}
          >
            {props.header[key as K]}
          </TableSortLabel>
        </TableCell>
      ))}
      <TableCell>削除</TableCell>
    </>
  );

  const handleOnClickRemoveEntry =
    (entry: E) => (_event: MouseEvent<HTMLButtonElement>) => {
      if (window.confirm("remove?")) {
        dispatch(asyncThunk[props.title].remove(entry));
      }
    };
  const Bodies = props.scoreEntries
    .sort(createComparator(order, orderBy))
    .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
    .map((body, index) => (
      <TableRow key={index}>
        {Object.keys(props.header).map((key) => (
          <TableCell key={key}>
            {applyCustomEntryView(key as K, body[key as K])}
          </TableCell>
        ))}
        <TableCell>
          <IconButton size="small" onClick={handleOnClickRemoveEntry(body)}>
            <Delete fontSize="inherit" />
          </IconButton>
        </TableCell>
      </TableRow>
    ));

  const handleChangeScoreData =
    (key: ScoreDataKey<Kind>) => (event: ChangeEvent<HTMLInputElement>) => {
      return setScoreData({ ...scoreData, [key]: event.target.value });
    };

  const DialogBodies = Object.keys(props.scoreDataQuerySample)
    .map((key) => ({
      key: key as ScoreDataKey<Kind>,
      ...props.scoreDataQuerySample[key as ScoreDataQueryKey<Kind>],
    }))
    .map(({ key, label }, index) => (
      <TextField
        sx={{ color: "white", p: 1 }}
        inputProps={{ style: { color: "white" } }}
        key={index}
        margin="dense"
        onChange={handleChangeScoreData(key)}
        value={scoreData[key]}
        label={label}
      />
    ));

  const rate = props.getBestRate(props.scoreEntries);

  const handleClose = () => {
    setOpen(false);
  };

  const handleInsertScoreData = () => {
    dispatch(asyncThunk[props.title].insert(scoreData));
    handleClose();
  };

  return (
    <>
      <Typography
        variant="h4"
        sx={{ p: 1 }}
      >{`${props.title.toUpperCase()} Score Board`}</Typography>
      <Divider />
      <Toolbar>
        <Typography variant="h5" sx={{ flex: "1 1 100%" }}>
          {props.rateName}: {rate}
        </Typography>
        <Tooltip title="楽曲の追加">
          <IconButton onClick={() => setOpen(true)}>
            <Add />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>{Header}</TableRow>
          </TableHead>
          <TableBody>{Bodies}</TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={ROWS_PER_PAGES}
        component="div"
        count={props.scoreEntries.length}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onPageChange={handleChangePage}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>{DialogBodies}</DialogContent>
        <DialogActions>
          <Button onClick={handleInsertScoreData}>決定</Button>
          <Button onClick={handleClose}>キャンセル</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
