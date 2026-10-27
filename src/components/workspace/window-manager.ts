import type { AppName } from "./workspace-data";

export type WindowEntry = { id: AppName; minimized: boolean };
export type DesktopState = { windows: WindowEntry[]; active: AppName };
export const initialDesktopState: DesktopState = {
  windows: [{ id: "projects", minimized: false }],
  active: "projects",
};
export type WindowAction =
  | { type: "open" | "focus" | "minimize" | "close"; id: AppName }
  | { type: "hydrate"; state: DesktopState }
  | { type: "reset" }
  | { type: "show-desktop" };

export function windowReducer(
  state: DesktopState,
  action: WindowAction,
): DesktopState {
  if (action.type === "hydrate") return action.state;
  if (action.type === "reset") return initialDesktopState;
  if (action.type === "show-desktop")
    return {
      ...state,
      windows: state.windows.map((w) => ({ ...w, minimized: true })),
    };
  if (
    action.type === "focus" &&
    (state.active === action.id ||
      !state.windows.some((w) => w.id === action.id && !w.minimized))
  )
    return state;
  if (action.type === "open" || action.type === "focus")
    return {
      active: action.id,
      windows: [
        ...state.windows.filter((w) => w.id !== action.id),
        { id: action.id, minimized: false },
      ],
    };
  const windows =
    action.type === "close"
      ? state.windows.filter((w) => w.id !== action.id)
      : state.windows.map((w) =>
          w.id === action.id ? { ...w, minimized: true } : w,
        );
  return {
    windows,
    active:
      state.active === action.id
        ? (windows.findLast((w) => !w.minimized)?.id ?? "projects")
        : state.active,
  };
}
