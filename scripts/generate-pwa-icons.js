const fs = require('fs');
const path = require('path');

// Simple script to create placeholder PNG files for PWA icons
// In production, you would use a proper SVG to PNG converter like sharp or puppeteer

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create the icon directory if it doesn't exist
const iconDir = path.join(process.cwd(), 'public', 'images', 'icon');
if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
}

// For now, we'll create a simple HTML file that can be used to generate PNG files
// This HTML will render the SVG and can be used with a screenshot tool or browser
const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; padding: 20px; background: white; }
        .icon-container { 
            display: inline-block; 
            margin: 10px; 
            border: 1px solid #ccc; 
            text-align: center;
            padding: 10px;
        }
        .icon-title { font-family: Arial; font-size: 12px; margin-top: 5px; }
    </style>
</head>
<body>
    <h1>Eduprima PWA Icons - Ready for Manual Export</h1>
    <p>Right-click each icon and "Save image as..." to create PNG files, or use browser screenshot tools.</p>
    ${sizes.map(size => `
    <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}">
            <defs>
                <linearGradient id="capGradient${size}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="tassel${size}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
                </linearGradient>
            </defs>
            
            <!-- Background circle -->
            <circle cx="100" cy="100" r="95" fill="url(#capGradient${size})" stroke="#ffffff" stroke-width="3"/>
            
            <!-- Graduation cap base -->
            <path d="M40 110 L160 110 Q165 110 165 115 L165 125 Q165 130 160 130 L40 130 Q35 130 35 125 L35 115 Q35 110 40 110 Z" fill="#1e293b"/>
            
            <!-- Graduation cap top -->
            <path d="M30 110 L170 110 Q175 110 175 105 L175 95 Q175 90 170 90 L30 90 Q25 90 25 95 L25 105 Q25 110 30 110 Z" fill="#334155"/>
            
            <!-- Graduation cap button -->
            <circle cx="100" cy="100" r="8" fill="#64748b"/>
            
            <!-- Tassel cord -->
            <line x1="108" y1="100" x2="125" y2="140" stroke="url(#tassel${size})" stroke-width="2"/>
            
            <!-- Tassel -->
            <g transform="translate(120,135)">
                <path d="M0 0 L10 15 L5 20 L-5 20 L-10 15 Z" fill="url(#tassel${size})"/>
                <path d="M-3 20 L8 20" stroke="url(#tassel${size})" stroke-width="1"/>
                <path d="M-2 22 L7 22" stroke="url(#tassel${size})" stroke-width="1"/>
                <path d="M-1 24 L6 24" stroke="url(#tassel${size})" stroke-width="1"/>
            </g>
            
            <!-- Text "E" -->
            <text x="100" y="170" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#ffffff">E</text>
            
            <!-- Decorative elements -->
            <circle cx="60" cy="60" r="3" fill="#fbbf24" opacity="0.8"/>
            <circle cx="140" cy="60" r="3" fill="#fbbf24" opacity="0.8"/>
            <circle cx="50" cy="150" r="2" fill="#fbbf24" opacity="0.6"/>
            <circle cx="150" cy="150" r="2" fill="#fbbf24" opacity="0.6"/>
        </svg>
        <div class="icon-title">icon-${size}x${size}.png</div>
    </div>
    `).join('')}
    
    <h2>Instructions:</h2>
    <ol>
        <li>Open this HTML file in your browser</li>
        <li>Right-click each icon above</li>
        <li>Select "Save image as..." or "Copy image"</li>
        <li>Save as PNG files with names: icon-72x72.png, icon-96x96.png, etc.</li>
        <li>Place all PNG files in the public/images/icon/ directory</li>
    </ol>
    
    <h2>Alternative Method:</h2>
    <p>Use an online SVG to PNG converter:</p>
    <ul>
        <li><a href="https://progressier.com/pwa-icons-and-ios-splash-screen-generator" target="_blank">Progressier PWA Icon Generator</a></li>
        <li><a href="https://www.gieson.com/Library/projects/utilities/icon_slayer/" target="_blank">Icon Slayer</a></li>
        <li><a href="https://realfavicongenerator.net/" target="_blank">RealFaviconGenerator</a></li>
    </ul>
</body>
</html>`;

// Write the HTML file
fs.writeFileSync(path.join(iconDir, 'icon-generator.html'), htmlContent);

console.log('✅ Icon generator HTML created!');
console.log('📍 Location: public/images/icon/icon-generator.html');
console.log('');
console.log('🔄 Next steps:');
console.log('1. Open public/images/icon/icon-generator.html in your browser');
console.log('2. Right-click each icon and save as PNG files');
console.log('3. Or use online SVG to PNG converter tools');
console.log('');
console.log('📋 Required files:');
sizes.forEach(size => {
    console.log(`   - icon-${size}x${size}.png`);
}); 