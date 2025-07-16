const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules/phaser/src/input/mouse/MouseManager.js');

let content = fs.readFileSync(filePath, 'utf8');

// Replace the window.top block
content = content.replace(
  /try\s*\{\s*window\.top\.addEventListener\('mousedown',\s*this\.onMouseDownWindow,\s*passive\);\s*window\.top\.addEventListener\('mouseup',\s*this\.onMouseUpWindow,\s*passive\);\s*\}\s*catch\s*\(exception\)\s*\{\s*window\.addEventListener\('mousedown',\s*this\.onMouseDownWindow,\s*passive\);\s*window\.addEventListener\('mouseup',\s*this\.onMouseUpWindow,\s*passive\);\s*this\.isTop\s*=\s*false;\s*\}/g,
  `window.addEventListener('mousedown', this.onMouseDownWindow, passive);
   window.addEventListener('mouseup', this.onMouseUpWindow, passive);
   this.isTop = false;`
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('Patched Phaser MouseManager.js to remove window.top');
