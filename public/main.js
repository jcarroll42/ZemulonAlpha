var mainState = {
    preload: function() {

        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('laser', 'assets/laserblue3.png');
        game.load.image('ship', 'assets/player.png');
        game.load.image('enemy', 'assets/enemy2.png');
        game.load.image('striker', 'assets/newstriker2.png');
        game.load.image('sweeper', 'assets/sweeper3.png');
        game.load.image('laserPow', 'assets/laserPowerUp.png');
        game.load.image('spreadPow', 'assets/spreadPowerUp.png');
        game.load.image('spread', 'assets/spreadBullet.png');
        game.load.image('boss', 'assets/boss4.png');
        game.load.image('background', 'assets/starfield.png');
        game.load.image('player2', 'assets/player2.png');
        game.load.image('player3', 'assets/player3.png');
        game.load.image('bossLeft', 'assets/boss4left.png');
        game.load.image('bossRight', 'assets/boss4right.png');


    },
    boss: null,
    bossHealth: 500,
    move: null,
    bossOnScreen: false,  

    create: function() {
        score = 0;
        this.powerUpTypes = ['laserPow', 'spreadPow'];
        game.renderer.renderSession.roundPixels = true

        this.starfield = game.add.tileSprite(0,0,800,600, 'background');
        this.firingTimer = 0;
        this.livingEnemies = [];
        this.enemyTimer = 0;
        this.labelScore = 0;

        // start the game physics engine
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.enableBody = true;

        // the enemy's bullets
        this.enemyBullets = game.add.group();
        this.enemyBullets.enableBody = true;
        this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyBullets.createMultiple(30, 'bullet');
        this.enemyBullets.setAll('anchor.x', 0.5);
        this.enemyBullets.setAll('anchor.y', 1);
        this.enemyBullets.setAll('outOfBoundsKill', true);
        this.enemyBullets.setAll('checkWorldBounds', true);

        // create weapon with 30 bullets
        this.weapon = game.add.weapon(-1, 'bullet');
        

        // destroy bullets when they leave world bounds
        this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;

        // set bullet speed
        this.weapon.bulletSpeed = 400;

        //  set fire rate: 1 bullet every 60ms
        this.weapon.fireRate = 100;

        // add the actual player
        this.player = this.add.sprite(320, 500, 'ship');

        // enable physics on player sprite
        game.physics.arcade.enable(this.player);

        // tie weapon to player
        this.weapon.trackSprite(this.player, 26, 0);

        //boss wep
        this.bossWep = game.add.weapon(-1, 'bullet');
        this.bossWep.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.bossWep.bulletSpeed = 200;
        this.bossWep.fireRate = 300;
        this.bossWep.fireAngle = 90;
        this.bossWep.bulletAngleVariance = 40;

        // create input keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // set fire button to spacebar
        this.fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

        //create group for the enemies
        this.enemies = game.add.group();
        this.enemies.enableBody = true
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;

        // create striker enemy group
        this.strikers = game.add.group();
        this.strikers.enableBody = true;
        this.strikers.physicsBodyType = Phaser.Physics.ARCADE;

        // create sweeper enemy group
        this.sweepers = game.add.group();
        this.sweepers.enableBody = true;
        this.sweepers.physicsBodyType = Phaser.Physics.ARCADE;

        // create powerUps
        this.powerUps = game.add.group();
        this.powerUps.enableBody = true;
        this.powerUps.physicsBodyType = Phaser.Physics.ARCADE;

        // loop to add a new enemy every 1.5 seconds
        this.enemyTimer = game.time.events.loop(1500, this.addEnemy, this);

        // loop to add strikers
        this.strikerTimer = game.time.events.loop(3000, this.addStriker, this);

        // loop to add strikers
        this.sweeperTimer = game.time.events.loop(6000, this.addSweeper, this);

        // loop to add powerups
        this.powTimer = game.time.events.loop(15000, this.addPowerUp, this);

        // boss timer
        this.bossTimer = game.time.events.add(40000, this.bossFight, this);

        // set the scoreboard
        this.labelScore = game.add.text(20, 20, "0", 
        { font: "30px Arial", fill: "#ffffff" });  


    },

    update: function() {
       
        this.starfield.tilePosition.y += 2;

        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;

        //handles all movements
        if (this.cursors.left.isDown){
            this.player.loadTexture('player2');
            this.player.body.velocity.x = -200;
            //console.log(this.player);
        }
        else if (this.cursors.right.isDown){
            this.player.loadTexture('player3');
            this.player.body.velocity.x = 200;

        }
        else if(this.player.key != 'ship'){
            this.player.loadTexture('ship');
        }


        if (this.cursors.up.isDown){
            this.player.body.velocity.y = -200;
        }
        else if (this.cursors.down.isDown){
            this.player.body.velocity.y = 200;
        }

        //fire weapon
        if (this.fireButton.isDown){
            this.weapon.fire();
        }

        if (game.time.now > this.firingTimer){
            this.enemyFires();
        }

        if (this.bossOnScreen === true){
            this.bossWep.fire();
            if (this.boss.x === 420){
                this.boss.loadTexture('bossRight');
            }
            else if(this.boss.x === 30){
                this.boss.loadTexture('bossLeft');
            }
        }

        // call the 'hit' function when a bullet hits an enemy
        game.physics.arcade.collide(this.weapon.bullets, this.enemies, this.hit, null, this);
        game.physics.arcade.collide(this.weapon.bullets, this.strikers, this.hit, null, this);
        game.physics.arcade.collide(this.weapon.bullets, this.sweepers, this.hit, null, this);
        game.physics.arcade.collide(this.weapon.bullets, this.boss, this.bossHit, null, this);

        // call playerHit when an enemy bullet hits the player
        game.physics.arcade.collide(this.enemyBullets, this.player, this.playerHit, null, this);
        game.physics.arcade.collide(this.bossWep.bullets, this.player, this.playerHit, null, this);
        game.physics.arcade.collide(this.enemies, this.player, this.playerHit, null, this);
        game.physics.arcade.collide(this.strikers, this.player, this.playerHit, null, this);
        game.physics.arcade.collide(this.sweepers, this.player, this.playerHit, null, this);

        // call powerUpHit when powerup happens
        game.physics.arcade.collide(this.powerUps, this.player, this.weaponPowerUp, null, this);

    },
    // function that handles enemy destruction when player shoots them
    hit: function(bullets, enemy) {  
        enemy.kill();
        bullets.kill();
        score += 1;
        this.labelScore.text = score;
    },
    //function that handles when the player hits either an enemy or an enemy bullet
    playerHit: function(object, player){
        player.kill();
        object.kill();
        this.bossOnScreen = false;
        this.weapon.pauseAll();
        game.state.start('gameOver');
    },

    bossHit: function(boss, bullets){
        bullets.kill();
        this.boss.health = this.boss.health - 1;
        score += 1;
        this.labelScore.text = score;
        console.log(this.boss.health);

        if (this.boss.health == 0){
            this.boss.kill();
            game.state.start('gameOver');
        }
    },

    weaponPowerUp: function(player, powerUp){
        //console.log(powerUp.key);
        console.log(game.time.now);

        switch (powerUp.key){
            case 'laserPow':
                powerUp.kill();
                this.weapon.bulletKey = 'laser';
                this.weapon.bulletSpeed = 1000;
                this.weapon.fireRate = 1;
                break;
            case 'spreadPow':
                powerUp.kill();
                this.weapon.bulletKey = 'spread';
                this.weapon.bulletAngleVariance = 20;
                this.weapon.fireRate = 50;
                break;
            default:
                console.log(powerUp.key);

        }
        
        game.time.events.add(10000, mainState.resetWep, mainState);
    },

    render: function() {

        //weapon.debug();
        game.renderer.renderSession.roundPixels = true

    },

    resetWep: function(){
        //console.log('hi');
        console.log(game.time.now);
        this.weapon.bulletKey = 'bullet';
        this.weapon.bulletSpeed = 400;
        this.weapon.fireRate = 100;
        this.weapon.bulletAngleVariance = 0;
    },

    // function that handles how the enemies shoot
    enemyFires: function() {

        var that = this;
        //  get a bullet from enemy bullet pool
        var enemyBullet = this.enemyBullets.getFirstExists(false);

        this.livingEnemies.length = 0;

        this.enemies.forEachAlive(function(enemy){

            // put all the enemies in an array
            that.livingEnemies.push(enemy);
        });


        if (enemyBullet && this.livingEnemies.length > 0) {
             
            var random = game.rnd.integerInRange(0, this.livingEnemies.length - 1);

            // randomly select an enemy
            var shooter = this.livingEnemies[random];
            // fire bullet from selected enemy
            enemyBullet.reset(shooter.body.x + 30, shooter.body.y + 60);

            enemyBullet.body.velocity.y = 400;
            this.firingTimer = game.time.now + 400;
        }

    },

    // function that handles when an enemy gets added
    addEnemy: function(){
        var enemy = this.addObject('enemy');
        this.enemies.add(enemy);
        enemy.body.velocity.y = 200;
    },

    // function that handles when a striker enemy gets added
    // fast-moving enemy that 
    addStriker: function(){
        var striker = this.addObject('striker');
        this.strikers.add(striker);
        striker.anchor.setTo(0.5, 0.5);
        striker.rotation = game.physics.arcade.angleToXY(striker, this.player.x, this.player.y);
        game.physics.arcade.moveToObject(striker, this.player, 500);
    },

    // function that handles when a sweeper enemy gets added
    // sweeps across the screen and fires
    addSweeper: function(){
        var sweeper;
        var sweep;
        var horizTo;

        sweeper = this.addObject('sweeper');
        this.sweepers.add(sweeper);
        this.enemies.add(sweeper);
        sweep = game.add.tween(sweeper);


        if (sweeper.x > 400){
           horizTo = 100;
        }
        else{
            horizTo = 700;
        }

        sweep.to({ y: [150, 900], x: [horizTo]}, 4000, 'Linear');
        sweep.start();
    },

    addPowerUp: function(){
        var powerUpType = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
        var powerUp = this.addObject(powerUpType);
        this.powerUps.add(powerUp);
        powerUp.body.velocity.y = 100;

    },

    addObject: function(objectType){
        var randX = Math.floor(Math.random() * 600) + 100;
        var gameObj = game.add.sprite(randX, 1, objectType);
        
        game.physics.enable(gameObj);
        gameObj.checkWorldBounds = true;
        gameObj.outOfBoundsKill = true;

        return gameObj;
    },

    bossFight: function(){
        game.time.events.remove(this.enemyTimer);
        game.time.events.remove(this.strikerTimer);
        game.time.events.remove(this.sweeperTimer);

        this.boss = game.add.sprite(250, -400, 'boss');
        this.boss.health = 500;
        this.boss.body.immovable = true;
        this.bossWep.trackSprite(this.boss, 180, 150);
        game.physics.enable(this.boss);
        var bossEnter = game.add.tween(this.boss);
        bossEnter.to({y: [20, 20], x: [250, 30]}, 10000, 'Linear');
        bossEnter.onComplete.add(this.bossMove, this, this.boss);
        this.bossOnScreen = true;
        bossEnter.start();
    },

    bossMove: function(boss){
        var move = game.add.tween(boss);
        move.to({x: 420}, 5000, 'Linear', false, 0, Number.MAX_VALUE, true);
        move.start();
    }
}