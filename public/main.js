var mainState = {
    preload: function() {

        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('ship', 'assets/shmup-ship.png');
        game.load.image('brick', 'assets/brick.png');

    },

    create: function() {
        score = 0;

        this.firingTimer = 0;
        this.livingEnemies = [];
        this.enemyTimer = 0;
        this.labelScore = 0;

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
        this.weapon = game.add.weapon(30, 'bullet');

        game.physics.startSystem(Phaser.Physics.ARCADE);

        // destroy bullets when they leave world bounds
        this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;

        //offset rotation for correct image placement
        //this.weapon.bulletAngleOffset = 90;

        // set bullet speed
        this.weapon.bulletSpeed = 400;

        //  set fire rate: 1 bullet every 60ms
        this.weapon.fireRate = 60;

        // add the actual player
        this.player = this.add.sprite(320, 500, 'ship');

        game.physics.arcade.enable(this.player);

        game.world.enableBody = true;

        // tie weapon to player
        this.weapon.trackSprite(this.player, 26, 0);

        // create input keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // set fire button to spacebar
        this.fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

        //create group for the enemies
        this.enemies = game.add.group();
        this.enemies.enableBody = true
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;

        // loop to add a new enemy every 1.5 seconds
        this.enemyTimer = game.time.events.loop(1500, this.addEnemy, this);

        // set the scoreboard
        this.labelScore = game.add.text(20, 20, "0", 
        { font: "30px Arial", fill: "#ffffff" });  


    },

    update: function() {

        this.player.body.velocity.x = 0;

        if (this.cursors.left.isDown)
        {
            this.player.body.velocity.x = -200;
        }
        else if (this.cursors.right.isDown)
        {
            this.player.body.velocity.x = 200;
        }

        if (this.fireButton.isDown)
        {
            this.weapon.fire();
        }

        if (game.time.now > this.firingTimer)
            {
                this.enemyFires();
            }

        // call the 'hit' function when a bullet hits an enemy
        game.physics.arcade.collide(this.weapon.bullets, this.enemies, this.hit, null, this);

        //call playerHit when an enemy bullet hits the player
        game.physics.arcade.collide(this.enemyBullets, this.player, this.playerHit, null, this);
        game.physics.arcade.collide(this.enemies, this.player, this.playerHit, null, this);

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
        //this.weapon.bullets.killAll();
        //this.enemies.kill();
        this.weapon.pauseAll();
        game.state.start('gameOver');
    },

    render: function() {

        //weapon.debug();

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
            enemyBullet.reset(shooter.body.x + 20, shooter.body.y + 10);

            //game.physics.arcade.moveToObject(enemyBullet,sprite,120);

            enemyBullet.body.velocity.y = 400;
            this.firingTimer = game.time.now + 500;
        }

    },
    // function that handles when an enemy gets added
    addEnemy: function(){
        var randX = Math.floor(Math.random() * 600) + 100;
        console.log(randX);
        var enemy = game.add.sprite(randX, 1, 'brick');
        this.enemies.add(enemy);

        game.physics.enable(enemy); 
        enemy.body.velocity.y = 200;

        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;

    }
}

// var game = new Phaser.Game(800, 600);


// game.state.start('main');