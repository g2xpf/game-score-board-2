import { session, app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as isDev from "electron-is-dev";
import * as os from "os";
import * as fs from "fs";
import { Extension } from "electron/main";
import * as Dotenv from "dotenv";
import { Pool, QueryFunction, createPool } from "mysql";
import { promisify } from "util";
import * as assert from "assert";
import type {
  Arcaea,
  Chunithm,
  GameKind,
  ScoreData,
  PrimaryKey,
  ScoreDataValue,
  ScoreDataKey,
  ScoreDataQuery,
  ScoreDataQueryKey,
  ScoreDataQueryValue,
} from "../src/@types/common";

const CHUNITHM = "chunithm";
const ARCAEA = "arcaea";

export type DBSetting = {
  dbUser: string;
  dbPassword: string;
};

interface PromisifiedPool extends Omit<Pool, "query"> {
  query: QueryFunction | Function;
}

class ScoreDataDB<K extends GameKind> {
  private pool: PromisifiedPool;

  constructor(
    dbName: K,
    private primaryKeys: Array<keyof PrimaryKey<K>>,
    private scoreDataSample: ScoreData<K>,
    private scoreDataQuerySample: ScoreDataQuery<K>
  ) {
    Dotenv.config({ path: path.join(__dirname, "../../.env") });
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const pool: PromisifiedPool = createPool({
      host: "127.0.0.1",
      user: `${dbUser}`,
      password: `${dbPassword}`,
      timezone: "utc",
      database: dbName,
      timeout: 20000,
    });
    pool.query = promisify(pool.query);
    this.pool = pool;
  }

  private extract(
    entry: ScoreDataQuery<K>
  ): [ScoreDataQueryKey<K>[], ScoreDataQueryValue<K>[]] {
    let keys: ScoreDataQueryKey<K>[] = [];
    let values: ScoreDataQueryValue<K>[] = [];
    for (let key of Object.keys(this.scoreDataQuerySample)) {
      keys.push(key as ScoreDataQueryKey<K>);
      values.push(entry[key as ScoreDataQueryKey<K>]);
    }
    return [keys, values];
  }

  private extractPrimaryKeyValues(
    entry: PrimaryKey<K>
  ): PrimaryKey<K>[keyof PrimaryKey<K>][] {
    return this.primaryKeys.map((key) => entry[key]);
  }

  private cast(sampleValue: ScoreDataValue<K>, value: any): ScoreDataValue<K> {
    switch (typeof sampleValue) {
      case "number":
        return Number(value) as unknown as ScoreDataValue<K>;
      case "string":
        return String(value) as unknown as ScoreDataValue<K>;
      case "boolean":
        return (value === 0 ? false : true) as unknown as ScoreDataValue<K>;
      case "object":
        if (sampleValue instanceof Date) {
          return new Date(value as string) as unknown as ScoreDataValue<K>;
        }
        break;
      default:
        break;
    }
    throw new Error(`failed to parse value \`${value}\``);
  }

  castToScoreData(rawScore: any): ScoreData<K> {
    const ret: any = {};
    for (let key in rawScore) {
      assert(key in this.scoreDataSample);
      ret[key as ScoreDataKey<K>] = this.cast(
        this.scoreDataSample[key as keyof ScoreData<K>],
        rawScore[key]
      );
    }
    return ret as ScoreData<K>;
  }

  async getAll(): Promise<ScoreData<K>[]> {
    const rawScores = await this.pool.query("SELECT * FROM score");
    assert(rawScores instanceof Array);

    const scores: ScoreData<K>[] = rawScores.map((rawScore) =>
      this.castToScoreData(rawScore)
    );
    return scores;
  }

  async register(entry: ScoreDataQuery<K>): Promise<ScoreData<K>> {
    const [keys, values] = this.extract(entry);
    const selectQuery = this.primaryKeys
      .map((key) => `${key} = ?`)
      .join(" AND ");
    const selectValues = this.extractPrimaryKeyValues(entry);
    const fieldsQuery = keys.join(",");
    const questionQuery = Array(values.length).fill("?").join(",");

    await this.pool.query(
      `INSERT INTO score (${fieldsQuery}) VALUES (${questionQuery})`,
      values
    );
    const entries = await this.pool.query(
      `SELECT * FROM score WHERE ${selectQuery}`,
      selectValues
    );
    assert(entries.length === 1);
    return this.castToScoreData(entries[0]);
  }

  async delete(data: ScoreDataQuery<K>): Promise<ScoreData<K>> {
    const valueQuery = this.primaryKeys
      .map((key) => {
        return `${key} = ?`;
      })
      .join(" AND ");
    const values: PrimaryKey<K>[keyof PrimaryKey<K>][] = this.primaryKeys.map(
      (key) => data[key as keyof PrimaryKey<K>]
    );
    const entries = await this.pool.query(
      `SELECT * FROM score WHERE ${valueQuery}`,
      values
    );
    assert(entries.length === 1);
    const entry = this.castToScoreData(entries[0]);
    await this.pool.query(`DELETE FROM score WHERE ${valueQuery}`, values);
    return entry;
  }

  async edit(value: ScoreDataQuery<K>): Promise<ScoreData<K>> {
    const [keys, values] = this.extract(value);
    const primaryKeyValues = this.extractPrimaryKeyValues(value);
    const query = keys.map((key) => `${key} = ?`).join(" AND ");
    const primaryKeyQuery = this.primaryKeys
      .map((key) => `${key} = ?`)
      .join(",");
    await this.pool.query(
      `UPDATE score SET ${query} AND updated_at = current_timestamp() WHERE ${primaryKeyQuery}`,
      [...values, ...primaryKeyValues]
    );
    const entries = await this.pool.query(
      `SELECT * FROM score WHERE ${query}`,
      primaryKeyValues
    );
    assert(entries.length === 1);
    return this.castToScoreData(entries[0]);
  }
}

const db = {
  arcaea: new ScoreDataDB(
    "arcaea",
    ["name", "difficulty"],
    {
      name: "",
      difficulty: 0,
      score: 0,
      constant: 0,
      updated_at: "",
    },
    {
      name: "",
      difficulty: 0,
      score: 0,
      constant: 0,
    }
  ),
  chunithm: new ScoreDataDB(
    "chunithm",
    ["name", "difficulty"],
    {
      name: "",
      difficulty: 0,
      score: 0,
      constant: 0,
      updated_at: "",
    },
    {
      name: "",
      difficulty: 0,
      score: 0,
      constant: 0,
    }
  ),
};

const EXTENSIONS_PATH: string | undefined = (() => {
  let chromePath = os.homedir();
  switch (os.platform()) {
    case "win32":
      chromePath = path.join(
        chromePath,
        "AppData",
        "Local",
        "Google",
        "Chrome",
        "User Data"
      );
      break;
    case "darwin":
      chromePath = path.join(
        chromePath,
        "Library",
        "Application Support",
        "Google",
        "Chrome"
      );
      break;
    case "linux":
      chromePath = path.join(chromePath, ".config", "google-chrome");
      break;
    default:
      return;
  }
  return path.join(chromePath, "Default", "Extensions");
})();

type ExtensionEntry = {
  name: string;
  path: string | undefined;
};

const REDUX_DEVTOOLS: ExtensionEntry = {
  path:
    EXTENSIONS_PATH &&
    path.join(EXTENSIONS_PATH, "lmhkpmbekcpmknklioeibfkpmmfibljd"),
  name: "redux devtools",
};
const REACT_DEVELOPER_TOOLS: ExtensionEntry = {
  path:
    EXTENSIONS_PATH &&
    path.join(EXTENSIONS_PATH, "fmkadmapgofadopljbjfkapdkoienihi"),
  name: "react developer tools",
};

let win: BrowserWindow | null = null;

async function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.setMenuBarVisibility(false);

  if (isDev) {
    win.loadURL("http://localhost:3000/index.html");
  } else {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  }

  win.on("closed", () => (win = null));

  // Hot Reloading
  if (isDev) {
    const electronPath = path.join(
      __dirname,
      "..",
      "..",
      "node_modules",
      "electron",
      "dist",
      "electron"
    );
    require("electron-reload")(__dirname, {
      electron: electronPath,
      forceHardReset: true,
      hardResetMethod: "exit",
    });
  }

  // DevTools
  if (isDev) {
    try {
      await Promise.all(
        [REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]
          .filter((entry) => typeof entry.path !== "undefined")
          .map(async (entry) => {
            const versionDirectories = fs
              .readdirSync(entry.path!!, { withFileTypes: true })
              .filter((dirent) => dirent.isDirectory())
              .map((dirent) => dirent.name);
            let extensionPath;
            if (versionDirectories.length === 0) {
              console.error(
                `No available versions found for \`${entry.name}\``
              );
              return;
            } else {
              extensionPath = path.join(entry.path!!, versionDirectories[0]);
            }
            return session.defaultSession.loadExtension(extensionPath, {
              allowFileAccess: true,
            });
          })
          .filter(
            async (ext: Promise<Extension | undefined>) =>
              typeof (await ext) !== "undefined"
          )
      );
    } catch (err) {
      console.error({ err });
    }

    win.webContents.openDevTools();
  }
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.handle(`fetch-${CHUNITHM}-score-data`, (_event) =>
  db[CHUNITHM].getAll()
);

ipcMain.handle(
  `insert-${CHUNITHM}-score-data`,
  (_event, data: Chunithm.ScoreData) => db[CHUNITHM].register(data)
);

ipcMain.handle(
  `update-${CHUNITHM}-score-data`,
  (_event, data: Chunithm.ScoreData) => db[CHUNITHM].edit(data)
);

ipcMain.handle(
  `remove-${CHUNITHM}-score-data`,
  (_event, data: Chunithm.ScoreData) => db[CHUNITHM].delete(data)
);

ipcMain.handle(`fetch-${ARCAEA}-score-data`, (_event) => db[ARCAEA].getAll());

ipcMain.handle(
  `insert-${ARCAEA}-score-data`,
  (_event, data: Arcaea.ScoreData) => db[ARCAEA].register(data)
);

ipcMain.handle(
  `update-${ARCAEA}-score-data`,
  (_event, data: Arcaea.ScoreData) => db[ARCAEA].edit(data)
);

ipcMain.handle(
  `remove-${ARCAEA}-score-data`,
  (_event, data: Arcaea.ScoreData) => db[ARCAEA].delete(data)
);
