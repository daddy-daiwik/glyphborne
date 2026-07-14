const fs = require('fs');

function refactorFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Type definitions and specific string literals
    content = content.replace(/'triangle'/g, "'yellow'");
    content = content.replace(/'circle'/g, "'green'");
    content = content.replace(/'square'/g, "'purple'");
    
    // Specifically for splash.ts text
    content = content.replace(/TRIANGLE/g, 'YELLOW');
    content = content.replace(/CIRCLE/g, 'GREEN');
    content = content.replace(/SQUARE/g, 'PURPLE');

    // Method renames
    content = content.replace(/drawTriangle/g, 'drawYellow');
    content = content.replace(/drawSquare/g, 'drawPurple');
    // For drawCircle, we ONLY want to replace it where it refers to our token drawing function, not Phaser's methods.
    // In Game.ts we have `drawCircle(g: Phaser.GameObjects.Graphics...` and `this.drawCircle(t.graphics...`
    // It's safer to just replace `this.drawCircle(` with `this.drawGreen(` and the function definition `drawCircle(g: ` with `drawGreen(g: `
    content = content.replace(/this\.drawCircle\(/g, 'this.drawGreen(');
    content = content.replace(/drawCircle\(g: /g, 'drawGreen(g: ');
    
    // Types and variables
    content = content.replace(/TOKEN_TRIANGLE_COLOR/g, 'TOKEN_YELLOW_COLOR');
    content = content.replace(/TOKEN_CIRCLE_COLOR/g, 'TOKEN_GREEN_COLOR');
    content = content.replace(/TOKEN_SQUARE_COLOR/g, 'TOKEN_PURPLE_COLOR');

    fs.writeFileSync(filePath, content);
}

refactorFile('src/client/scenes/Game.ts');
refactorFile('src/client/splash.ts');
console.log("Refactoring strings complete");
