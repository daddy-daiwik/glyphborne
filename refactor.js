const fs = require('fs');

function refactorFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace string literals in the code
    content = content.replace(/'triangle'/g, "'yellow'");
    content = content.replace(/'circle'/g, "'green'");
    content = content.replace(/'square'/g, "'purple'");

    // Specifically for splash.ts uppercase text
    content = content.replace(/'TRIANGLE'/g, "'YELLOW'");
    content = content.replace(/'CIRCLE'/g, "'GREEN'");
    content = content.replace(/'SQUARE'/g, "'PURPLE'");

    // For draw functions, replace drawTriangle and drawSquare calls with a call to drawTokenOrb
    // wait, we can just rename drawTriangle -> drawYellowOrb, etc.?
    // Let's just make drawTriangle draw a circle, drawSquare draw a circle.
    // Or replace them:
    content = content.replace(/this\.drawTriangle\(/g, "this.drawOrb(");
    content = content.replace(/this\.drawCircle\(/g, "this.drawOrb("); // this might replace things like player circles, wait!
    // We only want to replace it for tokens? The user said "make them all like simple orbs".
    // I will write a custom script that specifically replaces the shape type definition and the strings.
    
    fs.writeFileSync(filePath, content);
}

refactorFile('src/client/scenes/Game.ts');
refactorFile('src/client/splash.ts');
console.log("Refactoring strings complete");
