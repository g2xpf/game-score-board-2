import "./App.css";
import { ReactNode, useEffect } from "react";
import { Avatar, CssBaseline } from "@mui/material";
import AppBar, { Mode } from "./components/AppBar";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@emotion/react";
import { HashRouter, Switch, Route, Redirect } from "react-router-dom";
import Arcaea from "./components/ArcaeaScoreBoard";
import Chunithm from "./components/ChunithmScoreBoard";
import ArcaeaLogo from "./assets/arcaea-logo.png";
import ChunithmLogo from "./assets/chunithm-logo.png";
import { useDispatch } from "react-redux";
import { asyncThunk } from "./reducers";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

type RouterNode = Mode & {
  component: () => ReactNode;
};

function App() {
  const dispatch = useDispatch();
  const modes: RouterNode[] = [
    {
      name: "Arcaea",
      routerPath: "/arcaea",
      icon: () => <Avatar src={ArcaeaLogo} alt="" />,
      component: () => <Arcaea />,
    },
    {
      name: "Chunithm",
      routerPath: "/chunithm",
      icon: () => <Avatar src={ChunithmLogo} alt="" />,
      component: () => <Chunithm />,
    },
  ];

  useEffect(() => {
    dispatch(asyncThunk.arcaea.initialize());
    dispatch(asyncThunk.chunithm.initialize());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <AppBar title="Game Score Board" modes={modes}>
          <Switch>
            <Route
              exact
              path="/"
              render={() => <Redirect to={modes[0].routerPath} />}
            />
            {modes.map((mode) => (
              <Route key={mode.name} path={mode.routerPath}>
                {mode.component}
              </Route>
            ))}
          </Switch>
        </AppBar>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
