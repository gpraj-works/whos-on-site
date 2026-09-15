import { spawn } from 'child_process';

const child = spawn('pnpm.cmd', ['db:generate'], { cwd: 'E:/Projects/whosonsite/apps/api', shell: true });

child.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  if (output.includes('rename enum')) {
    // Send down arrow (to select rename) and then Enter
    child.stdin.write('\x1B[B\n');
  }
  if (output.includes('rename table')) {
    child.stdin.write('\x1B[B\n');
  }
  if (output.includes('rename column')) {
    child.stdin.write('\x1B[B\n');
  }
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
