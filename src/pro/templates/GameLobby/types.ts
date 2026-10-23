import type { CSSProperties } from "react";

export interface LobbyPlayer {
  id: string | number;
  name: string;
  /** "ready" | "not-ready" | "loading" */
  status: "ready" | "not-ready" | "loading";
  /** Optional team (A or B) */
  team?: "A" | "B";
  /** Optional stat shown next to the name */
  stat?: string;
  /** Measured network latency in milliseconds. */
  pingMs?: number;
  /** Numeric matchmaking rating, independent of the display stat. */
  mmr?: number;
  /** Whether this is the local/current player */
  isLocalPlayer?: boolean;
}

export interface LobbyMatchInfo {
  title?: string;
  mode?: string;
  map?: string;
  countdown?: number; // seconds until match starts, shown as live timer when > 0
}

export interface GameLobbyProps {
  players?: LobbyPlayer[];
  matchInfo?: LobbyMatchInfo;
  onReady?: (ready: boolean) => void;
  /** Override accent color */
  color?: string;
  className?: string;
  style?: CSSProperties;
}
