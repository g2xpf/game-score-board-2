import { useEffect, useState, useRef, ReactNode } from "react";
import { useHistory } from "react-router-dom"; // pagination
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import {
  AppBar,
  Drawer as MuiDrawer,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Theme,
  ListItemButton,
} from "@mui/material";
import { Menu, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { CSSObject } from "@emotion/react";

const drawerWidth = 180;

const openedMixin = (theme: Theme): CSSObject => ({
  width: `${drawerWidth}px`,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  width: `calc(${theme.spacing(7)} + 1px)`,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
});

const RootDiv = styled("div")({
  display: "flex",
  height: "100%",
});

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (_prop) => true,
})<{ open: boolean }>(({ open, theme }) => {
  const defaultStyle = {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  };
  const shiftStyle = {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  };
  return {
    ...defaultStyle,
    ...(open && shiftStyle),
  };
});

const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (_prop) => true,
})<{ open: boolean }>(({ open }) => {
  const hideClass = { display: "none" };
  return {
    ...(open && hideClass),
    marginRight: 36,
  };
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ open, theme }) => {
  return {
    flexShrink: 0,
    boxSizing: "border-box",
    whiteSpace: "nowrap",
    ...(open
      ? {
          ...openedMixin(theme),
          "& .MuiDrawer-paper": openedMixin(theme),
        }
      : {
          ...closedMixin(theme),
          "& .MuiDrawer-paper": closedMixin(theme),
        }),
  };
});

const ToolbarDiv = styled("div", {
  shouldForwardProp: () => true,
})(({ theme }) => {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 0),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  };
});

const FlexDiv = styled("div")(() => ({
  display: "flex",
  justifyContent: "center",
}));

const StyledList = styled(List)(({ theme }) => ({
  paddingTop: theme.spacing(0),
}));

const MainContent = styled("main")(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(0),
}));

export type Mode = {
  name: string;
  routerPath: string;
  icon: () => ReactNode;
};

type Props = {
  modes: Array<Mode>;
  title: string;
  children?: ReactNode;
};

export default function ApplicationBar(props: Props) {
  const theme = useTheme();
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const [modeIndex, setModeIndex] = useState(0);

  const toolbar = useRef<HTMLDivElement | null>(null);
  const [childrenHeight, setChildrenHeight] = useState("100%");

  useEffect(() => {
    if (toolbar.current) {
      // 1px: Divider height
      setChildrenHeight(`calc(100% - 1px - ${toolbar.current.clientHeight}px)`);
    }
  }, [toolbar]);

  const handleChangeMode = (newModeIndex: number, routerPath: string) => {
    if (routerPath !== history.location.pathname) {
      setModeIndex(newModeIndex);
      history.push(routerPath);
    }
  };

  return (
    <RootDiv>
      <StyledAppBar position="fixed" open={open}>
        <Toolbar>
          <StyledIconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(true)}
            edge="start"
            open={open}
          >
            <Menu />
          </StyledIconButton>
          <Typography variant="h6" noWrap component="div">
            {props.title}
          </Typography>
        </Toolbar>
      </StyledAppBar>
      <Drawer variant="permanent" open={open}>
        <ToolbarDiv>
          <IconButton onClick={() => setOpen(false)}>
            {theme.direction === "rtl" ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </ToolbarDiv>
        <Divider />
        <StyledList>
          {props.modes.map((mode, index) => (
            <ListItemButton
              onClick={() => handleChangeMode(index, mode.routerPath)}
              key={mode.name}
              selected={index === modeIndex}
              sx={{ padding: 1 }}
            >
              <FlexDiv>
                <ListItemIcon>{mode.icon()}</ListItemIcon>
                <ListItemText
                  sx={{ display: "flex", alignItems: "center" }}
                  primary={mode.name}
                />
              </FlexDiv>
            </ListItemButton>
          ))}
        </StyledList>
      </Drawer>

      <MainContent>
        <ToolbarDiv ref={toolbar} />
        <Divider />
        <div style={{ height: childrenHeight }}>{props.children}</div>
      </MainContent>
    </RootDiv>
  );
}
