// Wakes an idle Claude Code session when this session's Alini connection receives a
// message aimed at its agent, or an invitation. `/alini:connect` names the helper session
// after the Claude Code session ID, which is how this module finds the right connection.
import type { Register } from 'claude-code'

type Wake = { id: number; text: string }

async function follow($: any, session: string): Promise<void> {
  for (;;) {
    let buffer = ''
    const watcher = $.process.spawn({ argv: ['node', `${$.plugin.root}/runtime/cli.mjs`, 'watch', '--session', session, '--format', 'prompt'] })
    try {
      for await (const piece of watcher) {
        if (!('stream' in piece)) break
        if (piece.stream !== 'stdout') { $.ui.log(piece.text, { to: 'debug' }); continue }
        buffer += piece.text
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) continue
          const wake = JSON.parse(line) as Wake
          // Queued until the session is idle; a busy session gets it as its next turn.
          void $.prompt.submit({ text: wake.text })
        }
      }
    } catch (error) {
      $.ui.log(`alini watch stopped: ${String(error)}`, { to: 'debug' })
    }
    // The watcher only ends if it crashed; start it again after a pause.
    await $.clock.sleep(5000)
  }
}

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    const session = await $.session.id()
    void follow($, session)
    return started
  })
}
