/* ============================================
   THE STORY OF SORA - $SORA
   Interactive JavaScript
   ============================================ */

// ============================================
// Custom Pen Cursor
// ============================================
const penCursor = document.getElementById('pen-cursor');

document.addEventListener('mousemove', (e) => {
    penCursor.style.left = e.clientX + 'px';
    penCursor.style.top = e.clientY + 'px';
});

// ============================================
// Drawing Canvas - FIXED VERSION
// ============================================
const canvas = document.getElementById('draw-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Enable pointer events on canvas
canvas.style.pointerEvents = 'auto';

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Store all strokes with their creation time
let strokes = [];
let currentStroke = null;

// Check if element is interactive
function isInteractiveElement(el) {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT') return true;
    if (el.closest('a') || el.closest('button') || el.closest('.nav') || el.closest('.buy-button')) return true;
    if (el.classList.contains('buy-button') || el.classList.contains('copy-btn')) return true;
    return false;
}

// Canvas mouse events
canvas.addEventListener('mousedown', (e) => {
    // Get element under cursor (excluding canvas)
    canvas.style.pointerEvents = 'none';
    const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
    canvas.style.pointerEvents = 'auto';
    
    if (isInteractiveElement(elementBelow)) {
        return;
    }
    
    isDrawing = true;
    lastX = e.clientX;
    lastY = e.clientY;
    currentStroke = {
        points: [{x: lastX, y: lastY}],
        createdAt: Date.now(),
        opacity: 1
    };
    e.preventDefault();
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    const x = e.clientX;
    const y = e.clientY;
    
    // Add point to current stroke
    currentStroke.points.push({x, y});
    
    lastX = x;
    lastY = y;
});

canvas.addEventListener('mouseup', () => {
    if (isDrawing && currentStroke && currentStroke.points.length > 1) {
        strokes.push(currentStroke);
    }
    isDrawing = false;
    currentStroke = null;
});

canvas.addEventListener('mouseleave', () => {
    if (isDrawing && currentStroke && currentStroke.points.length > 1) {
        strokes.push(currentStroke);
    }
    isDrawing = false;
    currentStroke = null;
});

// Allow clicks to pass through to elements below
canvas.addEventListener('click', (e) => {
    canvas.style.pointerEvents = 'none';
    const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
    canvas.style.pointerEvents = 'auto';
    
    if (isInteractiveElement(elementBelow)) {
        elementBelow.click();
    }
});

// Animation loop for drawing and fading strokes
function drawStrokes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const now = Date.now();
    const fadeDelay = 3000;  // Start fading after 3 seconds
    const fadeDuration = 2000; // Fade over 2 seconds
    
    // Filter and draw strokes
    strokes = strokes.filter(stroke => {
        const age = now - stroke.createdAt;
        
        if (age > fadeDelay + fadeDuration) {
            return false; // Remove fully faded strokes
        }
        
        // Calculate opacity
        let opacity = 1;
        if (age > fadeDelay) {
            opacity = 1 - ((age - fadeDelay) / fadeDuration);
        }
        stroke.opacity = opacity;
        
        // Draw the stroke
        if (stroke.points.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(44, 24, 16, ${opacity * 0.9})`;
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
        }
        
        return true;
    });
    
    // Draw current stroke being drawn
    if (isDrawing && currentStroke && currentStroke.points.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(44, 24, 16, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y);
        for (let i = 1; i < currentStroke.points.length; i++) {
            ctx.lineTo(currentStroke.points[i].x, currentStroke.points[i].y);
        }
        ctx.stroke();
    }
    
    requestAnimationFrame(drawStrokes);
}

drawStrokes();

// ============================================
// Floating Particles
// ============================================
const particlesContainer = document.getElementById('particles');
const particleCount = 30;

function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (10 + Math.random() * 10) + 's';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.width = (2 + Math.random() * 3) + 'px';
    particle.style.height = particle.style.width;
    
    const colors = ['#d4af37', '#b8942e', '#ff6b35', '#f5e6d3'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    particlesContainer.appendChild(particle);
}

for (let i = 0; i < particleCount; i++) {
    createParticle();
}

// ============================================
// Scroll Animations
// ============================================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.artifact, .flow-step, .token-card, .chapter').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
});

// ============================================
// Smooth Scroll for Navigation
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// Copy Contract Address
// ============================================
const copyBtn = document.getElementById('copy-ca');
const caText = document.getElementById('ca-text');

copyBtn.addEventListener('click', () => {
    const text = caText.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
});

// ============================================
// Parallax Effect on Hero
// ============================================
const heroSora = document.querySelector('.hero-sora');

document.querySelector('.hero').addEventListener('mousemove', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

    heroSora.style.transform = `translate(${x * 20}px, ${y * 10}px) rotate(${-2 + x * 2}deg)`;
});

// ============================================
// Navigation Background on Scroll
// ============================================
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(15, 15, 26, 0.98)';
    } else {
        nav.style.background = 'linear-gradient(to bottom, rgba(15, 15, 26, 0.95), transparent)';
    }
});

// ============================================
// Chapter Hover Effects
// ============================================
document.querySelectorAll('.chapter').forEach(chapter => {
    chapter.addEventListener('mouseenter', () => {
        chapter.querySelector('.chapter-content').style.transform = 'translateX(10px)';
    });
    
    chapter.addEventListener('mouseleave', () => {
        chapter.querySelector('.chapter-content').style.transform = 'translateX(0)';
    });
});

// ============================================
// Buy Button URL Configuration
// ============================================
// UPDATE THIS URL AFTER LAUNCHING YOUR COIN
const BUY_URL = '#'; // Replace with your pump.fun link

document.getElementById('buy-btn').href = BUY_URL;
document.getElementById('footer-buy').href = BUY_URL;

// ============================================
// Contract Address Configuration
// ============================================
// UPDATE THIS AFTER LAUNCHING YOUR COIN
const CONTRACT_ADDRESS = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Replace with actual CA

document.getElementById('ca-text').textContent = CONTRACT_ADDRESS;

// ============================================
// Floating Ash Particles
// ============================================
function createAshParticle() {
    const ash = document.createElement('div');
    const startX = Math.random() * 100;
    
    ash.style.cssText = `
        position: fixed;
        width: ${1 + Math.random() * 2}px;
        height: ${1 + Math.random() * 2}px;
        background: rgba(61, 61, 61, ${0.3 + Math.random() * 0.3});
        border-radius: 50%;
        pointer-events: none;
        z-index: 2;
        left: ${startX}%;
        top: -10px;
    `;
    
    document.body.appendChild(ash);
    
    let posY = -10;
    let rotation = 0;
    const speed = 0.5 + Math.random() * 1;
    const rotationSpeed = 1 + Math.random() * 2;
    
    function animateAsh() {
        posY += speed;
        rotation += rotationSpeed;
        const currentDrift = Math.sin(posY / 50) * 20;
        
        ash.style.transform = `translateY(${posY}px) translateX(${currentDrift}px) rotate(${rotation}deg)`;
        ash.style.opacity = Math.min(1, Math.max(0, 1 - (posY - window.innerHeight + 100) / 100));
        
        if (posY < window.innerHeight + 50) {
            requestAnimationFrame(animateAsh);
        } else {
            ash.remove();
        }
    }
    
    requestAnimationFrame(animateAsh);
}

setInterval(createAshParticle, 400);

// ============================================
// Console Easter Egg
// ============================================
console.log(`
%c🦊 The Story of Sora 🦊
%c$SORA

"Every buy is a heartbeat. Every sell, a cold wind. 
The blockchain writes — Sora lives."

Follow the journey: https://x.com/storytimeliveai
`, 
'font-size: 24px; font-weight: bold; color: #d4af37;',
'font-size: 14px; color: #f5e6d3;'
);
