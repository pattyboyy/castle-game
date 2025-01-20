class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Game state
        this.castle = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            size: 40,
            health: 100,
            maxHealth: 100,
            range: 200,
            weapons: {
                arrows: {
                    damage: 10,
                    speed: 1000,
                    projectileSpeed: 5,
                    level: 1,
                    cost: 50,
                    upgrades: {
                        rapid: {
                            level: 0,
                            cost: 100,
                            speedBoost: 0.2, // 20% faster per level
                            maxLevel: 5
                        },
                        power: {
                            level: 0,
                            cost: 150,
                            damageBoost: 0.3, // 30% more damage per level
                            maxLevel: 5
                        }
                    }
                },
                cannon: {
                    damage: 30,
                    speed: 2000,
                    projectileSpeed: 3,
                    level: 0,
                    cost: 200,
                    splash: 50,
                    upgrades: {
                        blast: {
                            level: 0,
                            cost: 250,
                            splashBoost: 15, // Increase splash radius
                            maxLevel: 5
                        },
                        impact: {
                            level: 0,
                            cost: 300,
                            stunDuration: 1000, // Stun duration in ms
                            maxLevel: 5
                        }
                    }
                },
                magic: {
                    damage: 5,
                    speed: 500,
                    projectileSpeed: 7,
                    level: 0,
                    cost: 300,
                    slow: 0.5,
                    upgrades: {
                        frost: {
                            level: 0,
                            cost: 200,
                            slowBoost: 0.1, // Additional slow effect
                            maxLevel: 5
                        },
                        chain: {
                            level: 0,
                            cost: 400,
                            bounces: 1, // Number of additional targets hit
                            maxLevel: 5
                        }
                    }
                }
            },
            units: {
                archers: {
                    instances: [],
                    damage: 5,
                    speed: 1500,
                    cost: 100,
                    range: 150,
                    projectileSpeed: 4,
                    upgrades: {
                        multishot: {
                            level: 0,
                            cost: 150,
                            arrows: 1,
                            maxLevel: 5
                        },
                        piercing: {
                            level: 0,
                            cost: 200,
                            penetration: 0,
                            maxLevel: 5
                        }
                    }
                },
                knights: {
                    instances: [],
                    damage: 15,
                    speed: 2000,
                    cost: 150,
                    range: 30,
                    moveSpeed: 2,
                    attackDuration: 300,
                    upgrades: {
                        armor: {
                            level: 0,
                            cost: 175,
                            reduction: 0,
                            maxLevel: 5
                        },
                        charge: {
                            level: 0,
                            cost: 225,
                            speedBoost: 1,
                            maxLevel: 5
                        }
                    }
                }
            }
        };

        this.enemies = [];
        this.gold = 200;
        this.roundActive = false;

        // UI elements
        this.startButton = document.getElementById('startRound');
        this.goldDisplay = document.getElementById('gold');
        this.upgradeHealthBtn = document.getElementById('upgradeHealth');
        this.upgradeSpeedBtn = document.getElementById('upgradeSpeed');
        this.waveDisplay = document.getElementById('wave');
        this.killsDisplay = document.getElementById('kills');

        // Event listeners
        this.startButton.addEventListener('click', () => this.startRound());
        this.upgradeHealthBtn.addEventListener('click', () => this.upgradeHealth());
        this.upgradeSpeedBtn.addEventListener('click', () => this.upgradeSpeed());

        // Add new properties
        this.arrows = [];
        this.kills = 0;
        this.wave = 1;
        this.roundDuration = 60; // 60 seconds per round
        this.roundTimer = 0;
        this.roundStartTime = 0;

        // Add timer display element
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.className = 'stat';
        document.querySelector('.stats').appendChild(this.timerDisplay);

        // Add new UI elements
        this.createWeaponUI();
        this.createUnitUI();

        // Add animation tracking
        this.animations = [];

        // Call updateUI after setting up UI elements and initial values
        this.updateUI();

        // Start game loop
        this.gameLoop();

        // Add enemy types
        this.enemyTypes = {
            basic: {
                health: 30,
                speed: 1,
                size: 20,
                color: '#e74c3c',
                goldReward: 10,
                damage: 1,
                spawnWeight: 1
            },
            fast: {
                health: 15,
                speed: 2,
                size: 15,
                color: '#f1c40f',
                goldReward: 15,
                damage: 1,
                spawnWeight: 0.5
            },
            tank: {
                health: 80,
                speed: 0.5,
                size: 30,
                color: '#8e44ad',
                goldReward: 25,
                damage: 2,
                spawnWeight: 0.3
            },
            boss: {
                health: 200,
                speed: 0.7,
                size: 40,
                color: '#c0392b',
                goldReward: 50,
                damage: 5,
                spawnWeight: 0.1
            }
        };

        // Base spawn interval in milliseconds
        this.baseSpawnInterval = 2000;

        // Add game speed control
        this.gameSpeed = 1;
        this.createSpeedControl();

        // Add animation properties for upgrades
        this.projectileEffects = {
            arrows: {
                power: {
                    color: '#f39c12',
                    size: 12,
                    trail: true
                },
                rapid: {
                    color: '#e74c3c',
                    size: 8,
                    speedLines: true
                }
            },
            cannon: {
                blast: {
                    color: '#c0392b',
                    radius: 50,
                    waves: true
                },
                impact: {
                    color: '#d35400',
                    stunRings: true
                }
            },
            magic: {
                frost: {
                    color: '#3498db',
                    snowflakes: true
                },
                chain: {
                    color: '#9b59b6',
                    lightning: true
                }
            }
        };

        // Add castle expansion properties
        this.castleExpanded = false;
        this.worldScale = 1;
        this.movementAreaRadius = 200; // Movement area radius for units
        this.createCastleExpansionUI();

        // Add developer controls
        this.createDevControls();

        // Add advanced weapons that unlock after expansion
        this.advancedWeapons = {
            ballista: {
                damage: 50,
                speed: 1500,
                projectileSpeed: 6,
                level: 0,
                cost: 1000,
                range: 400,
                upgrades: {
                    multishot: {
                        level: 0,
                        cost: 800,
                        arrows: 1, // Additional arrows per shot
                        maxLevel: 5
                    },
                    range: {
                        level: 0,
                        cost: 600,
                        rangeBoost: 0.3, // 30% range increase per level
                        maxLevel: 5
                    }
                }
            },
            catapult: {
                damage: 100,
                speed: 3000,
                projectileSpeed: 2,
                level: 0,
                cost: 2000,
                splash: 100,
                upgrades: {
                    payload: {
                        level: 0,
                        cost: 1500,
                        effect: 'fire', // Leaves burning ground
                        maxLevel: 5
                    },
                    siege: {
                        level: 0,
                        cost: 1200,
                        damageBoost: 0.5, // 50% more damage to groups
                        maxLevel: 5
                    }
                }
            },
            lightning: {
                damage: 40,
                speed: 800,
                projectileSpeed: 10,
                level: 0,
                cost: 3000,
                chain: 3,
                upgrades: {
                    storm: {
                        level: 0,
                        cost: 2000,
                        duration: 1000, // Storm duration in ms
                        maxLevel: 5
                    },
                    paralyze: {
                        level: 0,
                        cost: 1800,
                        duration: 2000, // Paralyze duration in ms
                        maxLevel: 5
                    }
                }
            }
        };

        // Add advanced units
        this.advancedUnits = {
            crossbowmen: {
                instances: [],
                damage: 15,
                speed: 2000,
                cost: 300,
                range: 250,
                projectileSpeed: 6,
                upgrades: {
                    scope: {
                        level: 0,
                        cost: 400,
                        rangeBoost: 0.4, // 40% range increase per level
                        maxLevel: 5
                    },
                    explosive: {
                        level: 0,
                        cost: 500,
                        splash: 30,
                        maxLevel: 5
                    }
                }
            },
            cavalry: {
                instances: [],
                damage: 30,
                speed: 1500,
                cost: 400,
                range: 40,
                moveSpeed: 4,
                upgrades: {
                    charge: {
                        level: 0,
                        cost: 600,
                        damageBoost: 1, // Double damage on initial hit
                        maxLevel: 5
                    },
                    trample: {
                        level: 0,
                        cost: 450,
                        aoeSize: 30,
                        maxLevel: 5
                    }
                }
            }
        };

        // Remove range upgrades from arrows
        delete this.castle.weapons.arrows.upgrades.range;

        // Remove range upgrades from archers
        delete this.castle.units.archers.upgrades.range;

        // Update all upgrade max levels to 5
        Object.values(this.castle.weapons).forEach(weapon => {
            Object.values(weapon.upgrades).forEach(upgrade => {
                upgrade.maxLevel = 5;
            });
        });

        Object.values(this.castle.units).forEach(unit => {
            Object.values(unit.upgrades).forEach(upgrade => {
                upgrade.maxLevel = 5;
            });
        });

        Object.values(this.advancedWeapons).forEach(weapon => {
            Object.values(weapon.upgrades).forEach(upgrade => {
                upgrade.maxLevel = 5;
            });
        });

        Object.values(this.advancedUnits).forEach(unit => {
            Object.values(unit.upgrades).forEach(upgrade => {
                upgrade.maxLevel = 5;
            });
        });
    }

    startRound() {
        this.roundActive = true;
        this.roundStartTime = Date.now();
        this.roundTimer = this.roundDuration;
        this.spawnEnemies();
    }

    spawnEnemies() {
        if (!this.roundActive) return;

        // Calculate spawn interval based on wave
        const spawnInterval = Math.max(300, this.baseSpawnInterval - (this.wave * 100));

        // Calculate spawn distance from center to be outside visible area
        const visibleRadius = Math.sqrt(
            Math.pow(this.canvas.width, 2) + Math.pow(this.canvas.height, 2)
        ) / 2;

        // Add extra padding to ensure enemies spawn off-screen even when castle is expanded
        const spawnDistance = this.castleExpanded ?
            visibleRadius * 4 : // Much further when expanded
            visibleRadius * 1.2; // Slightly outside normal view

        // Get canvas center
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Spawn enemy at random edge of expanded battlefield
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + Math.cos(angle) * spawnDistance;
        const y = centerY + Math.sin(angle) * spawnDistance;

        // Choose enemy type based on wave and weighted random
        const enemyType = this.chooseEnemyType();
        const stats = this.enemyTypes[enemyType];

        // Scale health and speed with wave number
        const scaledHealth = stats.health + (this.wave - 1) * (stats.health * 0.2);
        const scaledSpeed = stats.speed + (this.wave - 1) * 0.05;

        this.enemies.push({
            x: x,
            y: y,
            type: enemyType,
            size: stats.size,
            health: scaledHealth,
            maxHealth: scaledHealth,
            speed: scaledSpeed,
            color: stats.color,
            goldReward: stats.goldReward,
            damage: stats.damage
        });

        // Schedule next enemy spawn if round is still active
        if (this.roundActive) {
            setTimeout(() => this.spawnEnemies(), spawnInterval);
        }
    }

    chooseEnemyType() {
        // Unlock enemy types based on wave
        const availableTypes = Object.entries(this.enemyTypes).filter(([type, stats]) => {
            switch (type) {
                case 'basic': return true;
                case 'fast': return this.wave >= 2;
                case 'tank': return this.wave >= 4;
                case 'boss': return this.wave >= 7;
                default: return false;
            }
        });

        // Calculate total weight
        const totalWeight = availableTypes.reduce((sum, [_, stats]) => sum + stats.spawnWeight, 0);
        let random = Math.random() * totalWeight;

        // Choose type based on weights
        for (const [type, stats] of availableTypes) {
            random -= stats.spawnWeight;
            if (random <= 0) return type;
        }

        return 'basic'; // Fallback
    }

    upgradeHealth() {
        if (this.gold >= 30) {
            this.gold -= 30;
            this.castle.maxHealth += 20;
            this.castle.health += 20;
            this.updateUI();
        }
    }

    upgradeSpeed() {
        if (this.gold >= 40) {
            this.gold -= 40;
            this.castle.attackSpeed = Math.max(500, this.castle.attackSpeed - 100);
            this.updateUI();
        }
    }

    updateUI() {
        this.goldDisplay.textContent = `Gold: ${this.gold}`;
        this.waveDisplay.textContent = `Wave: ${this.wave}`;
        this.killsDisplay.textContent = `Kills: ${this.kills}`;

        // Update button states
        this.upgradeHealthBtn.disabled = this.gold < 30;
        this.upgradeSpeedBtn.disabled = this.gold < 40;

        // Update weapon buttons
        Object.entries(this.castle.weapons).forEach(([type, weapon]) => {
            const btn = document.getElementById(type === 'arrows' ? 'upgradeArrows' : `unlock${type.charAt(0).toUpperCase() + type.slice(1)}`);
            if (weapon.level > 0) {
                btn.textContent = `Upgrade ${type.charAt(0).toUpperCase() + type.slice(1)} (${weapon.cost}g) Lvl ${weapon.level}`;
            } else {
                btn.textContent = `Unlock ${type.charAt(0).toUpperCase() + type.slice(1)} (${weapon.cost}g)`;
            }
            btn.disabled = this.gold < weapon.cost;
        });

        // Update unit buttons
        Object.entries(this.castle.units).forEach(([type, unitType]) => {
            const btn = document.getElementById(`hire${type.charAt(0).toUpperCase() + type.slice(1).slice(0, -1)}`);
            btn.textContent = `Hire ${type.charAt(0).toUpperCase() + type.slice(1).slice(0, -1)} (${unitType.cost}g) Count: ${unitType.instances.length}`;
            btn.disabled = this.gold < unitType.cost;
        });
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        // Apply game speed to all movement and timers
        // (We're not using the actual frame time in this code; we just set deltaTime to gameSpeed)
        deltaTime = this.gameSpeed;
    
        // --- ROUND TIMER / UI UPDATE ---
        if (this.roundActive) {
            const elapsed = (Date.now() - this.roundStartTime) / 1000 * this.gameSpeed;
            this.roundTimer = Math.max(0, this.roundDuration - elapsed);
    
            // Update timer display
            const minutes = Math.floor(this.roundTimer / 60);
            const seconds = Math.floor(this.roundTimer % 60);
            this.timerDisplay.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    
            // End round if timer runs out
            if (this.roundTimer <= 0) {
                this.endRound();
            }
        }
    
        // Calculate expanded battlefield boundaries (if not expanded, we still use normal screen)
        const screenBounds = this.castleExpanded
            ? {
                  left: -this.canvas.width,
                  right: this.canvas.width * 2,
                  top: -this.canvas.height,
                  bottom: this.canvas.height * 2
              }
            : {
                  left: 0,
                  right: this.canvas.width,
                  top: 0,
                  bottom: this.canvas.height
              };
    
        // --- UPDATE ARROWS / PROJECTILES ---
        for (let i = this.arrows.length - 1; i >= 0; i--) {
            const arrow = this.arrows[i];
            arrow.x += arrow.dx * arrow.speed * deltaTime;
            arrow.y += arrow.dy * arrow.speed * deltaTime;
    
            // Check arrow collision with enemies
            let hitEnemy = false;
            for (let enemy of this.enemies) {
                const dx = arrow.x - enemy.x;
                const dy = arrow.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
    
                if (distance < enemy.size / 2) {
                    this.handleProjectileCollision(arrow, enemy);
                    hitEnemy = true;
                    break;
                }
            }
    
            // Remove arrow if it hit an enemy or is out of bounds
            if (
                hitEnemy ||
                arrow.x < screenBounds.left ||
                arrow.x > screenBounds.right ||
                arrow.y < screenBounds.top ||
                arrow.y > screenBounds.bottom
            ) {
                this.arrows.splice(i, 1);
            }
        }
    
        // --- RESET STUN STATUS ON ENEMIES EACH FRAME ---
        this.enemies.forEach(enemy => {
            enemy.stunnedByKnight = enemy.stunnedByKnight || false;
        });
    
        // --- HANDLE INDIVIDUAL UNIT (ARCHERS/KNIGHTS) ATTACKS ---
        Object.entries(this.castle.units).forEach(([type, unitType]) => {
            unitType.instances.forEach(unit => {
                const now = Date.now();
                if (!unit.lastAttack) {
                    unit.lastAttack = now;
                }
                // The base attack logic (archers fire arrow, knights do direct damage) is below
                if (now - unit.lastAttack >= unitType.speed / this.gameSpeed) {
                    if (type === 'archers') {
                        const target = this.findRandomEnemyInRange(unit.x, unit.y, unitType.range);
                        if (target) {
                            this.fireUnitProjectile(unit, target, unitType);
                        }
                    } else if (type === 'knights') {
                        const target = this.findRandomEnemyInRange(unit.x, unit.y, unitType.range);
                        if (target) {
                            target.health -= unitType.damage;
                        }
                    }
                    unit.lastAttack = now;
                }
            });
        });
    
        // --- HANDLE CASTLE WEAPON ATTACKS (Arrows/Cannon/Magic) ---
        Object.entries(this.castle.weapons).forEach(([type, weapon]) => {
            if (weapon.level > 0 && this.enemies.length > 0) {
                const now = Date.now();
                if (now - (weapon.lastAttack || 0) >= weapon.speed / this.gameSpeed) {
                    const target = this.findNearestEnemy();
                    if (target) {
                        this.fireProjectile(type, target);
                    }
                    weapon.lastAttack = now;
                }
            }
        });
    
        // --- MOVE REGULAR UNITS (ARCHERS/KNIGHTS) ---
        Object.entries(this.castle.units).forEach(([type, unitType]) => {
            const availableEnemies = [...this.enemies];
    
            unitType.instances.forEach(unit => {
                if (this.enemies.length > 0) {
                    // Find the closest enemy
                    let closestIndex = -1;
                    let closestDist = Infinity;
    
                    availableEnemies.forEach((enemy, index) => {
                        const dx = enemy.x - unit.x;
                        const dy = enemy.y - unit.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < closestDist) {
                            closestDist = dist;
                            closestIndex = index;
                        }
                    });
    
                    if (closestIndex !== -1) {
                        const closest = availableEnemies[closestIndex];
                        // Remove this enemy from "available" so other units pick another
                        availableEnemies.splice(closestIndex, 1);
    
                        unit.targetEnemy = closest;
    
                        // Move toward enemy if not in range
                        if (closestDist > unitType.range) {
                            const dx = closest.x - unit.x;
                            const dy = closest.y - unit.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            const moveSpeed = type === 'knights' ? unitType.moveSpeed : 2;
                            unit.x += (dx / dist) * moveSpeed * deltaTime;
                            unit.y += (dy / dist) * moveSpeed * deltaTime;
    
                            // Clamp into screen bounds or expanded if castle is expanded
                            unit.x = Math.max(screenBounds.left, Math.min(screenBounds.right, unit.x));
                            unit.y = Math.max(screenBounds.top, Math.min(screenBounds.bottom, unit.y));
    
                            // Update facing
                            unit.lastAngle = Math.atan2(dy, dx);
                        } else {
                            // Knight stuns if in range
                            if (type === 'knights') {
                                closest.stunnedByKnight = true;
                            }
                            // Attack if cooldown is ready
                            const now = Date.now();
                            if (
                                !unit.lastAttack ||
                                now - unit.lastAttack >= unitType.speed / this.gameSpeed
                            ) {
                                if (type === 'archers') {
                                    this.fireUnitProjectile(unit, closest, unitType);
                                } else if (type === 'knights') {
                                    closest.health -= unitType.damage;
                                    // Add slash animation
                                    this.animations.push({
                                        type: 'knightAttack',
                                        x: unit.x,
                                        y: unit.y,
                                        targetX: closest.x,
                                        targetY: closest.y,
                                        startTime: now,
                                        duration: unitType.attackDuration
                                    });
                                }
                                unit.lastAttack = now;
                            }
                        }
                    }
                }
    
                // Return to castle if no target or old target is gone
                if (!unit.targetEnemy || !this.enemies.includes(unit.targetEnemy)) {
                    unit.targetEnemy = null;
                    const distToCastle = Math.sqrt(
                        Math.pow(this.castle.x - unit.x, 2) + Math.pow(this.castle.y - unit.y, 2)
                    );
    
                    if (distToCastle > this.movementAreaRadius) {
                        const dx = this.castle.x - unit.x;
                        const dy = this.castle.y - unit.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const moveSpeed = type === 'knights' ? unitType.moveSpeed : 2;
                        unit.x += (dx / dist) * moveSpeed * deltaTime;
                        unit.y += (dy / dist) * moveSpeed * deltaTime;
    
                        unit.x = Math.max(screenBounds.left, Math.min(screenBounds.right, unit.x));
                        unit.y = Math.max(screenBounds.top, Math.min(screenBounds.bottom, unit.y));
    
                        unit.lastAngle = Math.atan2(dy, dx);
                    }
                }
            });
        });
    
        // --- UPDATE ADVANCED UNITS IF CASTLE EXPANDED ---
        if (this.castleExpanded) {
            // Use a larger bounding box
            const expandedBounds = {
                left: -this.canvas.width,
                right: this.canvas.width * 2,
                top: -this.canvas.height,
                bottom: this.canvas.height * 2
            };
    
            if (this.enemies.length > 0) {
                // Instead of filtering, just consider all enemies
                const enemiesInBounds = this.enemies;
    
                // (Optional) sort them if you want nearest to castle first
                // enemiesInBounds.sort((a, b) => {
                //     const distA = Math.hypot(a.x - this.castle.x, a.y - this.castle.y);
                //     const distB = Math.hypot(b.x - this.castle.x, b.y - this.castle.y);
                //     return distA - distB;
                // });
    
                // Now let each advanced unit chase/attack
                Object.entries(this.advancedUnits).forEach(([type, unitType]) => {
                    unitType.instances.forEach(unit => {
                        const now = Date.now();
                        if (!unit.lastAttack) unit.lastAttack = now;
                        if (!unit.state) unit.state = 'seeking';
    
                        // Distance to castle
                        const distToCastle = Math.hypot(this.castle.x - unit.x, this.castle.y - unit.y);
    
                        // If too far from castle, move back
                        if (distToCastle > this.movementAreaRadius) {
                            const dx = this.castle.x - unit.x;
                            const dy = this.castle.y - unit.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            const moveSpeed = type === 'cavalry' ? unitType.moveSpeed : 2;
                            unit.x += (dx / dist) * moveSpeed * deltaTime;
                            unit.y += (dy / dist) * moveSpeed * deltaTime;
                            unit.lastAngle = Math.atan2(dy, dx);
                        } else {
                            // Find best (closest or priority) target
                            let targetEnemy = null;
                            let closestDist = Infinity;
    
                            for (const enemy of enemiesInBounds) {
                                const dx = enemy.x - unit.x;
                                const dy = enemy.y - unit.y;
                                const dist = Math.sqrt(dx * dx + dy * dy);
                                if (dist < closestDist) {
                                    closestDist = dist;
                                    targetEnemy = enemy;
                                }
                            }
    
                            if (targetEnemy) {
                                const dx = targetEnemy.x - unit.x;
                                const dy = targetEnemy.y - unit.y;
                                const distToTarget = Math.hypot(dx, dy);
    
                                // Move toward enemy if not in range
                                if (distToTarget > unitType.range) {
                                    const moveSpeed = type === 'cavalry' ? unitType.moveSpeed : 2;
                                    unit.x += (dx / distToTarget) * moveSpeed * deltaTime;
                                    unit.y += (dy / distToTarget) * moveSpeed * deltaTime;
                                    unit.lastAngle = Math.atan2(dy, dx);
                                }
    
                                // Attack if in range
                                if (
                                    distToTarget <= unitType.range &&
                                    now - unit.lastAttack >= unitType.speed / this.gameSpeed
                                ) {
                                    if (type === 'crossbowmen') {
                                        this.fireAdvancedUnitProjectile(unit, targetEnemy, unitType);
                                    } else if (type === 'cavalry') {
                                        this.handleCavalryAttack(unit, targetEnemy, unitType);
                                    }
                                    unit.lastAttack = now;
                                }
                            }
                        }
    
                        // Clamp to expanded bounds if you like
                        unit.x = Math.max(expandedBounds.left, Math.min(expandedBounds.right, unit.x));
                        unit.y = Math.max(expandedBounds.top, Math.min(expandedBounds.bottom, unit.y));
                    });
                });
            }
        }
    
        // --- UPDATE ANIMATIONS ---
        this.animations = this.animations.filter(anim => {
            return Date.now() - anim.startTime < anim.duration;
        });
    
        // --- REMOVE DEAD ENEMIES, AWARD GOLD, UPDATE KILLS ---
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.health <= 0) {
                const goldReward = 10 + (this.wave - 1) * 5;
                this.gold += goldReward;
                this.kills++;
                this.updateUI();
                return false;
            }
            return true;
        });
    
        // If no enemies remain and round is still active, end the wave
        if (this.enemies.length === 0 && this.roundActive) {
            this.wave++;
            this.roundActive = false;
            this.updateUI();
        }
    
        // --- CHECK GAME OVER ---
        if (this.castle.health <= 0) {
            alert('Game Over!');
            this.resetGame();
        }
    
        // --- KNIGHT ARMOR EFFECT ON CASTLE (damage reduction) ---
        if (this.castle.units.knights.instances.length > 0) {
            let totalReduction = 0;
            this.castle.units.knights.instances.forEach(knight => {
                const distToCastle = Math.hypot(this.castle.x - knight.x, this.castle.y - knight.y);
                if (distToCastle < this.castle.range) {
                    totalReduction += this.castle.units.knights.upgrades.armor.reduction;
                }
            });
            this.currentDamageReduction = Math.max(0.1, 1 - totalReduction); // min 10% damage
        } else {
            this.currentDamageReduction = 1;
        }
    
        // --- ENEMY MOVEMENT / CASTLE COLLISION ---
        this.enemies.forEach(enemy => {
            // Only move if not stunned by a knight
            if (!enemy.stunnedByKnight) {
                const dx = this.castle.x - enemy.x;
                const dy = this.castle.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
    
                enemy.x += (dx / distance) * enemy.speed * deltaTime;
                enemy.y += (dy / distance) * enemy.speed * deltaTime;
            }
    
            // Check collision with castle
            const distToCastle = Math.hypot(this.castle.x - enemy.x, this.castle.y - enemy.y);
            if (distToCastle < this.castle.size + enemy.size) {
                // Apply damage with current damage reduction (knight armor)
                this.castle.health -= enemy.damage * this.currentDamageReduction;
                // That enemy is effectively destroyed
                enemy.health = 0;
            }
        });
    
        // --- UPDATE ADVANCED WEAPONS IF CASTLE EXPANDED ---
        if (this.castleExpanded) {
            Object.entries(this.advancedWeapons).forEach(([type, weapon]) => {
                if (weapon.level > 0 && this.enemies.length > 0) {
                    const now = Date.now();
                    if (now - (weapon.lastAttack || 0) >= weapon.speed / this.gameSpeed) {
                        const target = this.findNearestEnemy();
                        if (target) {
                            this.fireProjectile(type, target);
                        }
                        weapon.lastAttack = now;
                    }
                }
            });
        }
    
        // --- KNIGHT CHARGE BOOST ---
        const chargeBoost = this.castle.units.knights.upgrades.charge.speedBoost;
        if (chargeBoost > 1) {
            this.castle.units.knights.moveSpeed = 2 * chargeBoost;
        }
    }
    

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply world scale if castle is expanded
        if (this.castleExpanded) {
            this.ctx.save();
            this.ctx.scale(this.worldScale, this.worldScale);

            // Translate to keep castle centered
            const scaledOffsetX = (this.canvas.width / this.worldScale - this.canvas.width) / 2;
            const scaledOffsetY = (this.canvas.height / this.worldScale - this.canvas.height) / 2;
            this.ctx.translate(scaledOffsetX, scaledOffsetY);
        }

        // Draw castle with enhanced details when expanded
        if (this.castleExpanded) {
            // Main castle body
            this.ctx.fillStyle = '#7f8c8d';
            this.ctx.beginPath();
            this.ctx.arc(this.castle.x, this.castle.y, this.castle.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Outer walls
            this.ctx.strokeStyle = '#95a5a6';
            this.ctx.lineWidth = this.castle.size / 8;
            this.ctx.beginPath();
            this.ctx.arc(this.castle.x, this.castle.y, this.castle.size * 0.9, 0, Math.PI * 2);
            this.ctx.stroke();

            // Towers
            const towerCount = 8;
            const towerSize = this.castle.size / 5;
            for (let i = 0; i < towerCount; i++) {
                const angle = (i / towerCount) * Math.PI * 2;
                const x = this.castle.x + Math.cos(angle) * this.castle.size;
                const y = this.castle.y + Math.sin(angle) * this.castle.size;

                this.ctx.fillStyle = '#95a5a6';
                this.ctx.beginPath();
                this.ctx.arc(x, y, towerSize, 0, Math.PI * 2);
                this.ctx.fill();

                // Tower tops
                this.ctx.fillStyle = '#7f8c8d';
                this.ctx.beginPath();
                this.ctx.arc(x, y, towerSize * 0.7, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Inner keep
            this.ctx.fillStyle = '#6c7a89';
            this.ctx.beginPath();
            this.ctx.arc(this.castle.x, this.castle.y, this.castle.size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Original castle drawing
            this.ctx.fillStyle = '#7f8c8d';
            this.ctx.beginPath();
            this.ctx.arc(this.castle.x, this.castle.y, this.castle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw castle health bar
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(
            this.castle.x - 25,
            this.castle.y - 40,
            50 * (this.castle.health / this.castle.maxHealth),
            5
        );

        // Draw range indicator when not in round
        if (!this.roundActive) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.arc(this.castle.x, this.castle.y, this.castle.range, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Draw projectiles with effects
        this.arrows.forEach(arrow => {
            this.ctx.save();
            this.ctx.translate(arrow.x, arrow.y);
            this.ctx.rotate(Math.atan2(arrow.dy, arrow.dx));

            // Add advanced weapon effects
            if (this.advancedWeapons[arrow.type]) {
                switch (arrow.type) {
                    case 'ballista':
                        // Large arrow with trailing effect
                        this.ctx.fillStyle = '#e67e22';
                        this.ctx.beginPath();
                        this.ctx.moveTo(-15, -4);
                        this.ctx.lineTo(15, 0);
                        this.ctx.lineTo(-15, 4);
                        this.ctx.closePath();
                        this.ctx.fill();

                        // Add trailing effect
                        this.ctx.strokeStyle = 'rgba(230, 126, 34, 0.5)';
                        this.ctx.lineWidth = 2;
                        for (let i = 1; i <= 3; i++) {
                            this.ctx.beginPath();
                            this.ctx.moveTo(-15 - i * 10, 0);
                            this.ctx.lineTo(-15 - i * 10 - 10, 0);
                            this.ctx.stroke();
                        }
                        break;

                    case 'catapult':
                        // Boulder with fire effect
                        this.ctx.fillStyle = '#7f8c8d';
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
                        this.ctx.fill();

                        // Fire particles
                        const particleCount = 5;
                        this.ctx.fillStyle = '#e74c3c';
                        for (let i = 0; i < particleCount; i++) {
                            const angle = (Date.now() / 100 + i * Math.PI * 2 / particleCount) % (Math.PI * 2);
                            const x = Math.cos(angle) * 12;
                            const y = Math.sin(angle) * 12;
                            this.ctx.beginPath();
                            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                            this.ctx.fill();
                        }
                        break;

                    case 'lightning':
                        // Lightning bolt effect
                        this.ctx.strokeStyle = '#3498db';
                        this.ctx.lineWidth = 2;
                        this.ctx.beginPath();

                        // Create zigzag pattern
                        this.ctx.moveTo(-15, 0);
                        for (let i = -10; i <= 15; i += 5) {
                            const offset = Math.sin(Date.now() / 50 + i) * 3;
                            this.ctx.lineTo(i, offset);
                        }
                        this.ctx.stroke();

                        // Add glow effect
                        this.ctx.shadowColor = '#3498db';
                        this.ctx.shadowBlur = 10;
                        this.ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
                        this.ctx.lineWidth = 4;
                        this.ctx.stroke();
                        break;
                }
            } else {
                if (arrow.type === 'cannon') {
                    this.ctx.fillStyle = '#e74c3c';
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Add blast wave effect if upgraded
                    if (this.castle.weapons.cannon.upgrades.blast.level > 0) {
                        this.ctx.strokeStyle = this.projectileEffects.cannon.blast.color;
                        this.ctx.lineWidth = 2;
                        this.ctx.beginPath();
                        for (let i = 0; i < 3; i++) {
                            this.ctx.arc(0, 0, 8 + i * 4, 0, Math.PI * 2);
                        }
                        this.ctx.stroke();
                    }
                } else if (arrow.type === 'magic') {
                    const frost = this.castle.weapons.magic.upgrades.frost.level;
                    const chain = this.castle.weapons.magic.upgrades.chain.level;

                    // Base magic projectile
                    this.ctx.fillStyle = '#9b59b6';
                    this.ctx.beginPath();
                    this.ctx.moveTo(-5, -5);
                    this.ctx.lineTo(5, 0);
                    this.ctx.lineTo(-5, 5);
                    this.ctx.lineTo(-5, -5);
                    this.ctx.fill();

                    // Add frost effect
                    if (frost > 0) {
                        this.ctx.strokeStyle = this.projectileEffects.magic.frost.color;
                        this.ctx.lineWidth = 1;
                        for (let i = 0; i < frost; i++) {
                            const angle = (Date.now() / 200 + i * Math.PI / 3) % (Math.PI * 2);
                            this.ctx.beginPath();
                            this.ctx.moveTo(0, 0);
                            this.ctx.lineTo(Math.cos(angle) * 10, Math.sin(angle) * 10);
                            this.ctx.stroke();
                        }
                    }

                    // Add chain lightning effect
                    if (chain > 0) {
                        this.ctx.strokeStyle = this.projectileEffects.magic.chain.color;
                        this.ctx.lineWidth = 2;
                        const time = Date.now() / 100;
                        this.ctx.beginPath();
                        this.ctx.moveTo(-5, 0);
                        for (let i = 0; i < 5; i++) {
                            const x = i * 3;
                            const y = Math.sin(time + i) * 3;
                            this.ctx.lineTo(x, y);
                        }
                        this.ctx.stroke();
                    }
                } else {
                    // Arrow projectiles
                    const power = this.castle.weapons.arrows.upgrades.power.level;
                    const rapid = this.castle.weapons.arrows.upgrades.rapid.level;

                    // Power arrows effect
                    if (power > 0) {
                        this.ctx.fillStyle = this.projectileEffects.arrows.power.color;
                        this.ctx.beginPath();
                        this.ctx.moveTo(-12, -3);
                        this.ctx.lineTo(12, 0);
                        this.ctx.lineTo(-12, 3);
                        this.ctx.fill();

                        // Add glow effect
                        this.ctx.shadowColor = this.projectileEffects.arrows.power.color;
                        this.ctx.shadowBlur = 5 + power * 2;
                    }

                    // Rapid fire effect
                    if (rapid > 0) {
                        this.ctx.strokeStyle = this.projectileEffects.arrows.rapid.color;
                        this.ctx.lineWidth = 1;
                        for (let i = 1; i <= rapid; i++) {
                            this.ctx.beginPath();
                            this.ctx.moveTo(-15 - i * 3, 0);
                            this.ctx.lineTo(-10 - i * 3, 0);
                            this.ctx.stroke();
                        }
                    }

                    // Base arrow
                    this.ctx.fillStyle = power > 0 ? this.projectileEffects.arrows.power.color : '#f1c40f';
                    this.ctx.beginPath();
                    this.ctx.moveTo(-10, -2);
                    this.ctx.lineTo(10, 0);
                    this.ctx.lineTo(-10, 2);
                    this.ctx.fill();
                }
            }

            this.ctx.restore();
        });

        // Draw enemies with health bars
        this.enemies.forEach(enemy => {
            // Enemy body
            this.ctx.fillStyle = enemy.color;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
            this.ctx.fill();

            // Health bar
            const healthWidth = enemy.size * 1.5;
            this.ctx.fillStyle = '#c0392b';
            this.ctx.fillRect(enemy.x - healthWidth / 2, enemy.y - enemy.size, healthWidth, 4);
            this.ctx.fillStyle = '#27ae60';
            this.ctx.fillRect(
                enemy.x - healthWidth / 2,
                enemy.y - enemy.size,
                healthWidth * (enemy.health / enemy.maxHealth),
                4
            );
        });

        // Draw units
        Object.entries(this.castle.units).forEach(([type, unitType]) => {
            unitType.instances.forEach(unit => {
                if (type === 'knights') {
                    // Draw knight
                    this.ctx.fillStyle = '#d35400';
                    this.ctx.beginPath();
                    this.ctx.arc(unit.x, unit.y, 12, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Draw sword/direction indicator
                    this.ctx.strokeStyle = '#c0392b';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(unit.x, unit.y);
                    this.ctx.lineTo(
                        unit.x + Math.cos(unit.lastAngle || 0) * 15,
                        unit.y + Math.sin(unit.lastAngle || 0) * 15
                    );
                    this.ctx.stroke();
                } else {
                    // Draw archers (unchanged)
                    this.ctx.fillStyle = '#27ae60';
                    this.ctx.beginPath();
                    this.ctx.arc(unit.x, unit.y, 10, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });
        });

        // Draw attack animations
        this.animations.forEach(anim => {
            if (anim.type === 'knightAttack') {
                const progress = (Date.now() - anim.startTime) / anim.duration;
                this.ctx.strokeStyle = `rgba(231, 76, 60, ${1 - progress})`;
                this.ctx.lineWidth = 2;

                // Draw slash effect
                this.ctx.beginPath();
                const angle = Math.atan2(anim.targetY - anim.y, anim.targetX - anim.x);
                const radius = 20;
                const startAngle = angle - Math.PI / 4;
                const endAngle = angle + Math.PI / 4;

                this.ctx.arc(anim.x, anim.y, radius,
                    startAngle + progress * Math.PI / 2,
                    endAngle + progress * Math.PI / 2
                );
                this.ctx.stroke();
            }
        });

        // Draw explosion animations
        this.animations = this.animations.filter(anim => {
            const progress = (Date.now() - anim.startTime) / anim.duration;
            if (progress >= 1) return false;

            if (anim.type === 'cannonImpact') {
                // Stun effect animation
                this.ctx.strokeStyle = `rgba(211, 84, 0, ${1 - progress})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(anim.x, anim.y, anim.radius * progress, 0, Math.PI * 2);
                this.ctx.stroke();

                // Stun stars
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 + progress * Math.PI;
                    const x = anim.x + Math.cos(angle) * anim.radius * progress;
                    const y = anim.y + Math.sin(angle) * anim.radius * progress;
                    this.ctx.fillStyle = '#f1c40f';
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            } else if (anim.type === 'magicChain') {
                // Lightning chain effect
                this.ctx.strokeStyle = `rgba(155, 89, 182, ${1 - progress})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(anim.startX, anim.startY);

                // Create zigzag pattern
                const dx = anim.endX - anim.startX;
                const dy = anim.endY - anim.startY;
                const segments = 5;
                for (let i = 1; i <= segments; i++) {
                    const t = i / segments;
                    const x = anim.startX + dx * t;
                    const y = anim.startY + dy * t;
                    const offset = Math.sin(t * Math.PI * 4) * 10 * (1 - progress);
                    this.ctx.lineTo(x + offset, y + offset);
                }

                this.ctx.stroke();
            } else if (anim.type === 'ballistaImpact') {
                // Pierce effect
                this.ctx.strokeStyle = `rgba(230, 126, 34, ${1 - progress})`;
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(anim.x - anim.dx * 20, anim.y - anim.dy * 20);
                this.ctx.lineTo(anim.x + anim.dx * 20, anim.y + anim.dy * 20);
                this.ctx.stroke();
            } else if (anim.type === 'catapultImpact') {
                // Explosion effect
                const radius = anim.radius * progress;
                this.ctx.fillStyle = `rgba(231, 76, 60, ${1 - progress})`;
                this.ctx.beginPath();
                this.ctx.arc(anim.x, anim.y, radius, 0, Math.PI * 2);
                this.ctx.fill();

                // Fire particles
                for (let i = 0; i < 8; i++) {
                    const angle = i * Math.PI / 4 + progress * Math.PI;
                    const distance = radius * 0.8;
                    const x = anim.x + Math.cos(angle) * distance;
                    const y = anim.y + Math.sin(angle) * distance;

                    this.ctx.fillStyle = `rgba(230, 126, 34, ${1 - progress})`;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 4, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            } else if (anim.type === 'lightningImpact') {
                // Lightning strike effect
                this.ctx.strokeStyle = `rgba(52, 152, 219, ${1 - progress})`;
                this.ctx.lineWidth = 3;

                // Multiple lightning bolts
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2 + progress * Math.PI;
                    const length = 30 * (1 - progress);

                    this.ctx.beginPath();
                    this.ctx.moveTo(anim.x, anim.y);

                    // Create zigzag pattern
                    let x = anim.x + Math.cos(angle) * length;
                    let y = anim.y + Math.sin(angle) * length;
                    const segments = 3;
                    for (let j = 1; j <= segments; j++) {
                        const t = j / segments;
                        const offset = Math.sin(t * Math.PI * 4) * 5 * (1 - progress);
                        const px = anim.x + Math.cos(angle) * length * t + Math.cos(angle + Math.PI / 2) * offset;
                        const py = anim.y + Math.sin(angle) * length * t + Math.sin(angle + Math.PI / 2) * offset;
                        this.ctx.lineTo(px, py);
                    }

                    this.ctx.stroke();
                }
            }

            return true;
        });

        // Restore canvas context if scaled
        if (this.castleExpanded) {
            this.ctx.restore();
        }

        // Add drawing code for advanced units
        if (this.castleExpanded) {
            Object.entries(this.advancedUnits).forEach(([type, unitType]) => {
                unitType.instances.forEach(unit => {
                    if (type === 'crossbowmen') {
                        this.ctx.fillStyle = '#2980b9';
                        this.ctx.beginPath();
                        this.ctx.arc(unit.x, unit.y, 12, 0, Math.PI * 2);
                        this.ctx.fill();
                    } else if (type === 'cavalry') {
                        this.ctx.fillStyle = '#e67e22';
                        this.ctx.beginPath();
                        this.ctx.arc(unit.x, unit.y, 15, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                });
            });
        }
    }

    resetGame() {
        this.castle.health = this.castle.maxHealth;
        this.enemies = [];
        this.gold = 200;
        this.roundActive = false;
        this.roundTimer = 0;
        this.wave = 1;
        this.kills = 0;
        this.arrows = [];
        this.timerDisplay.textContent = 'Time: 1:00';
        this.updateUI();
        Object.values(this.castle.units).forEach(unitType => {
            unitType.instances = [];
        });
    }

    findNearestEnemy() {
        let nearest = null;
        let nearestDist = Infinity;

        this.enemies.forEach(enemy => {
            const dist = Math.sqrt(Math.pow(enemy.x - this.castle.x, 2) + Math.pow(enemy.y - this.castle.y, 2));
            if (dist < nearestDist) {
                nearest = enemy;
                nearestDist = dist;
            }
        });

        return nearest;
    }

    endRound() {
        this.roundActive = false;
        this.wave++;
        this.enemies = []; // Clear remaining enemies
        this.arrows = []; // Clear remaining arrows
        this.updateUI();
    }

    createWeaponUI() {
        const weaponDescriptions = {
            arrows: {
                base: "Basic arrows that deal moderate damage",
                rapid: "Increases attack speed by 20% per level",
                power: "Increases arrow damage by 30% per level"
            },
            cannon: {
                base: "Powerful cannon that deals splash damage",
                blast: "Increases splash radius by 15 units per level",
                impact: "Stuns enemies for 1 second per level"
            },
            magic: {
                base: "Magic attacks that slow enemies",
                frost: "Increases slow effect by 10% per level",
                chain: "Hits additional targets per level"
            }
        };

        const weaponDiv = document.createElement('div');
        weaponDiv.className = 'upgrade-section';
        weaponDiv.innerHTML = `
            <h3>Weapons</h3>
            <div class="weapon-section">
                <div class="weapon-type">
                    <div class="tooltip">
                        <button id="upgradeArrows" class="${this.castle.weapons.arrows.level > 0 ? 'purchased' : ''}">
                            Upgrade Arrows (${this.castle.weapons.arrows.cost}g)
                            ${this.castle.weapons.arrows.level > 0 ? `<div class="level-indicator">${this.castle.weapons.arrows.level}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${weaponDescriptions.arrows.base}</span>
                    </div>
                    <div class="tooltip">
                        <button id="upgradeArrowsRapid" class="${this.castle.weapons.arrows.upgrades.rapid.level > 0 ? 'purchased' : ''}">
                            Rapid Fire (${this.castle.weapons.arrows.upgrades.rapid.cost}g)
                            ${this.castle.weapons.arrows.upgrades.rapid.level > 0 ? `<div class="level-indicator">${this.castle.weapons.arrows.upgrades.rapid.level}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${weaponDescriptions.arrows.rapid}<br>Max Level: ${this.castle.weapons.arrows.upgrades.rapid.maxLevel}</span>
                    </div>
                    <div class="tooltip">
                        <button id="upgradeArrowsPower" class="${this.castle.weapons.arrows.upgrades.power.level > 0 ? 'purchased' : ''}">
                            Heavy Arrows (${this.castle.weapons.arrows.upgrades.power.cost}g)
                            ${this.castle.weapons.arrows.upgrades.power.level > 0 ? `<div class="level-indicator">${this.castle.weapons.arrows.upgrades.power.level}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${weaponDescriptions.arrows.power}<br>Max Level: ${this.castle.weapons.arrows.upgrades.power.maxLevel}</span>
                    </div>
                </div>
                <div class="weapon-type">
                    <div class="tooltip">
                        <button id="unlockCannon" class="${this.castle.weapons.cannon.level > 0 ? 'purchased' : ''}">
                            Unlock Cannon (${this.castle.weapons.cannon.cost}g)
                            ${this.castle.weapons.cannon.level > 0 ? `<div class="level-indicator">${this.castle.weapons.cannon.level}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${weaponDescriptions.cannon.base}</span>
                    </div>
                    <div class="tooltip">
                        <button id="upgradeCannonBlast" class="${this.castle.weapons.cannon.upgrades.blast.level > 0 ? 'purchased' : ''}">
                            Bigger Blast (${this.castle.weapons.cannon.upgrades.blast.cost}g)
                            ${this.castle.weapons.cannon.upgrades.blast.level > 0 ? `<div class="level-indicator">${this.castle.weapons.cannon.upgrades.blast.level}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${weaponDescriptions.cannon.blast}<br>Max Level: ${this.castle.weapons.cannon.upgrades.blast.maxLevel}</span>
                    </div>
                    <div class="tooltip">
                        <button id="upgradeCannonImpact" class="${this.castle.weapons.cannon.upgrades.impact.level > 0 ? 'purchased' : ''}">
                            Stunning Impact (${this.castle.weapons.cannon.upgrades.impact.cost}g)
                            ${this.castle.weapons.cannon.upgrades.impact.level > 0 ? `<div class="level-indicator">${this.castle.weapons.cannon.upgrades.impact.level}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${weaponDescriptions.cannon.impact}<br>Max Level: ${this.castle.weapons.cannon.upgrades.impact.maxLevel}</span>
                    </div>
                </div>
                <div class="weapon-type">
                    <div class="tooltip">
                        <button id="unlockMagic" class="${this.castle.weapons.magic.level > 0 ? 'purchased' : ''}">
                            Unlock Magic (${this.castle.weapons.magic.cost}g)
                            ${this.castle.weapons.magic.level > 0 ? `<div class="level-indicator">${this.castle.weapons.magic.level}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${weaponDescriptions.magic.base}</span>
                    </div>
                    <div class="tooltip">
                        <button id="upgradeMagicFrost" class="${this.castle.weapons.magic.upgrades.frost.level > 0 ? 'purchased' : ''}">
                            Deep Freeze (${this.castle.weapons.magic.upgrades.frost.cost}g)
                            ${this.castle.weapons.magic.upgrades.frost.level > 0 ? `<div class="level-indicator">${this.castle.weapons.magic.upgrades.frost.level}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${weaponDescriptions.magic.frost}<br>Max Level: ${this.castle.weapons.magic.upgrades.frost.maxLevel}</span>
                    </div>
                    <div class="tooltip">
                        <button id="upgradeMagicChain" class="${this.castle.weapons.magic.upgrades.chain.level > 0 ? 'purchased' : ''}">
                            Chain Magic (${this.castle.weapons.magic.upgrades.chain.cost}g)
                            ${this.castle.weapons.magic.upgrades.chain.level > 0 ? `<div class="level-indicator">${this.castle.weapons.magic.upgrades.chain.level}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${weaponDescriptions.magic.chain}<br>Max Level: ${this.castle.weapons.magic.upgrades.chain.maxLevel}</span>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('ui').appendChild(weaponDiv);

        // Add event listeners
        const weapons = ['arrows', 'cannon', 'magic'];
        weapons.forEach(weapon => {
            const baseId = weapon === 'arrows' ? 'upgradeArrows' : `unlock${weapon.charAt(0).toUpperCase() + weapon.slice(1)}`;
            document.getElementById(baseId).addEventListener('click', () => this.upgradeWeapon(weapon));

            Object.keys(this.castle.weapons[weapon].upgrades).forEach(upgrade => {
                const btnId = `upgrade${weapon.charAt(0).toUpperCase() + weapon.slice(1)}${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)}`;
                document.getElementById(btnId).addEventListener('click', () => this.upgradeWeaponAbility(weapon, upgrade));
            });
        });
    }

    createUnitUI() {
        const unitDescriptions = {
            archers: {
                base: "Ranged unit that attacks nearby enemies",
                multishot: "Fires additional arrows per level",
                piercing: "Arrows pierce through additional enemies per level"
            },
            knights: {
                base: "Melee unit that engages enemies directly",
                armor: "Reduces castle damage by 15% per level when nearby",
                charge: "Increases movement speed by 50% per level"
            }
        };

        const unitDiv = document.createElement('div');
        unitDiv.className = 'upgrade-section';
        unitDiv.innerHTML = `
            <h3>Units</h3>
            <div class="unit-section">
                <div class="unit-type">
                    <div class="tooltip">
                        <button id="hireArcher" class="${this.castle.units.archers.instances.length > 0 ? 'purchased' : ''}">
                            Hire Archer (${this.castle.units.archers.cost}g)
                            ${this.castle.units.archers.instances.length > 0 ? `<div class="level-indicator">${this.castle.units.archers.instances.length}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${unitDescriptions.archers.base}</span>
                    </div>
                    <div class="tooltip">
                        <button id="upgradeArcherMultishot" class="${this.castle.units.archers.upgrades.multishot.level > 0 ? 'purchased' : ''}">
                            Multishot (${this.castle.units.archers.upgrades.multishot.cost}g)
                            ${this.castle.units.archers.upgrades.multishot.level > 0 ? `<div class="level-indicator">${this.castle.units.archers.upgrades.multishot.level}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${unitDescriptions.archers.multishot}<br>Max Level: ${this.castle.units.archers.upgrades.multishot.maxLevel}</span>
                    </div>
                    <div class="tooltip">
                        <button id="upgradeArcherPiercing" class="${this.castle.units.archers.upgrades.piercing.level > 0 ? 'purchased' : ''}">
                            Piercing Arrows (${this.castle.units.archers.upgrades.piercing.cost}g)
                            ${this.castle.units.archers.upgrades.piercing.level > 0 ? `<div class="level-indicator">${this.castle.units.archers.upgrades.piercing.level}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${unitDescriptions.archers.piercing}<br>Max Level: ${this.castle.units.archers.upgrades.piercing.maxLevel}</span>
                    </div>
                </div>
                <div class="unit-type">
                    <div class="tooltip">
                        <button id="hireKnight" class="${this.castle.units.knights.instances.length > 0 ? 'purchased' : ''}">
                            Hire Knight (${this.castle.units.knights.cost}g)
                            ${this.castle.units.knights.instances.length > 0 ? `<div class="level-indicator">${this.castle.units.knights.instances.length}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${unitDescriptions.knights.base}</span>
                    </div>
                    <div class="tooltip">
                        <button id="upgradeKnightArmor" class="${this.castle.units.knights.upgrades.armor.level > 0 ? 'purchased' : ''}">
                            Heavy Armor (${this.castle.units.knights.upgrades.armor.cost}g)
                            ${this.castle.units.knights.upgrades.armor.level > 0 ? `<div class="level-indicator">${this.castle.units.knights.upgrades.armor.level}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${unitDescriptions.knights.armor}<br>Max Level: ${this.castle.units.knights.upgrades.armor.maxLevel}</span>
                    </div>
                    <div class="tooltip">
                        <button id="upgradeKnightCharge" class="${this.castle.units.knights.upgrades.charge.level > 0 ? 'purchased' : ''}">
                            Battle Charge (${this.castle.units.knights.upgrades.charge.cost}g)
                            ${this.castle.units.knights.upgrades.charge.level > 0 ? `<div class="level-indicator">${this.castle.units.knights.upgrades.charge.level}</div>` : ''}
                        </button>
                        <span class="tooltiptext">${unitDescriptions.knights.charge}<br>Max Level: ${this.castle.units.knights.upgrades.charge.maxLevel}</span>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('ui').appendChild(unitDiv);

        // Add event listeners
        document.getElementById('hireArcher').addEventListener('click', () => this.hireUnit('archers'));
        document.getElementById('hireKnight').addEventListener('click', () => this.hireUnit('knights'));
        document.getElementById('upgradeArcherMultishot').addEventListener('click', () => this.upgradeUnit('archers', 'multishot'));
        document.getElementById('upgradeArcherPiercing').addEventListener('click', () => this.upgradeUnit('archers', 'piercing'));
        document.getElementById('upgradeKnightArmor').addEventListener('click', () => this.upgradeUnit('knights', 'armor'));
        document.getElementById('upgradeKnightCharge').addEventListener('click', () => this.upgradeUnit('knights', 'charge'));
    }

    upgradeWeapon(type) {
        const weapon = this.castle.weapons[type];
        if (this.gold >= weapon.cost) {
            this.gold -= weapon.cost;
            // Initialize lastAttack if this is the first upgrade
            if (weapon.level === 0) {
                weapon.lastAttack = Date.now();
            }
            weapon.level++;
            weapon.damage += weapon.damage * 0.2;
            weapon.cost = Math.floor(weapon.cost * 1.5);
            this.updateUI();
        }
    }

    upgradeWeaponAbility(weaponType, upgrade) {
        const weapon = this.castle.weapons[weaponType];
        const upgradeInfo = weapon.upgrades[upgrade];

        if (this.gold >= upgradeInfo.cost && upgradeInfo.level < upgradeInfo.maxLevel) {
            this.gold -= upgradeInfo.cost;
            upgradeInfo.level++;
            upgradeInfo.cost = Math.floor(upgradeInfo.cost * 1.5);

            // Update button appearance
            const btnId = `upgrade${weaponType.charAt(0).toUpperCase() + weaponType.slice(1)}${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)}`;
            const btn = document.getElementById(btnId);

            // Add or update level indicator
            let levelIndicator = btn.querySelector('.level-indicator');
            if (!levelIndicator) {
                levelIndicator = document.createElement('div');
                levelIndicator.className = 'level-indicator';
                btn.appendChild(levelIndicator);
            }
            levelIndicator.textContent = upgradeInfo.level;

            // Add purchased class if not already present
            if (!btn.classList.contains('purchased')) {
                btn.classList.add('purchased');
            }

            // Update button text to show next level cost
            btn.innerHTML = `${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)} (${upgradeInfo.cost}g)`;
            if (upgradeInfo.level > 0) {
                btn.appendChild(levelIndicator);
            }

            // Disable button if max level reached
            if (upgradeInfo.level >= upgradeInfo.maxLevel) {
                btn.disabled = true;
                btn.innerHTML = `${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)} (MAX)`;
                btn.appendChild(levelIndicator);
            }

            this.updateUI();
        }
    }

    hireUnit(type) {
        const unitType = this.castle.units[type];
        if (this.gold >= unitType.cost) {
            this.gold -= unitType.cost;

            const angle = Math.random() * Math.PI * 2;
            const distance = this.castle.size + 20;
            const newUnit = {
                x: Math.max(0, Math.min(this.canvas.width, this.castle.x + Math.cos(angle) * distance)),
                y: Math.max(0, Math.min(this.canvas.height, this.castle.y + Math.sin(angle) * distance)),
                lastAttack: Date.now(),
                lastAngle: angle // Add this for knight direction
            };

            unitType.instances.push(newUnit);
            this.updateUI();
        }
    }

    upgradeUnit(unitType, upgrade) {
        const unit = this.castle.units[unitType];
        const upgradeInfo = unit.upgrades[upgrade];

        if (this.gold >= upgradeInfo.cost && upgradeInfo.level < upgradeInfo.maxLevel) {
            this.gold -= upgradeInfo.cost;
            upgradeInfo.level++;
            upgradeInfo.cost = Math.floor(upgradeInfo.cost * 1.5);

            // Update button appearance
            const btnId = `upgrade${unitType.charAt(0).toUpperCase() + unitType.slice(1)}${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)}`;
            const btn = document.getElementById(btnId);

            // Add or update level indicator
            let levelIndicator = btn.querySelector('.level-indicator');
            if (!levelIndicator) {
                levelIndicator = document.createElement('div');
                levelIndicator.className = 'level-indicator';
                btn.appendChild(levelIndicator);
            }
            levelIndicator.textContent = upgradeInfo.level;

            // Add purchased class if not already present
            if (!btn.classList.contains('purchased')) {
                btn.classList.add('purchased');
            }

            // Update button text to show next level cost
            btn.innerHTML = `${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)} (${upgradeInfo.cost}g)`;
            if (upgradeInfo.level > 0) {
                btn.appendChild(levelIndicator);
            }

            // Disable button if max level reached
            if (upgradeInfo.level >= upgradeInfo.maxLevel) {
                btn.disabled = true;
                btn.innerHTML = `${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)} (MAX)`;
                btn.appendChild(levelIndicator);
            }

            this.updateUI();
        }
    }

    fireProjectile(type, target) {
        // Update the fireProjectile method to handle advanced weapons
        const weapon = this.advancedWeapons[type] || this.castle.weapons[type];
        const angle = Math.atan2(target.y - this.castle.y, target.x - this.castle.x);

        this.arrows.push({
            x: this.castle.x,
            y: this.castle.y,
            dx: Math.cos(angle),
            dy: Math.sin(angle),
            speed: weapon.projectileSpeed,
            type: type,
            damage: weapon.damage
        });
    }

    handleProjectileCollision(projectile, enemy) {
        if (this.advancedWeapons[projectile.type]) {
            // Handle advanced weapons like ballista, catapult, lightning...
            const weapon = this.advancedWeapons[projectile.type];
            switch (projectile.type) {
                case 'ballista':
                    enemy.health -= weapon.damage;
                    // Add pierce animation or effects if needed
                    this.animations.push({
                        type: 'ballistaImpact',
                        x: enemy.x,
                        y: enemy.y,
                        dx: projectile.dx,
                        dy: projectile.dy,
                        startTime: Date.now(),
                        duration: 300
                    });
                    break;
                case 'catapult':
                    const splashRadius = weapon.splash;
                    // Apply splash damage
                    this.enemies.forEach(e => {
                        const dx = e.x - enemy.x;
                        const dy = e.y - enemy.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance <= splashRadius) {
                            e.health -= weapon.damage * (1 - distance / splashRadius);
                            // Apply stun if upgraded
                            if (weapon.upgrades.impact.level > 0) {
                                e.stunned = Date.now() + (weapon.upgrades.impact.stunDuration * weapon.upgrades.impact.level);
                            }
                        }
                    });
                    // Add explosion animation
                    this.animations.push({
                        type: 'catapultImpact',
                        x: enemy.x,
                        y: enemy.y,
                        radius: splashRadius,
                        startTime: Date.now(),
                        duration: 500
                    });
                    break;
                case 'lightning':
                    enemy.health -= weapon.damage;
                    // Add lightning strike animation
                    this.animations.push({
                        type: 'lightningImpact',
                        x: enemy.x,
                        y: enemy.y,
                        startTime: Date.now(),
                        duration: 400
                    });
                    break;
                default:
                    break;
            }
        } else {
            // Handle existing weapon types...
            if (projectile.type === 'unit_arrow') {
                enemy.health -= projectile.damage;
                // Handle piercing if applicable
                return projectile.piercing > 0 ? (projectile.piercing--, true) : false;
            } else if (projectile.type === 'advanced_unit_arrow') { // Added condition
                enemy.health -= projectile.damage;
    
                // Apply splash damage if applicable
                if (projectile.splash > 0) {
                    this.enemies.forEach(e => {
                        if (e !== enemy) {
                            const dx = e.x - enemy.x;
                            const dy = e.y - enemy.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            if (distance <= projectile.splash) {
                                e.health -= projectile.damage * 0.5; // Example splash damage
                            }
                        }
                    });
                }
    
                // Add explosion animation if splash exists
                if (projectile.splash > 0) {
                    this.animations.push({
                        type: 'advancedUnitExplosion',
                        x: enemy.x,
                        y: enemy.y,
                        radius: projectile.splash,
                        startTime: Date.now(),
                        duration: 500
                    });
                }
    
                // Remove the projectile after collision
                return false;
            } else {
                // Handle regular arrows...
                const weapon = this.castle.weapons[projectile.type];
                if (projectile.type === 'cannon') {
                    const splashRadius = weapon.splash + (weapon.upgrades.blast.level * weapon.upgrades.blast.splashBoost);
                    this.enemies.forEach(e => {
                        const dx = e.x - enemy.x;
                        const dy = e.y - enemy.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance <= splashRadius) {
                            e.health -= weapon.damage * (1 - distance / splashRadius);
                            // Apply stun if upgraded
                            if (weapon.upgrades.impact.level > 0) {
                                e.stunned = Date.now() + (weapon.upgrades.impact.stunDuration * weapon.upgrades.impact.level);
                            }
                        }
                    });
                    // Add blast wave animation
                    this.animations.push({
                        type: 'cannonImpact',
                        x: enemy.x,
                        y: enemy.y,
                        radius: splashRadius,
                        startTime: Date.now(),
                        duration: 500
                    });
                } else if (projectile.type === 'magic') {
                    const totalSlow = weapon.slow + (weapon.upgrades.frost.level * weapon.upgrades.frost.slowBoost);
                    enemy.speed *= totalSlow;
                    enemy.health -= weapon.damage;
    
                    // Chain to additional targets if upgraded
                    if (weapon.upgrades.chain.level > 0) {
                        let remainingBounces = weapon.upgrades.chain.level * weapon.upgrades.chain.bounces;
                        let lastTarget = enemy;
                        while (remainingBounces > 0) {
                            const nextTarget = this.findNearestEnemyToPoint(lastTarget.x, lastTarget.y, [enemy]);
                            if (!nextTarget) break;
    
                            nextTarget.speed *= totalSlow;
                            nextTarget.health -= weapon.damage * 0.7; // Reduced damage for chain hits
                            lastTarget = nextTarget;
                            remainingBounces--;
                        }
                    }
                } else {
                    // Handle regular arrow with power upgrade
                    const damageBoost = 1 + (weapon.upgrades.power.level * weapon.upgrades.power.damageBoost);
                    enemy.health -= weapon.damage * damageBoost;
                }
            }
        }
    }
    

    findRandomEnemyInRange(x, y, range) {
        const enemiesInRange = this.enemies.filter(enemy => {
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= range;
        });

        if (enemiesInRange.length === 0) return null;
        return enemiesInRange[Math.floor(Math.random() * enemiesInRange.length)];
    }

    fireUnitProjectile(unit, target, unitType) {
        const multishot = unitType.upgrades.multishot.arrows;
        const spreadAngle = Math.PI / 6; // 30 degrees spread

        for (let i = 0; i < multishot; i++) {
            const baseAngle = Math.atan2(target.y - unit.y, target.x - unit.x);
            const angle = baseAngle + (spreadAngle * (i - (multishot - 1) / 2));

            this.arrows.push({
                x: unit.x,
                y: unit.y,
                dx: Math.cos(angle),
                dy: Math.sin(angle),
                speed: unitType.projectileSpeed,
                type: 'unit_arrow',
                damage: unitType.damage,
                piercing: unitType.upgrades.piercing.penetration
            });
        }
    }

    createSpeedControl() {
        const speedBtn = document.createElement('button');
        speedBtn.id = 'speedControl';
        speedBtn.className = 'speed-control';
        speedBtn.textContent = '1x Speed';

        speedBtn.addEventListener('click', () => {
            this.gameSpeed = (this.gameSpeed % 3) + 1;
            speedBtn.textContent = `${this.gameSpeed}x Speed`;
        });

        // Insert before the gold display
        const goldDisplay = document.getElementById('gold');
        goldDisplay.parentNode.insertBefore(speedBtn, goldDisplay);
    }

    // Add helper method for chain magic
    findNearestEnemyToPoint(x, y, excludeEnemies) {
        let nearest = null;
        let nearestDistance = 200; // Maximum chain distance

        for (const enemy of this.enemies) {
            if (excludeEnemies.includes(enemy)) continue;

            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < nearestDistance) {
                nearest = enemy;
                nearestDistance = distance;
            }
        }

        return nearest;
    }

    createCastleExpansionUI() {
        const expansionDiv = document.createElement('div');
        expansionDiv.className = 'upgrade-section';
        expansionDiv.innerHTML = `
            <div class="tooltip">
                <button id="expandCastle" class="expand-castle">
                    Expand Castle (30000g)
                </button>
                <span class="tooltiptext">Quadruple castle size and expand the battlefield. A massive upgrade that transforms your stronghold into an imposing fortress.</span>
            </div>
        `;
        document.getElementById('ui').appendChild(expansionDiv);

        document.getElementById('expandCastle').addEventListener('click', () => this.expandCastle());
    }

    expandCastle() {
        if (this.gold >= 30000 && !this.castleExpanded) {
            this.gold -= 30000;
            this.castleExpanded = true;
            this.worldScale = 0.25; // Scale everything down to 1/4 size

            // Store original canvas center
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;

            // Update button state
            const expandBtn = document.getElementById('expandCastle');
            expandBtn.disabled = true;
            expandBtn.classList.add('purchased');
            expandBtn.textContent = 'Castle Expanded';

            // Scale castle and range
            this.castle.size *= 4;
            this.castle.range *= 2; // Only double range to balance gameplay

            // Update the movement area radius for units (scale it by 4 like the castle size)
            this.movementAreaRadius *= 4;

            // Scale existing units and projectiles
            this.castle.units.archers.instances.forEach(archer => {
                archer.x = centerX + (archer.x - centerX) * 4;
                archer.y = centerY + (archer.y - centerY) * 4;
            });

            this.castle.units.knights.instances.forEach(knight => {
                knight.x = centerX + (knight.x - centerX) * 4;
                knight.y = centerY + (knight.y - centerY) * 4;
            });

            this.updateUI();

            // Create UI for advanced weapons and units
            this.createAdvancedWeaponUI();
            this.createAdvancedUnitUI();
        }
    }

    createAdvancedWeaponUI() {
        const weaponDescriptions = {
            ballista: {
                base: "Powerful long-range weapon that deals high single-target damage",
                multishot: "Fire additional projectiles per shot",
                range: "Increases attack range significantly"
            },
            catapult: {
                base: "Siege weapon that deals massive area damage",
                payload: "Creates burning ground that damages enemies over time",
                siege: "Increased damage to grouped enemies"
            },
            lightning: {
                base: "Magical tower that chains lightning between enemies",
                storm: "Creates a persistent lightning storm in an area",
                paralyze: "Chance to completely immobilize enemies"
            }
        };

        const advancedWeaponDiv = document.createElement('div');
        advancedWeaponDiv.className = 'upgrade-section advanced-section';
        advancedWeaponDiv.innerHTML = `
            <h3>Advanced Weapons</h3>
            <div class="weapon-section">
                ${Object.entries(this.advancedWeapons).map(([type, weapon]) => `
                    <div class="weapon-type">
                        <div class="tooltip">
                            <button id="unlock${type}" class="advanced-weapon ${weapon.level > 0 ? 'purchased' : ''}">
                                Unlock ${type.charAt(0).toUpperCase() + type.slice(1)} (${weapon.cost}g)
                                ${weapon.level > 0 ? `<div class="level-indicator">${weapon.level}</div>` : ''}
                            </button>
                            <span class="tooltiptext">${weaponDescriptions[type].base}</span>
                        </div>
                        ${Object.entries(weapon.upgrades).map(([upgrade, info]) => `
                            <div class="tooltip">
                                <button id="upgrade${type}${upgrade}" 
                                        class="advanced-weapon ${info.level > 0 ? 'purchased' : ''}"
                                        ${weapon.level === 0 ? 'disabled' : ''}>
                                    ${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)} (${info.cost}g)
                                    ${info.level > 0 ? `<div class="level-indicator">${info.level}</div>` : ''}
                                </button>
                                <span class="tooltiptext">${weaponDescriptions[type][upgrade]}<br>Max Level: ${info.maxLevel}</span>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;
        document.getElementById('ui').appendChild(advancedWeaponDiv);

        // Add event listeners
        Object.keys(this.advancedWeapons).forEach(type => {
            const unlockBtn = document.getElementById(`unlock${type}`);
            if (unlockBtn) {
                unlockBtn.addEventListener('click', () => {
                    console.log(`Attempting to unlock ${type}`); // Debug log
                    this.unlockAdvancedWeapon(type);
                });
            }

            Object.keys(this.advancedWeapons[type].upgrades).forEach(upgrade => {
                const upgradeBtn = document.getElementById(`upgrade${type}${upgrade}`);
                if (upgradeBtn) {
                    upgradeBtn.addEventListener('click', () => {
                        console.log(`Attempting to upgrade ${type} ${upgrade}`); // Debug log
                        this.upgradeAdvancedWeapon(type, upgrade);
                    });
                }
            });
        });
    }

    unlockAdvancedWeapon(type) {
        console.log(`Unlocking ${type}`, this.gold, this.advancedWeapons[type].cost); // Debug log
        const weapon = this.advancedWeapons[type];
        if (this.gold >= weapon.cost && weapon.level === 0) {
            this.gold -= weapon.cost;
            weapon.level = 1;

            // Update button appearance
            const btn = document.getElementById(`unlock${type}`);
            if (btn) {
                btn.classList.add('purchased');
                btn.innerHTML = `${type.charAt(0).toUpperCase() + type.slice(1)} (${weapon.cost}g) <div class="level-indicator">1</div>`;

                // Enable upgrade buttons for this weapon
                Object.keys(weapon.upgrades).forEach(upgrade => {
                    const upgradeBtn = document.getElementById(`upgrade${type}${upgrade}`);
                    if (upgradeBtn) {
                        upgradeBtn.disabled = false;
                    }
                });
            }

            this.updateUI();
        }
    }

    upgradeAdvancedWeapon(type, upgrade) {
        console.log(`Upgrading ${type} ${upgrade}`); // Debug log
        const weapon = this.advancedWeapons[type];
        const upgradeInfo = weapon.upgrades[upgrade];

        if (this.gold >= upgradeInfo.cost && upgradeInfo.level < upgradeInfo.maxLevel) {
            this.gold -= upgradeInfo.cost;
            upgradeInfo.level++;
            upgradeInfo.cost = Math.floor(upgradeInfo.cost * 1.5);

            // Update button appearance
            const btn = document.getElementById(`upgrade${type}${upgrade}`);
            if (btn) {
                btn.classList.add('purchased');
                let levelIndicator = btn.querySelector('.level-indicator');
                if (!levelIndicator) {
                    levelIndicator = document.createElement('div');
                    levelIndicator.className = 'level-indicator';
                    btn.appendChild(levelIndicator);
                }
                levelIndicator.textContent = upgradeInfo.level;

                if (upgradeInfo.level >= upgradeInfo.maxLevel) {
                    btn.disabled = true;
                    btn.innerHTML = `${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)} (MAX)`;
                    btn.appendChild(levelIndicator);
                } else {
                    btn.innerHTML = `${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)} (${upgradeInfo.cost}g)`;
                    btn.appendChild(levelIndicator);
                }
            }

            this.updateUI();
        }
    }

    createAdvancedUnitUI() {
        const unitDescriptions = {
            crossbowmen: {
                base: "Elite ranged unit with superior range and damage",
                scope: "Greatly increases attack range",
                explosive: "Arrows explode on impact"
            },
            cavalry: {
                base: "Mounted units that deal massive damage on impact",
                charge: "First attack deals double damage",
                trample: "Damages nearby enemies while moving"
            }
        };

        const advancedUnitDiv = document.createElement('div');
        advancedUnitDiv.className = 'upgrade-section advanced-section';
        advancedUnitDiv.innerHTML = `
            <h3>Advanced Units</h3>
            <div class="unit-section">
                ${Object.entries(this.advancedUnits).map(([type, unit]) => `
                    <div class="unit-type">
                        <div class="tooltip">
                            <button id="hire${type.charAt(0).toUpperCase() + type.slice(1)}" class="advanced-unit">
                                Hire ${type.charAt(0).toUpperCase() + type.slice(1)} (${unit.cost}g)
                                ${unit.instances.length > 0 ? `<div class="level-indicator">${unit.instances.length}</div>` : ''}
                            </button>
                            <span class="tooltiptext">${unitDescriptions[type].base}</span>
                        </div>
                        ${Object.entries(unit.upgrades).map(([upgrade, info]) => `
                            <div class="tooltip">
                                <button id="upgrade${type.charAt(0).toUpperCase() + type.slice(1)}${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)}" 
                                        class="advanced-unit ${info.level > 0 ? 'purchased' : ''}"
                                        ${unit.instances.length === 0 ? 'disabled' : ''}>
                                    ${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)} (${info.cost}g)
                                    ${info.level > 0 ? `<div class="level-indicator">${info.level}</div>` : ''}
                                </button>
                                <span class="tooltiptext">${unitDescriptions[type][upgrade]}<br>Max Level: ${info.maxLevel}</span>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;
        document.getElementById('ui').appendChild(advancedUnitDiv);

        // Add event listeners
        Object.keys(this.advancedUnits).forEach(type => {
            document.getElementById(`hire${type.charAt(0).toUpperCase() + type.slice(1)}`).addEventListener('click', () => this.hireAdvancedUnit(type));
            Object.keys(this.advancedUnits[type].upgrades).forEach(upgrade => {
                document.getElementById(`upgrade${type.charAt(0).toUpperCase() + type.slice(1)}${upgrade.charAt(0).toUpperCase() + upgrade.slice(1)}`).addEventListener('click', () => this.upgradeAdvancedUnit(type, upgrade));
            });
        });
    }

    createDevControls() {
        const devDiv = document.createElement('div');
        devDiv.className = 'upgrade-section dev-controls';
        devDiv.innerHTML = `
            <h3>Dev Controls</h3>
            <div class="dev-buttons">
                <button id="infiniteGold" class="dev-button">Toggle Infinite Gold</button>
                <div class="round-select">
                    <input type="number" id="roundInput" min="1" value="1" class="round-input">
                    <button id="setRound" class="dev-button">Set Round</button>
                </div>
            </div>
        `;
        document.getElementById('ui').appendChild(devDiv);

        // Infinite gold toggle
        let infiniteGoldEnabled = false;
        document.getElementById('infiniteGold').addEventListener('click', () => {
            infiniteGoldEnabled = !infiniteGoldEnabled;
            if (infiniteGoldEnabled) {
                this.gold = Infinity;
                document.getElementById('infiniteGold').classList.add('active');
            } else {
                this.gold = 200;
                document.getElementById('infiniteGold').classList.remove('active');
            }
            this.updateUI();
        });

        // Round selection
        document.getElementById('setRound').addEventListener('click', () => {
            const roundNum = parseInt(document.getElementById('roundInput').value);
            if (roundNum > 0) {
                this.wave = roundNum;
                this.updateUI();
                this.startRound();
            }
        });
    }

    hireAdvancedUnit(type) {
        const unit = this.advancedUnits[type];
        if (this.gold >= unit.cost) {
            this.gold -= unit.cost;
            unit.instances.push({
                x: Math.max(0, Math.min(this.canvas.width, this.castle.x + (Math.random() - 0.5) * this.castle.size * 2)),
                y: Math.max(0, Math.min(this.canvas.height, this.castle.y + (Math.random() - 0.5) * this.castle.size * 2)),
                lastAttack: 0
            });
            this.updateUI();
        }
    }

    upgradeAdvancedUnit(type, upgrade) {
        const unit = this.advancedUnits[type];
        const upgradeInfo = unit.upgrades[upgrade];
        if (this.gold >= upgradeInfo.cost && upgradeInfo.level < upgradeInfo.maxLevel) {
            this.gold -= upgradeInfo.cost;
            upgradeInfo.level++;
            upgradeInfo.cost = Math.floor(upgradeInfo.cost * 1.5);
            this.updateUI();
        }
    }

    // Add this method to the Game class
    attackNearestEnemy(weaponType, x, y) {
        // Find the nearest enemy to the given coordinates
        let nearestEnemy = null;
        let minDistance = Infinity;

        for (const enemy of this.enemies) {
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        }

        if (nearestEnemy) {
            // Get weapon data from castle or advanced weapons
            const weaponData = this.castle.weapons[weaponType] || this.advancedWeapons[weaponType];

            // Check if weapon exists and enemy is in range
            if (weaponData && minDistance <= weaponData.range) {
                // Calculate angle to target
                const angle = Math.atan2(nearestEnemy.y - y, nearestEnemy.x - x);

                // Create projectile
                this.arrows.push({
                    x: x,
                    y: y,
                    dx: Math.cos(angle),
                    dy: Math.sin(angle),
                    speed: weaponData.projectileSpeed,
                    type: weaponType,
                    damage: weaponData.damage,
                    // Include splash for weapons like cannon
                    splash: weaponData.splash || 0
                });
                return true; // Attack successful
            }
        }
        return false; // No valid target
    }

    // Add new methods for advanced units
    fireAdvancedUnitProjectile(unit, target, unitType) {
        const angle = Math.atan2(target.y - unit.y, target.x - unit.x);
        const damage = unitType.damage;

        this.arrows.push({
            x: unit.x,
            y: unit.y,
            dx: Math.cos(angle),
            dy: Math.sin(angle),
            speed: unitType.projectileSpeed,
            type: 'advanced_unit_arrow',
            damage: damage,
            splash: unitType.upgrades.explosive.level > 0 ? unitType.upgrades.explosive.splash : 0
        });
    }

    handleCavalryAttack(unit, target, unitType) {
        // Calculate damage with charge bonus if applicable
        let damage = unitType.damage;
        if (unitType.upgrades.charge.level > 0 && !unit.hasAttacked) {
            damage *= (1 + unitType.upgrades.charge.damageBoost);
            unit.hasAttacked = true;
        }

        // Apply damage to target
        target.health -= damage;

        // Handle trample effect
        if (unitType.upgrades.trample.level > 0) {
            const aoeSize = unitType.upgrades.trample.aoeSize * unitType.upgrades.trample.level;
            this.enemies.forEach(enemy => {
                if (enemy !== target) {
                    const dx = enemy.x - unit.x;
                    const dy = enemy.y - unit.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= aoeSize) {
                        enemy.health -= damage * 0.5; // Trample damage is 50% of normal damage
                    }
                }
            });
        }
    }
}

// Helper function to sort enemies by distance to castle
function getEnemiesByDistanceToCastle(game) {
    return [...game.enemies].sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.x - game.castle.x, 2) + Math.pow(a.y - game.castle.y, 2));
        const distB = Math.sqrt(Math.pow(b.x - game.castle.x, 2) + Math.pow(b.y - game.castle.y, 2));
        return distA - distB;
    });
}

// Start game when page loads
window.onload = () => new Game();
