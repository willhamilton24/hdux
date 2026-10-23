import { useEffect, useState } from "react";
import { HduxThemeProvider } from "../../../theme/ThemeProvider";
import { TopBar, BottomBar, BarLeft, BarRight, BarElement } from "../../../components/Bar";
import { Box } from "../../../components/Box";
import { Text } from "../../../components/Text";
import { Button } from "../../../components/Button";
import { StatBar } from "../../../components/StatBar";
import { ProGate } from "../../ProGate";
import type { GameLobbyProps, LobbyPlayer } from "./types";
import "./GameLobby.css";

const STATUS_COLORS: Record<LobbyPlayer["status"], string> = {
  ready: "#00e676",
  "not-ready": "#ff1744",
  loading: "#ff6f00",
};
const STATUS_LABELS: Record<LobbyPlayer["status"], string> = {
  ready: "READY",
  "not-ready": "WAITING",
  loading: "LOADING…",
};

const DEFAULT_PLAYERS: LobbyPlayer[] = [
  { id: 1, name: "ACE_PILOT",   status: "ready",     team: "A", stat: "2841 MMR", isLocalPlayer: true },
  { id: 2, name: "GHOST_0x7F",  status: "ready",     team: "A", stat: "2790 MMR" },
  { id: 3, name: "UNIT_NULL",   status: "not-ready", team: "A", stat: "2650 MMR" },
  { id: 4, name: "SHADOW_KIT",  status: "ready",     team: "B", stat: "2900 MMR" },
  { id: 5, name: "NEON_STRIKE", status: "loading",   team: "B", stat: "2755 MMR" },
  { id: 6, name: "VOID_ECHO",   status: "ready",     team: "B", stat: "2810 MMR" },
];

const DEFAULT_MATCH = {
  title: "MATCH LOBBY",
  mode: "RANKED — 3v3",
  map: "SECTOR DELTA-9",
  countdown: 0,
};

function PingBars({ ms }: { ms: number }) {
  const bars = 4;
  const filled =
    ms < 40 ? 4 : ms < 80 ? 3 : ms < 150 ? 2 : 1;
  const color =
    ms < 40 ? "#00e676" : ms < 80 ? "#00d4ff" : ms < 150 ? "#ff6f00" : "#ff1744";
  return (
    <span className="hdux-game-lobby__ping-bars" title={`${ms} ms`} aria-label={`${ms}ms ping`}>
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className="hdux-game-lobby__ping-bar"
          style={{
            background: i < filled ? color : undefined,
            height: `${5 + i * 3}px`,
          }}
        />
      ))}
    </span>
  );
}

function PlayerRow({ player, ping }: { player: LobbyPlayer; ping: number }) {
  const color = STATUS_COLORS[player.status];
  return (
    <div
      className={[
        "hdux-game-lobby__player",
        player.isLocalPlayer ? "hdux-game-lobby__player--local" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="hdux-game-lobby__player-status-dot" style={{ background: color }} />
      <span className="hdux-game-lobby__player-name" style={player.isLocalPlayer ? { color: "#fff" } : undefined}>
        {player.name}
        {player.isLocalPlayer && <span className="hdux-game-lobby__you"> [YOU]</span>}
      </span>
      {player.stat && (
        <span className="hdux-game-lobby__player-stat">{player.stat}</span>
      )}
      <PingBars ms={ping} />
      <span className="hdux-game-lobby__player-status-label" style={{ color }}>
        {STATUS_LABELS[player.status]}
      </span>
    </div>
  );
}

function usePings(playerIds: Array<string | number>) {
  const [pings, setPings] = useState<Record<string | number, number>>(() =>
    Object.fromEntries(playerIds.map((id) => [id, Math.floor(Math.random() * 60) + 20]))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setPings((prev) => {
        const next = { ...prev };
        for (const pid of playerIds) {
          const base = prev[pid] ?? 40;
          next[pid] = Math.max(8, Math.min(300, base + Math.round((Math.random() - 0.5) * 20)));
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [playerIds.join(",")]);

  return pings;
}

function GameLobbyInner({
  players = DEFAULT_PLAYERS,
  matchInfo = DEFAULT_MATCH,
  onReady,
  color = "#00d4ff",
  className,
  style,
}: GameLobbyProps) {
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [countdown, setCountdown] = useState(matchInfo.countdown ?? 0);
  const pings = usePings(players.map((p) => p.id));

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 150);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    setCountdown(matchInfo.countdown ?? 0);
  }, [matchInfo.countdown]);

  useEffect(() => {
    if (!countdown) return;
    const id = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const readyCount = players.filter((p) => p.status === "ready").length;
  const allReady = readyCount === players.length;
  const teamA = players.filter((p) => p.team === "A");
  const teamB = players.filter((p) => p.team === "B");
  const hasTeams = teamA.length > 0 && teamB.length > 0;

  const countdownUrgent = countdown > 0 && countdown <= 10;
  const countdownColor = allReady ? "#00e676" : countdownUrgent ? "#ff6f00" : color;

  function handleReadyToggle() {
    const next = !ready;
    setReady(next);
    onReady?.(next);
  }

  return (
    <HduxThemeProvider
      config={{
        defaultMode: "dark",
        master: {
          mainColor: color,
          textColor: "#e0e0e0",
          background: "#06080f",
          customColors: { success: "#00e676", failure: "#ff1744", caution: "#ff6f00" },
          typography: { mainFont: '"Quantico", system-ui, monospace' },
          borderWidth: "1px",
          boxCorners: { length: "14px", width: "2px" },
        },
      }}
    >
      <div
        className={["hdux-game-lobby", className].filter(Boolean).join(" ")}
        style={style}
      >
        <TopBar>
          <BarLeft>
            <BarElement>
              <Text variant="body">{matchInfo.mode ?? "LOBBY"}</Text>
            </BarElement>
          </BarLeft>
          <BarRight>
            {allReady && countdown === 0 && (
              <BarElement color="#00e676">
                <Text variant="body" color="#00e676">ALL READY</Text>
              </BarElement>
            )}
            <BarElement>
              <Text variant="body">{matchInfo.map ?? ""}</Text>
            </BarElement>
          </BarRight>
        </TopBar>

        <div className="hdux-game-lobby__body">
          {/* Match info */}
          <Box animation="horizontalFirst" hasLoaded={loaded} fullBorder>
            <div className="hdux-game-lobby__match-info">
              <Text variant="h3" animation="print">
                {countdown > 0 ? "MATCH STARTING" : (matchInfo.title ?? "MATCH LOBBY")}
              </Text>
              <div className="hdux-game-lobby__match-details">
                <Text variant="body">{matchInfo.mode}</Text>
                <Text variant="body">{matchInfo.map}</Text>
              </div>
              {countdown > 0 ? (
                <div
                  className={[
                    "hdux-game-lobby__countdown",
                    countdownUrgent ? "hdux-game-lobby__countdown--urgent" : "",
                  ].filter(Boolean).join(" ")}
                  style={{ color: countdownColor }}
                >
                  {String(Math.floor(countdown / 60)).padStart(2, "0")}:
                  {String(countdown % 60).padStart(2, "0")}
                </div>
              ) : allReady ? (
                <div className="hdux-game-lobby__all-ready" style={{ color: "#00e676" }}>
                  ALL PLAYERS READY
                </div>
              ) : null}
            </div>
          </Box>

          {/* Player list */}
          <Box animation="standard" hasLoaded={loaded} fullBorder>
            <div className="hdux-game-lobby__player-list">
              {hasTeams ? (
                <>
                  <div className="hdux-game-lobby__team">
                    <Text variant="subheading">TEAM ALPHA</Text>
                    {teamA.map((p) => <PlayerRow key={p.id} player={p} ping={pings[p.id] ?? 40} />)}
                  </div>
                  <div className="hdux-game-lobby__team-divider" style={{ borderColor: color }} />
                  <div className="hdux-game-lobby__team">
                    <Text variant="subheading">TEAM BRAVO</Text>
                    {teamB.map((p) => <PlayerRow key={p.id} player={p} ping={pings[p.id] ?? 40} />)}
                  </div>
                </>
              ) : (
                players.map((p) => <PlayerRow key={p.id} player={p} ping={pings[p.id] ?? 40} />)
              )}
            </div>
          </Box>

          {/* Ready progress + button */}
          <Box animation="verticalFirst" hasLoaded={loaded} fullBorder>
            <div className="hdux-game-lobby__ready-panel">
              <StatBar
                label="PLAYERS READY"
                value={readyCount}
                max={players.length}
                color={allReady ? "#00e676" : color}
                showValue
                height={8}
              />
              <Button
                onClick={handleReadyToggle}
                color={ready ? "#00e676" : undefined}
              >
                {ready ? "READY ✓" : "MARK READY"}
              </Button>
            </div>
          </Box>
        </div>

        <BottomBar static>
          <BarLeft>
            <BarElement>
              <Text variant="body">HDUX PRO</Text>
            </BarElement>
          </BarLeft>
          <BarRight>
            <BarElement>
              <Text variant="body" color={allReady ? "#00e676" : undefined}>
                {readyCount}/{players.length} READY
              </Text>
            </BarElement>
          </BarRight>
        </BottomBar>
      </div>
    </HduxThemeProvider>
  );
}

export function GameLobby(props: GameLobbyProps) {
  return (
    <ProGate componentName="GameLobby">
      <GameLobbyInner {...props} />
    </ProGate>
  );
}
