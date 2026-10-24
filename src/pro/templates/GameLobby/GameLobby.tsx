import { useEffect, useState } from "react";
import { HduxThemeProvider } from "../../../theme/ThemeProvider";
import { TopBar, BottomBar, BarLeft, BarCenter, BarRight, BarElement } from "../../../components/Bar";
import { Box } from "../../../components/Box";
import { Text } from "../../../components/Text";
import { Button } from "../../../components/Button";
import { StatBar } from "../../../components/StatBar";
import { ProGate } from "../../ProGate";
import type { GameLobbyProps, LobbyPlayer } from "./types";
import "../templates.css";
import "./GameLobby.css";
import "../responsive.css";

const STATUS_COLORS: Record<LobbyPlayer["status"], string> = {
  ready:     "var(--hdux-demo-green, #00e676)",
  "not-ready": "var(--hdux-demo-red, #ff1744)",
  loading:   "var(--hdux-demo-orange, #ff6f00)",
};
const STATUS_LABELS: Record<LobbyPlayer["status"], string> = {
  ready:     "READY",
  "not-ready": "WAITING",
  loading:   "LOADING…",
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
    ms < 40 ? "var(--hdux-demo-green, #00e676)" : ms < 80 ? "var(--hdux-demo-cyan, #00d4ff)" : ms < 150 ? "var(--hdux-demo-orange, #ff6f00)" : "var(--hdux-demo-red, #ff1744)";
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

function usePings(playerIds: Array<string | number>) {
  const [pings, setPings] = useState<Record<string | number, number>>(() =>
    Object.fromEntries(playerIds.map((id) => [id, 40]))
  );

  useEffect(() => {
    if (playerIds.length === 0) return;
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

function pingColor(ms: number) {
  if (ms < 50) return "var(--hdux-demo-green, #00e676)";
  if (ms < 100) return "var(--hdux-demo-orange, #ff6f00)";
  return "var(--hdux-demo-red, #ff1744)";
}

function PlayerRow({ player }: { player: LobbyPlayer }) {
  const color = STATUS_COLORS[player.status];
  const ping = player.pingMs;
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
      <span
        className="hdux-game-lobby__player-name"
        style={player.isLocalPlayer ? { color: "#fff" } : undefined}
      >
        {player.name}
        {player.isLocalPlayer && <span className="hdux-game-lobby__you"> [YOU]</span>}
      </span>
      {player.stat && (
        <span className="hdux-game-lobby__player-stat">{player.stat}</span>
      )}
      {ping !== undefined && (
        <span className="hdux-game-lobby__player-ping" style={{ color: pingColor(ping) }}>
          <PingBars ms={ping} /> {ping}ms
        </span>
      )}
      <span className="hdux-game-lobby__player-status-label" style={{ color }}>
        {STATUS_LABELS[player.status]}
      </span>
    </div>
  );
}

function TeamSection({ label, players }: { label: string; players: LobbyPlayer[] }) {
  const ratings = players.flatMap((p) => p.mmr !== undefined && Number.isFinite(p.mmr) ? [p.mmr] : []);
  const avgMmr = ratings.length ? Math.round(ratings.reduce((sum, mmr) => sum + mmr, 0) / ratings.length) : null;
  return (
    <div className="hdux-game-lobby__team">
      <div className="hdux-game-lobby__team-header">
        <Text variant="subheading">{label}</Text>
        {avgMmr !== null && (
          <span className="hdux-game-lobby__team-avg">AVG {avgMmr} MMR</span>
        )}
      </div>
      {players.map((p) => <PlayerRow key={p.id} player={p} />)}
    </div>
  );
}

function GameLobbyInner({
  players = DEFAULT_PLAYERS,
  matchInfo = DEFAULT_MATCH,
  onReady,
  color = "var(--hdux-demo-cyan, #00d4ff)",
  className,
  style,
}: GameLobbyProps) {
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [countdown, setCountdown] = useState(matchInfo.countdown ?? 0);
  const pings = usePings(players === DEFAULT_PLAYERS ? players.map((p) => p.id) : []);
  const displayPlayers = players === DEFAULT_PLAYERS
    ? players.map((p) => ({ ...p, pingMs: pings[p.id] ?? 40 })) : players;

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

  const readyCount  = players.filter((p) => p.status === "ready").length;
  const teamA       = displayPlayers.filter((p) => p.team === "A");
  const teamB       = displayPlayers.filter((p) => p.team === "B");
  const hasTeams    = teamA.length > 0 && teamB.length > 0;
  const allReady    = players.length > 0 && readyCount === players.length;

  const countdownUrgent = countdown > 0 && countdown <= 10;
  const countdownColor = allReady ? "var(--hdux-demo-green, #00e676)" : countdownUrgent ? "var(--hdux-demo-orange, #ff6f00)" : color;

  function handleReadyToggle() {
    const next = !ready;
    setReady(next);
    onReady?.(next);
  }

  const countdownStr = countdown > 0
    ? `${String(Math.floor(countdown / 60)).padStart(2, "0")}:${String(countdown % 60).padStart(2, "0")}`
    : null;

  return (
    <HduxThemeProvider
      config={{
        defaultMode: "dark",
        master: {
          mainColor: color,
          textColor: "#e0e0e0",
          background: "#06080f",
          customColors: { success: "var(--hdux-demo-green, #00e676)", failure: "var(--hdux-demo-red, #ff1744)", caution: "var(--hdux-demo-orange, #ff6f00)" },
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
        <TopBar static>
          <BarLeft>
            <BarElement>
              <Text variant="body">{matchInfo.mode ?? "LOBBY"}</Text>
            </BarElement>
          </BarLeft>
          <BarCenter>
            {countdownStr && (
              <BarElement borderless>
                <span className="hdux-game-lobby__topbar-countdown" style={{ color }}>
                  {countdownStr}
                </span>
              </BarElement>
            )}
          </BarCenter>
          <BarRight>
            {allReady && countdown === 0 && (
              <BarElement color="var(--hdux-demo-green, #00e676)">
                <Text variant="body" color="var(--hdux-demo-green, #00e676)">ALL READY</Text>
              </BarElement>
            )}
            <BarElement>
              <Text variant="body">{matchInfo.map ?? ""}</Text>
            </BarElement>
          </BarRight>
        </TopBar>

        <div className="hdux-game-lobby__body">
          {/* Match info banner */}
          <Box animation="horizontalFirst" hasLoaded={loaded} fullBorder>
            <div className="hdux-game-lobby__match-info">
              <div className="hdux-game-lobby__match-title-row">
                <Text variant="h3" animation="print">{countdown > 0 ? "MATCH STARTING" : (matchInfo.title ?? "MATCH LOBBY")}</Text>
                {allReady && (
                  <span className="hdux-game-lobby__all-ready-badge" style={{ color: "var(--hdux-demo-green, #00e676)" }}>
                    ALL READY
                  </span>
                )}
              </div>
              <div className="hdux-game-lobby__match-details">
                <span className="hdux-game-lobby__match-chip" style={{ borderColor: color }}>
                  {matchInfo.mode}
                </span>
                <span className="hdux-game-lobby__match-chip" style={{ borderColor: color }}>
                  ◈ {matchInfo.map}
                </span>
              </div>
              {countdown > 0 ? (
                <div className={["hdux-game-lobby__countdown", countdownUrgent ? "hdux-game-lobby__countdown--urgent" : ""].filter(Boolean).join(" ")} style={{ color: countdownColor }}>
                  {countdownStr}
                  <span className="hdux-game-lobby__countdown-label">UNTIL MATCH</span>
                </div>
              ) : allReady ? (
                <div className="hdux-game-lobby__all-ready" style={{ color: "var(--hdux-demo-green, #00e676)" }}>
                  ALL PLAYERS READY
                </div>
              ) : null}
            </div>
          </Box>

          {/* Player list */}
          <Box animation="standard" hasLoaded={loaded} fullBorder>
            <div className="hdux-game-lobby__player-list">
              {players.length === 0 && <Text variant="body">Waiting for players</Text>}
              {hasTeams ? (
                <>
                  <TeamSection label="TEAM ALPHA" players={teamA} />
                  <div className="hdux-game-lobby__team-divider" style={{ borderColor: color }} />
                  <TeamSection label="TEAM BRAVO" players={teamB} />
                </>
              ) : (
                displayPlayers.map((p) => <PlayerRow key={p.id} player={p} />)
              )}
            </div>
          </Box>

          {/* Ready panel */}
          <Box animation="verticalFirst" hasLoaded={loaded} fullBorder>
            <div className="hdux-game-lobby__ready-panel">
              <StatBar
                label="PLAYERS READY"
                value={readyCount}
                max={Math.max(1, players.length)}
                color={allReady ? "var(--hdux-demo-green, #00e676)" : color}
                showValue
                height={8}
              />
              <div className="hdux-game-lobby__ready-row">
                <Button
                  disabled={players.length === 0}
                  onClick={handleReadyToggle}
                  color={ready ? "var(--hdux-demo-green, #00e676)" : undefined}
                >
                  {ready ? "READY ✓" : "MARK READY"}
                </Button>
                <span className="hdux-game-lobby__ready-count" style={{ color: allReady ? "var(--hdux-demo-green, #00e676)" : color }}>
                  {readyCount}/{players.length} READY
                </span>
              </div>
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
              <span
                className="hdux-game-lobby__status"
                style={{ color: allReady ? "var(--hdux-demo-green, #00e676)" : color }}
              >
                {allReady ? "● MATCH READY" : `● WAITING ${players.length - readyCount}`}
              </span>
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
