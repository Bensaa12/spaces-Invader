class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = Math.random() * 2 + 1;
        this.health = 3;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.shipType = Math.floor(Math.random() * 3); // 0, 1, or 2 for different ship types
        this.pulseRate = 0.05;
        this.pulseAmount = 0;
        this.pulseDirection = 1;
        this.glowIntensity = 0;
        this.glowDirection = 1;
    }

    update() {
        this.y += this.speed;
        
        // Pulsing effect for more dynamic appearance
        this.pulseAmount += this.pulseRate * this.pulseDirection;
        if (this.pulseAmount > 0.5 || this.pulseAmount < 0) {
            this.pulseDirection *= -1;
        }
        
        // Glow effect
        this.glowIntensity += 0.02 * this.glowDirection;
        if (this.glowIntensity > 1 || this.glowIntensity < 0.3) {
            this.glowDirection *= -1;
        }
    }

    draw() {
        ctx.save();
        
        // Add glow effect
        ctx.shadowBlur = 15 * this.glowIntensity;
        ctx.shadowColor = this.color;
        
        // Base color with slight transparency for effect
        ctx.fillStyle = this.color;
        
        switch(this.shipType) {
            case 0: // Aggressive arrow-shaped ship
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - (20 + this.pulseAmount * 5));
                ctx.lineTo(this.x + (20 + this.pulseAmount * 3), this.y + 20);
                ctx.lineTo(this.x, this.y + 10);
                ctx.lineTo(this.x - (20 + this.pulseAmount * 3), this.y + 20);
                ctx.closePath();
                ctx.fill();
                
                // Engine glow
                ctx.fillStyle = 'rgba(255, 200, 50, 0.8)';
                ctx.beginPath();
                ctx.moveTo(this.x - 10, this.y + 20);
                ctx.lineTo(this.x, this.y + 30 + this.pulseAmount * 10);
                ctx.lineTo(this.x + 10, this.y + 20);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 1: // Alien saucer-like ship
                // Main body
                ctx.beginPath();
                ctx.ellipse(this.x, this.y, 25 + this.pulseAmount * 5, 10 + this.pulseAmount * 2, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Top dome
                ctx.fillStyle = 'rgba(200, 230, 255, 0.7)';
                ctx.beginPath();
                ctx.ellipse(this.x, this.y - 5, 15, 15 + this.pulseAmount * 3, 0, Math.PI, Math.PI * 2);
                ctx.fill();
                
                // Bottom lights
                for (let i = 0; i < 5; i++) {
                    ctx.fillStyle = `hsl(${(i * 50 + Date.now() / 50) % 360}, 100%, 70%)`;
                    ctx.beginPath();
                    ctx.arc(this.x - 20 + i * 10, this.y + 5, 2 + this.pulseAmount * 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 2: // Mechanical battleship
                // Main body
                ctx.fillRect(this.x - 20, this.y - 10, 40, 30 + this.pulseAmount * 5);
                
                // Wings
                ctx.beginPath();
                ctx.moveTo(this.x - 20, this.y);
                ctx.lineTo(this.x - 35, this.y + 15);
                ctx.lineTo(this.x - 35, this.y + 25);
                ctx.lineTo(this.x - 15, this.y + 15);
                ctx.closePath();
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(this.x + 20, this.y);
                ctx.lineTo(this.x + 35, this.y + 15);
                ctx.lineTo(this.x + 35, this.y + 25);
                ctx.lineTo(this.x + 15, this.y + 15);
                ctx.closePath();
                ctx.fill();
                
                // Weapon turrets
                ctx.fillStyle = 'rgba(255, 100, 100, 0.9)';
                ctx.beginPath();
                ctx.arc(this.x - 10, this.y - 10, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(this.x + 10, this.y - 10, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // Engine glow
                ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.arc(this.x - 10 + i * 10, this.y + 20, 4 + this.pulseAmount * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
        }
        
        ctx.restore();
    }

    hit() {
        this.health--;
        // Flash effect when hit
        setTimeout(() => {
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }, 0);
        
        // Create explosion particles when destroyed
        if (this.health <= 0) {
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(
                    this.x, 
                    this.y, 
                    Math.random() * 4 - 2, 
                    Math.random() * 4 - 2, 
                    Math.random() * 10 + 5, 
                    this.color
                ));
            }
            
            // Add score
            score += 100;
            
            // Power-up drop chance (20%)
            if (Math.random() < 0.2) {
                powerUps.push(new PowerUp(this.x, this.y));
            }
        }
        
        return this.health <= 0;
    }
}

class Particle {
    constructor(x, y, speedX, speedY, size, color) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.size = size;
        this.color = color;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
        this.size *= 0.96;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 2;
        this.type = Math.floor(Math.random() * 4); // 0: triple shot, 1: shield, 2: speed boost, 3: bomb
        this.pulseAmount = 0;
        this.pulseDirection = 1;
        this.collected = false;
        this.collectionAnimation = 0;
    }

    update() {
        this.y += this.speed;
        
        // Pulsing effect
        this.pulseAmount += 0.05 * this.pulseDirection;
        if (this.pulseAmount > 1 || this.pulseAmount < 0) {
            this.pulseDirection *= -1;
        }
        
        // Collection animation
        if (this.collected) {
            this.collectionAnimation += 0.1;
            return this.collectionAnimation >= 1; // Remove when animation complete
        }
        
        return this.y > canvas.height; // Remove when off-screen
    }

    draw() {
        if (this.collected) {
            // Draw collection animation
            ctx.save();
            ctx.globalAlpha = 1 - this.collectionAnimation;
            ctx.fillStyle = this.getColor();
            ctx.beginPath();
            ctx.arc(this.x, this.y, 20 + this.collectionAnimation * 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }
        
        ctx.save();
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.getColor();
        
        // Draw power-up
        ctx.fillStyle = this.getColor();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10 + this.pulseAmount * 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw icon based on type
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let icon = '';
        switch(this.type) {
            case 0: icon = '3X'; break; // Triple shot
            case 1: icon = 'S'; break;  // Shield
            case 2: icon = '+'; break;  // Speed boost
            case 3: icon = 'B'; break;  // Bomb
        }
        
        ctx.fillText(icon, this.x, this.y);
        ctx.restore();
    }
    
    getColor() {
        switch(this.type) {
            case 0: return '#ff5500'; // Orange for triple shot
            case 1: return '#00aaff'; // Blue for shield
            case 2: return '#00ff00'; // Green for speed boost
            case 3: return '#ff0000'; // Red for bomb
        }
    }
    
    collect() {
        this.collected = true;
        return this.type;
    }
} 