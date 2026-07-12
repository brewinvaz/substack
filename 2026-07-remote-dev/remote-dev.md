# My Development Machine Is Wherever I Am

My whole development environment — the entire stack, up and running — lives on a machine I own, and I reach it the same way from my desk or my phone. It's not a session that syncs across devices; it's one environment I connect into from wherever I am. Here's how it's set up.

## The foundation: Tailscale + Mosh + a VPS

My real dev environment lives on a **VPS**, not my laptop. That single decision means my machine has no "state" worth protecting — it's a thin client. The heavy lifting happens on a server that never sleeps.

**Tailscale** wires everything together into a private mesh network. My phone, my laptop, and the VPS all sit on the same tailnet as if they were in the same room — no exposed ports, no VPN gymnastics. It just works.

**Mosh** is what I reach for on the laptop when I'm traveling. Unlike SSH, it survives network changes and latency without dropping — I can close the lid, walk outside, reconnect on cellular, and my session is exactly where I left it. No "broken pipe," no reconnect ritual.

## The workspace: tmux + Claude Code with remote control

Every instance runs inside **tmux**, so my sessions are persistent and detachable. But the real unlock is running **Claude Code inside tmux with remote control enabled** on all my instances.

This is what makes it seamless: I can be reviewing a diff on my laptop at my desk, then pick up my phone on the couch — via the Claude Code app — and drop straight back into the *same live Claude Code session*. The work doesn't pause, doesn't fork, doesn't require me to "sync." My phone and my laptop are just two windows into one continuous workspace.

That fluidity changes your relationship with downtime. A five-minute wait becomes a chance to nudge a build forward from my pocket.

## The hard part: HTTPS over the tailnet, on every boot

Here's where a clean demo meets reality. Reaching my apps over the tailnet meant hitting a plain `http://100.x.x.x` address — and a surprising amount of the modern web quietly *requires HTTPS*. A secure context is the price of admission for a whole class of browser features (progressive web apps are a good example — service workers and Web Push simply refuse to run without it, so those apps were non-functional over a raw tailnet IP). I wanted every service to speak HTTPS, everywhere, with no exceptions to reason about.

The second wrinkle: a Tailscale IP isn't guaranteed to be stable across reboots, but my Docker port bindings referenced it directly.

The fix is a small boot-time script fronted by a systemd service. On every boot it reads the **current** Tailscale IP and regenerates my `docker-compose.override.yml` to rebind the database and Redis to it — so an IP change never means hand-editing config — then binds the browser-facing apps to loopback and fronts them with TLS via **`tailscale serve`**, terminating HTTPS on the node's stable **MagicDNS** name:

```bash
# Map each HTTPS port on the tailnet to the loopback-published app.
# Keyed off the stable MagicDNS name, so this survives IP changes.
declare -A SERVE=(
  [3100]=3100  # frontend
  [3102]=3102  # care-portal
  [8100]=8100  # backend API
  # ...
)
tailscale serve reset
for https_port in "${!SERVE[@]}"; do
  target_port="${SERVE[$https_port]}"
  tailscale serve --bg --https="$https_port" "http://127.0.0.1:$target_port"
done
```

MagicDNS is the quiet hero here: it's a *stable* hostname (e.g. `cc-dev.taila12617.ts.net`) that survives IP churn and gives every service a real TLS certificate. The result is that the whole environment — encrypted database access included — reassembles itself correctly on every boot, with zero manual steps, and everything is served over HTTPS exactly as it would be in production.

## The visual layer: Claude Code artifact URLs

The one thing terminals are bad at is *seeing* things. That's where **Claude Code's artifact URLs** earn their place. When I'm reviewing UI mocks, technical architecture diagrams, or anything that needs to be looked at rather than read, Claude generates a shareable artifact link. I open it in a browser — on either device — and suddenly I'm reviewing rendered designs and system diagrams visually, not squinting at ASCII.

It closes the last gap in a terminal-first workflow: the ability to review visual and architectural work as easily as I review code.

## Why not just use the Claude Code app?

Actually, I do — it's how I connect from my phone. Claude Code's remote-control mode lets the app attach directly to a session *already running on my box*, so I get a polished, native mobile interface onto the exact Claude Code instance living next to my stack — no terminal in between. When I've got my laptop on the road instead, I reach the same session the barer way: a tmux attach over Mosh, which shrugs off flaky hotel Wi-Fi without dropping. (A plain SSH client like Termius works too.)

So the distinction isn't app-versus-terminal — it's *where the session runs*. The app can also spin up a managed cloud sandbox and run the agent there, and that's a genuinely different thing: convenient, zero-setup, but not my environment. What makes this setup mine is that the session — however I connect to it — lives on a box I own, one pane away from a live Postgres, a live Redis, and every app in my stack, served over HTTPS on my own hostname. The client is interchangeable; the environment is the point.

## Why it matters

Individually, none of these tools are exotic. Together they dissolve the boundary between "at my desk" and "away from it." My development environment isn't a place anymore. It follows me from device to device, from desk to couch to coffee shop, without ever losing its thread.

If your work still lives on one machine, it might be worth asking: what would change if it lived everywhere you did?
