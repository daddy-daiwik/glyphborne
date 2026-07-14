const fs = require('fs');

function refactorFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Properties and object keys
    content = content.replace(/inventory\.triangle/g, 'inventory.yellow');
    content = content.replace(/inventory\.circle/g, 'inventory.green');
    content = content.replace(/inventory\.square/g, 'inventory.purple');
    
    content = content.replace(/requires\.triangle/g, 'requires.yellow');
    content = content.replace(/requires\.circle/g, 'requires.green');
    content = content.replace(/requires\.square/g, 'requires.purple');
    
    content = content.replace(/triangle:/g, 'yellow:');
    content = content.replace(/circle:/g, 'green:');
    content = content.replace(/square:/g, 'purple:');
    
    // UI elements
    content = content.replace(/invTriangleText/g, 'invYellowText');
    content = content.replace(/invCircleText/g, 'invGreenText');
    content = content.replace(/invSquareText/g, 'invPurpleText');
    
    // "triangleX" -> "yellowX"
    content = content.replace(/triangleX/g, 'yellowX');
    content = content.replace(/circleX/g, 'greenX');
    content = content.replace(/squareX/g, 'purpleX');
    
    // Fix draw methods to all be identical to drawOrb (drawCircle with fill)
    // drawYellow, drawGreen, drawPurple should all just draw an orb (circle).
    // Let's replace the whole drawYellow and drawPurple with circles.
    
    fs.writeFileSync(filePath, content);
}

refactorFile('src/client/scenes/Game.ts');
console.log("Refactoring keys complete");
