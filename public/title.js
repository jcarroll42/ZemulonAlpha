
//var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create });

//  The Google WebFont Loader will look for this object, so create it before loading the script.
WebFontConfig = {

    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    active: function() { game.time.events.add(Phaser.Timer.SECOND, titleScreen.createText, this); },

    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
      families: ['Bungee Hairline']
    }

};

var titleScreen = {

    preload: function() {

        //  Load the Google WebFont Loader script
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        //this.introText = game.add.text(game.world.centerX, game.world.centerY, "");
        

    },

    text: null,
    grd: null,
    introText: null,
    introContent: ["It's the future.", "You can tell because of the way that it is.", "Also because you're in a ship.", "A SPACE ship.", "And that ship is called...", "Zemulon Alpha"],
    printCount: 1,
    

    create: function() {

        game.stage.setBackgroundColor(0x000000);
        this.startButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        

    },

    mainText: function(){
        var mainTween = game.add.tween(titleScreen.text).to({alpha: 1}, 2000, "Linear");
        mainTween.start;

    },

    createText: function() {

        titleScreen.text = game.add.text(game.world.centerX, game.world.centerY, "Zemulon Alpha");
        titleScreen.introText = game.add.text(23, 250, "");
        titleScreen.text.anchor.setTo(0.5);
        titleScreen.introText.text = titleScreen.introContent[0];

        

        // if (this.printCount < 5){
        //     game.time.events.loop(3000, titleScreen.printLoop, this);
        // }


        titleScreen.text.font = 'Bungee Hairline';
        titleScreen.text.fontSize = 60;
        titleScreen.text.fill = "#FFFFFF";
        titleScreen.text.alpha = 0;
        titleScreen.text.align = 'center';
        titleScreen.text.strokeThickness = 2;

        titleScreen.introText.font = 'Bungee Hairline';
        titleScreen.introText.fontSize = 30;
        titleScreen.introText.fill = "#FFFFFF";
        titleScreen.introText.alpha = 0;
        titleScreen.introText.align = 'center';

        var alphaIn = game.add.tween(titleScreen.introText).to( { alpha: 1 }, 1000, "Linear", true, 0, 5);
        alphaIn.yoyo(true, 1000);

        //var mainTween = game.add.tween(this.text).to({alpha: 1}, 2000, "Linear");
        alphaIn.onComplete.add(titleScreen.mainText, this);

        //mainTween.start();


        

    },

    update: function(){
        if (this.startButton.isDown){
            game.state.start('main');
        }
        if (game.time.now > 4000){
            if (titleScreen.introText.alpha === 0 && titleScreen.printCount < 6){
                if (titleScreen.printCount === 5){
                    titleScreen.introText.fontSize = 60;
                    titleScreen.introText.x = 120;
                    titleScreen.introText.y = 250;
                    console.log(game.time.now);
                }

                titleScreen.introText.text = titleScreen.introContent[titleScreen.printCount];
                console.log(titleScreen.printCount);
                titleScreen.printCount++;
            }
        }
        if (game.time.now > 20000){
            game.state.start('main');
        }
    }

    // printLoop: function(){
       
    //         this.introText.text = this.introContent[this.printCount];
    //         var alphaIn = game.add.tween(this.introText).to( { alpha: 1 }, 1000, "Linear", true, 0);
    //         alphaIn.yoyo(true, 1000);
    //         this.printCount++;
        
    // }

}

// var game = new Phaser.Game(800, 600);

// game.state.add('title', titleScreen);

// game.state.start('title');
