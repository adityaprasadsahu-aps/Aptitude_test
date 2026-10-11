import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';
import path from 'path';

function questionBankSyncPlugin(): Plugin {
  let isRunning = false;
  let debounceTimeout: NodeJS.Timeout | null = null;

  const runSync = () => {
    if (isRunning) return;
    isRunning = true;
    console.log('\n[QuestionBank] Syncing questions and companies from Question_bank folders...');
    const proc = spawn('python', ['scripts/prepare_data.py'], {
      cwd: process.cwd(),
      shell: true,
      stdio: 'inherit'
    });

    proc.on('close', (code) => {
      isRunning = false;
      console.log(`[QuestionBank] Sync finished (exit code ${code})\n`);
    });
  };

  const debouncedSync = () => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      runSync();
    }, 1000);
  };

  return {
    name: 'question-bank-sync',
    configureServer(server) {
      const qbPath = path.resolve(process.cwd(), 'Question_bank');
      server.watcher.add(qbPath);

      server.watcher.on('add', (filePath) => {
        if (filePath.includes('Question_bank')) debouncedSync();
      });
      server.watcher.on('addDir', (dirPath) => {
        if (dirPath.includes('Question_bank')) debouncedSync();
      });
      server.watcher.on('unlink', (filePath) => {
        if (filePath.includes('Question_bank')) debouncedSync();
      });
      server.watcher.on('unlinkDir', (dirPath) => {
        if (dirPath.includes('Question_bank')) debouncedSync();
      });
      server.watcher.on('change', (filePath) => {
        if (filePath.includes('Question_bank')) debouncedSync();
      });

      // API endpoint for manual or frontend-triggered sync
      server.middlewares.use('/api/sync-question-bank', (_req, res) => {
        console.log('[QuestionBank] Manual sync triggered via API...');
        const proc = spawn('python', ['scripts/prepare_data.py'], {
          cwd: process.cwd(),
          shell: true
        });
        proc.on('close', (code) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: code === 0 }));
        });
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), questionBankSyncPlugin()],
});
