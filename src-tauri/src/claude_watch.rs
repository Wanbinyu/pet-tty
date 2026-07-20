//! Poll ~/.claude/sessions/*.json for live Claude Code processes.
//! Emits `claude-presence` to the UI so connection state is clear even
//! when tool hooks are quiet.

use serde::Serialize;
use serde_json::Value;
use std::fs;
use std::path::PathBuf;
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeSessionInfo {
    pub session_id: String,
    pub pid: u32,
    pub alive: bool,
    pub status: String,
    pub cwd: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudePresence {
    /// Any live Claude process from sessions dir
    pub connected: bool,
    pub sessions: Vec<ClaudeSessionInfo>,
    /// true when we transitioned connected→disconnected this tick
    pub just_disconnected: bool,
    /// true when we transitioned disconnected→connected this tick
    pub just_connected: bool,
    pub live_count: usize,
}

fn sessions_dir() -> Option<PathBuf> {
    let home = dirs_next_home()?;
    Some(home.join(".claude").join("sessions"))
}

fn dirs_next_home() -> Option<PathBuf> {
    // Avoid new dep: use env
    if let Ok(h) = std::env::var("USERPROFILE") {
        return Some(PathBuf::from(h));
    }
    if let Ok(h) = std::env::var("HOME") {
        return Some(PathBuf::from(h));
    }
    None
}

fn pid_alive(pid: u32) -> bool {
    if pid == 0 {
        return false;
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        use std::process::Command;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        let out = Command::new("tasklist")
            .args(["/FI", &format!("PID eq {pid}"), "/NH"])
            .creation_flags(CREATE_NO_WINDOW)
            .output();
        match out {
            Ok(o) => {
                let s = String::from_utf8_lossy(&o.stdout);
                s.contains(&pid.to_string())
            }
            Err(_) => false,
        }
    }
    #[cfg(not(windows))]
    {
        std::path::Path::new(&format!("/proc/{pid}")).exists()
    }
}

fn scan_sessions() -> Vec<ClaudeSessionInfo> {
    let mut out = Vec::new();
    let Some(dir) = sessions_dir() else {
        return out;
    };
    if !dir.is_dir() {
        return out;
    }
    let entries = match fs::read_dir(&dir) {
        Ok(e) => e,
        Err(_) => return out,
    };
    for ent in entries.flatten() {
        let path = ent.path();
        if path.extension().and_then(|e| e.to_str()) != Some("json") {
            continue;
        }
        let Ok(text) = fs::read_to_string(&path) else {
            continue;
        };
        let Ok(v) = serde_json::from_str::<Value>(&text) else {
            continue;
        };
        let pid = v.get("pid").and_then(|p| p.as_u64()).unwrap_or(0) as u32;
        let session_id = v
            .get("sessionId")
            .or_else(|| v.get("session_id"))
            .and_then(|s| s.as_str())
            .unwrap_or("")
            .to_string();
        if session_id.is_empty() && pid == 0 {
            continue;
        }
        let status = v
            .get("status")
            .and_then(|s| s.as_str())
            .unwrap_or("unknown")
            .to_string();
        let cwd = v
            .get("cwd")
            .and_then(|s| s.as_str())
            .unwrap_or("")
            .to_string();
        let name = v
            .get("name")
            .and_then(|s| s.as_str())
            .unwrap_or("claude")
            .to_string();
        let alive = pid_alive(pid);
        out.push(ClaudeSessionInfo {
            session_id,
            pid,
            alive,
            status,
            cwd,
            name,
        });
    }
    out
}

pub fn start(app: AppHandle) {
    thread::spawn(move || {
        let mut was_connected = false;
        loop {
            let sessions = scan_sessions();
            let live: Vec<_> = sessions.into_iter().filter(|s| s.alive).collect();
            let connected = !live.is_empty();
            let just_connected = connected && !was_connected;
            let just_disconnected = !connected && was_connected;
            was_connected = connected;

            let payload = ClaudePresence {
                connected,
                live_count: live.len(),
                sessions: live,
                just_connected,
                just_disconnected,
            };
            let _ = app.emit("claude-presence", &payload);
            thread::sleep(Duration::from_millis(1500));
        }
    });
}

#[tauri::command]
pub fn claude_presence_snapshot() -> ClaudePresence {
    let sessions = scan_sessions();
    let live: Vec<_> = sessions.into_iter().filter(|s| s.alive).collect();
    ClaudePresence {
        connected: !live.is_empty(),
        live_count: live.len(),
        sessions: live,
        just_connected: false,
        just_disconnected: false,
    }
}
