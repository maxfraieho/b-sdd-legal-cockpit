const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

const CHROME_PORT = 9222;
const BRAIN_DIR = '/home/vokov/.gemini/antigravity-cli/brain/b2163e13-5d81-4484-a3e6-9db07d5ff318';

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching headless Chromium on port ' + CHROME_PORT);
  const chrome = spawn('chromium', [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--user-data-dir=/tmp/test-chrome-profile-capture',
    '--remote-debugging-port=' + CHROME_PORT,
    '--window-size=1440,900',
    'about:blank'
  ], { stdio: 'ignore' });

  await sleep(4000);

  try {
    const targets = await fetchJson(`http://127.0.0.1:${CHROME_PORT}/json`);
    const pageTarget = targets.find(t => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let id = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (data) => {
        const msg = JSON.parse(data);
        if (msg.id === msgId) {
          ws.off('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await new Promise(resolve => ws.on('open', resolve));
    console.log('Connected to Chrome DevTools Protocol');

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('Navigating to https://b-sdd-legal-ui.pages.dev');
    await send('Page.navigate', { url: 'https://b-sdd-legal-ui.pages.dev' });
    await sleep(4000);

    // 1. Enter password '0523' and click unlock
    console.log('Unlocking cockpit with PIN 0523...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const input = document.querySelector('input[type="password"]');
          if (input) {
            input.value = '0523';
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
          const submitBtn = document.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.click();
          }
        })()
      `
    });
    await sleep(2000);

    // Capture Unlocked View
    console.log('Capturing unlocked Ukrainian cockpit screenshot...');
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${BRAIN_DIR}/b-sdd-legal-unlocked-ua.png`, Buffer.from(shot1.data, 'base64'));
    console.log('Saved b-sdd-legal-unlocked-ua.png');

    // 2. Open Settings Modal
    console.log('Opening Settings Modal...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('header button'));
          // Settings button is the one with Settings icon (second to last before lock)
          if (btns.length >= 2) {
            btns[btns.length - 2].click();
          }
        })()
      `
    });
    await sleep(1500);

    // Capture Settings Modal View
    console.log('Capturing Settings Modal screenshot...');
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${BRAIN_DIR}/b-sdd-legal-settings-modal.png`, Buffer.from(shot2.data, 'base64'));
    console.log('Saved b-sdd-legal-settings-modal.png');

    // 3. Switch to Cloudflare Tunnel tab in Settings
    console.log('Switching to Tunnel & MCP tab...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const tabBtns = Array.from(document.querySelectorAll('div[class*="fixed"] button'));
          const tunnelTab = tabBtns.find(b => b.textContent && (b.textContent.includes('Tunnel') || b.textContent.includes('MCP') || b.textContent.includes('Тунель')));
          if (tunnelTab) tunnelTab.click();
        })()
      `
    });
    await sleep(1000);

    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${BRAIN_DIR}/b-sdd-legal-tunnel-mcp-tab.png`, Buffer.from(shot3.data, 'base64'));
    console.log('Saved b-sdd-legal-tunnel-mcp-tab.png');

    ws.close();
  } catch (err) {
    console.error('Error in capture script:', err);
  } finally {
    chrome.kill('SIGTERM');
  }
}

main();
