
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render, hit: hit });

function preload() {

    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('ship', 'assets/shmup-ship.png');
    game.load.image('brick', 'assets/brick.png');

}

var sprite;
var weapon;
var cursors;
var fireButton;
var enemies;
var firingTimer = 0;
var livingEnemies = [];
var enemyTimer = 0;
var score = 0;
var labelScore = 0;

function create() {

    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'bullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);


    //  Creates 30 bullets, using the 'bullet' graphic
    weapon = game.add.weapon(30, 'bullet');

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  The bullet will be automatically killed when it leaves the world bounds
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;

    //  Because our bullet is drawn facing up, we need to offset its rotation:
    weapon.bulletAngleOffset = 90;

    //  The speed at which the bullet is fired
    weapon.bulletSpeed = 400;

    //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
    weapon.fireRate = 60;

    sprite = this.add.sprite(320, 500, 'ship');

    game.physics.arcade.enable(sprite);
    //game.physics.arcade.enable(enemies);
    game.world.enableBody = true;

    //  Tell the Weapon to track the 'player' Sprite, offset by 14px horizontally, 0 vertically
    weapon.trackSprite(sprite, 26, 0);

    cursors = this.input.keyboard.createCursorKeys();

    fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

    //create group for the enemies
    enemies = game.add.group();
    enemies.enableBody = true
    enemies.physicsBodyType = Phaser.Physics.ARCADE;

    enemyTimer = game.time.events.loop(1500, addEnemy, this);

    labelScore = game.add.text(20, 20, "0", 
    { font: "30px Arial", fill: "#ffffff" });  


}

function update() {

    sprite.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        sprite.body.velocity.x = -200;
    }
    else if (cursors.right.isDown)
    {
        sprite.body.velocity.x = 200;
    }

    if (fireButton.isDown)
    {
        weapon.fire();
    }

    if (game.time.now > firingTimer)
        {
            enemyFires();
        }

    // Call the 'hit' function when the ball hits a brick
    game.physics.arcade.collide(weapon.bullets, enemies, hit, null, this);

    game.physics.arcade.collide(enemyBullets, sprite, playerhit, null, this)

}

function hit(bullets, brick) {  
    brick.kill();
    bullets.kill();

    score += 1;
    labelScore.text = score;
}

function playerhit(bullet, player){
    player.kill();
    bullet.kill();
    weapon.pauseAll();
    game.time.pause();
}

function render() {

    //weapon.debug();

}

function enemyFires () {

    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length=0;

    enemies.forEachAlive(function(brick){

        // put every living enemy in an array
        livingEnemies.push(brick);
    });


    if (enemyBullet && livingEnemies.length > 0)
    {
         
        var random=game.rnd.integerInRange(0,livingEnemies.length-1);

        // randomly select one of them
        var shooter=livingEnemies[random];
        // And fire the bullet from this enemy
        enemyBullet.reset(shooter.body.x + 20, shooter.body.y + 10);

        //game.physics.arcade.moveToObject(enemyBullet,sprite,120);

        enemyBullet.body.velocity.y = 400;
        firingTimer = game.time.now + 500;
    }

}

function addEnemy (){
    var randX = Math.floor(Math.random() * 700) + 100;
    console.log(randX);
    var enemy = game.add.sprite(randX, 1, 'brick');
    enemies.add(enemy);

    game.physics.enable(enemy);
    enemy.body.velocity.y = 200;

    enemy.checkWorldBounds = true;
    enemy.outOfBoundsKill = true;

}