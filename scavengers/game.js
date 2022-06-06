
// grid index: 1 = player, 2 = enemy, 3 = food, 4 = soda, 7 = exit, 8 = destructable wall, 9 = outerwall

function Game(width, height){
    this.gameGrid = [
        [9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 7, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 9, 9, 9, 9, 9, 9, 9, 9, 9]
    ];
    this.playerGrid = [
        [9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 7, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 0, 0, 0, 0, 0, 0, 0, 0, 9],
        [9, 9, 9, 9, 9, 9, 9, 9, 9, 9]
    ];
    this.width = width;
    this.height = height;

    this.loaded = 0;
    this.state = 'initial';
    this.day = 1;

    this.keycodes = [37, 38, 39, 40, 68, 65, 87, 83];

    this.init = () => {
        //bkg canvas
        this.bkgCanvas = document.createElement('canvas');
        this.bkgCanvas.width = this.width;
        this.bkgCanvas.height = this.height;
        this.bkgCanvas.classList.add('bkg-canvas')
        this.bkgcontext = this.bkgCanvas.getContext('2d');
        document.getElementById('root').appendChild(this.bkgCanvas);
        //main canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.classList.add('canvas');
        this.context = this.canvas.getContext('2d');
        document.getElementById('root').appendChild(this.canvas);
        //player object
        this.player = new Player();
        this.player.init(playerIdle, playerAttack, playerHit);
        var {x, y} = this.player.position;
        this.playerGrid[x][y] = 1;
        //enemies
        this.zombies = [];
        //items
        this.items = [];
        //load the game
        this.loadResources();
        //start the main game loop
        this.interval = setInterval(this.update, 20);
    };
    this.keyboardEvents = (e) => {
        if(this.keycodes.includes(e.keyCode) && this.player.state === 'idle'){
            if(e.keyCode === 39 || e.keyCode === 68) {//right
                var { x, y } = this.player.position;
                var newPos = { x: x, y: y+1 };
                if(this.playerGrid[newPos.x][newPos.y] === 0){//successfully moved
                    this.playerGrid[x][y] = 0;
                    this.player.move(newPos);
                    this.playerGrid[x][newPos.y] = 1;
                } else if(this.playerGrid[newPos.x][newPos.y] === 8){
                    //destructable wall
                    this.wallObjects.forEach(wall => {
                        if(wall.position.x === newPos.x && wall.position.y === newPos.y){
                            wall.takeDamage(this);
                        }
                    }) 
                    this.player.attackBush();
                    //player turn taken
                } else if(this.playerGrid[newPos.x][newPos.y] === 7){
                    //exit
                    this.playerGrid[x][y] = 0;
                    this.player.position.y = newPos.y;
                    this.player.state = 'waiting';
                    setTimeout(()=>{
                        this.loadNewLevel();
                    },40)
                } else if(this.playerGrid[newPos.x][newPos.y] === 3 || this.playerGrid[newPos.x][newPos.y] === 4){
                    //get the item at position
                    var amount = 0;
                    this.items.forEach(item => {
                        if(item.position.x === newPos.x && item.position.y === newPos.y){
                            amount = item.getValue();
                            this.items.splice(this.items.indexOf(item), 1);
                        }
                    })
                    this.playerGrid[x][y] = 0;
                    this.player.move(newPos);
                    this.playerGrid[x][newPos.y] = 1;
                    this.player.gainFood(amount)
                }
                
            }
            if(e.keyCode === 37 || e.keyCode === 65){//left
                var { x, y } = this.player.position;
                var newPos = { x: x, y: y-1 };
                if(this.playerGrid[newPos.x][newPos.y] === 0){
                    this.playerGrid[x][y] = 0;
                    this.player.move(newPos);
                    this.playerGrid[x][newPos.y] = 1;
                } else if(this.playerGrid[newPos.x][newPos.y] === 8){
                    //destructable wall
                    this.wallObjects.forEach(wall => {
                        if(wall.position.x === newPos.x && wall.position.y === newPos.y){
                            wall.takeDamage(this);
                            this.player.attackBush();
                        }
                    })
                } else if(this.playerGrid[newPos.x][newPos.y] === 3 || this.playerGrid[newPos.x][newPos.y] === 4){
                    //get the item at position
                    var amount = 0;
                    this.items.forEach(item => {
                        if(item.position.x === newPos.x && item.position.y === newPos.y){
                            amount = item.getValue();
                            this.items.splice(this.items.indexOf(item), 1);
                        }
                    })
                    this.playerGrid[x][y] = 0;
                    this.player.move(newPos);
                    this.playerGrid[x][newPos.y] = 1;
                    this.player.gainFood(amount)
                }
            }
            if(e.keyCode === 40 || e.keyCode === 83){//down
                var { x, y } = this.player.position;
                var newPos = { x: x+1, y: y };
                if(this.playerGrid[newPos.x][newPos.y] === 0){
                    this.playerGrid[x][y] = 0;
                    this.player.move(newPos);
                    this.playerGrid[newPos.x][y] = 1;
                } else if(this.playerGrid[newPos.x][newPos.y] === 8){
                    //destructable wall
                    this.wallObjects.forEach(wall => {
                        if(wall.position.x === newPos.x && wall.position.y === newPos.y){
                            wall.takeDamage(this);
                            this.player.attackBush();
                        }
                    })
                } else if(this.playerGrid[newPos.x][newPos.y] === 3 || this.playerGrid[newPos.x][newPos.y] === 4){
                    //get the item at position
                    var amount = 0;
                    this.items.forEach(item => {
                        if(item.position.x === newPos.x && item.position.y === newPos.y){
                            amount = item.getValue();
                            this.items.splice(this.items.indexOf(item), 1);
                        }
                    })
                    this.playerGrid[x][y] = 0;
                    this.player.move(newPos);
                    this.playerGrid[newPos.x][y] = 1;
                    this.player.gainFood(amount)
                }
            }
            if(e.keyCode === 38 || e.keyCode === 87){//up
                var { x, y } = this.player.position;
                var newPos = { x: x-1, y: y };
                if(this.playerGrid[newPos.x][newPos.y] === 0){
                    this.playerGrid[x][y] = 0;
                    this.player.move(newPos);
                    this.playerGrid[newPos.x][y] = 1;
                } else if(this.playerGrid[newPos.x][newPos.y] === 8){
                    //destructable wall
                    this.wallObjects.forEach(wall => {
                        if(wall.position.x === newPos.x && wall.position.y === newPos.y){
                            wall.takeDamage(this);
                            this.player.attackBush();
                        }
                    })
                } else if(this.playerGrid[newPos.x][newPos.y] === 7){
                    //exit 
                    this.playerGrid[x][y] = 0;
                    this.player.position.x = newPos.x;
                    this.player.state = 'waiting';
                    
                    setTimeout(()=>{
                        this.loadNewLevel();
                    },40)
                } else if(this.playerGrid[newPos.x][newPos.y] === 3 || this.playerGrid[newPos.x][newPos.y] === 4){
                    //get the item at position
                    var amount = 0;
                    this.items.forEach(item => {
                        if(item.position.x === newPos.x && item.position.y === newPos.y){
                            amount = item.getValue();
                            this.items.splice(this.items.indexOf(item), 1);
                        }
                    })
                    this.playerGrid[x][y] = 0;
                    this.player.move(newPos);
                    this.playerGrid[newPos.x][y] = 1;
                    this.player.gainFood(amount)
                }
            }
            
            this.endTurn()
        }
    }
    this.loadedCounter = () => {
        this.loaded += 1;
    }
    this.loadResources = () => {
        this.state = 'loading';
        //outerwalls
        let ow = [];
        outerwalls.forEach((imgsrc) => {
            var img = new Image();
            img.src = imgsrc;
            img.onload = this.loadedCounter();
            ow.push(img);
        })
        this.outerwalls = ow;
        //floors
        let fl = [];
        floors.forEach((flsrc) => {
            var img = new Image();
            img.src = flsrc;
            img.onload = this.loadedCounter();
            fl.push(img);
        })
        this.floors = fl;
        //walls 
        let w = [];
        for(var i=0;i<walls.length;i++){
            var mainImg = new Image();
            mainImg.src = walls[i];
            mainImg.onload = this.loadedCounter();
            var dmgImg = new Image();
            dmgImg.src = damagedWalls[i];
            dmgImg.onload = this.loadedCounter();
            var wallObj = [mainImg, dmgImg]
            w.push(wallObj)
        }
        this.walls = w;
        //other resources
        var exitImg = new Image();
        exitImg.src = exitSign;
        exitImg.onload = this.loadedCounter();
        this.exit = exitImg;
        var sodaImg = new Image();
        sodaImg.src = SODA;
        sodaImg.onload = this.loadedCounter();
        this.soda = sodaImg;
        var foodImg = new Image();
        foodImg.src = FOOD;
        foodImg.onload = this.loadedCounter();
        this.food = foodImg;
    }
    this.clearBackground = () => {
        this.bkgcontext.clearRect(0, 0, this.bkgCanvas.width, this.bkgCanvas.height);
    };
    this.clear = () => {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.renderBackground = () => {
        this.clearBackground();
        for(var x=0;x<10;x++) {
            for(var y=0;y<10;y++) {
                if(this.gameGrid[x][y] === 9){
                    var ri = Math.floor(Math.random() * this.outerwalls.length)
                    this.bkgcontext.drawImage(this.outerwalls[ri], 0,0,32,32,y*64,x*64,64,64)
                } else if(this.gameGrid[x][y] === 7) {
                    this.bkgcontext.drawImage(this.exit, 0,0,32,32,y*64,x*64,64,64)
                } else {
                    var ri = Math.floor(Math.random() * this.floors.length)
                    this.bkgcontext.drawImage(this.floors[ri], 0,0,32,32,y*64,x*64,64,64)
                } 
            }
        }
    }
    this.renderTransition = () => {
        this.clearBackground();
        this.bkgcontext.fillStyle = 'black';
        this.bkgcontext.fillRect(0, 0, this.width, this.height);
        if(this.gameover){
            this.bkgcontext.font = "40px Comic Sans MS";
            this.bkgcontext.fillStyle = 'red';
            this.bkgcontext.textAlign = 'center';
            this.bkgcontext.fillText("Game Over", this.width/2, this.height/2-50);
        }
        this.bkgcontext.font = "30px Comic Sans MS";
        this.bkgcontext.fillStyle = 'white';
        this.bkgcontext.textAlign = 'center';
        this.bkgcontext.fillText("Day " + this.day, this.width/2, this.height/2);
    }
    this.renderStart = () => {
        this.clearBackground();
        this.bkgcontext.fillStyle = 'black';
        this.bkgcontext.fillRect(0, 0, this.width, this.height);
        this.bkgcontext.font = "30px Comic Sans MS";
        this.bkgcontext.fillStyle = 'white';
        this.bkgcontext.textAlign = 'center';
        this.bkgcontext.fillText("click to start", this.width/2, this.height/2);
    }
    this.render = () => {
        //render/update destructable walls 
        this.wallObjects.forEach(wall => wall.update(this.context));
        //render items
        this.items.forEach(item => item.update(this.context))
        //render/update the player
        this.player.update(this.context);
        //render/update each zombie
        this.zombies.forEach(zombie => zombie.update(this.context))
        //render the game-ui text
        this.context.font = "20px Comic Sans MS";
        this.context.fillStyle = 'black';
        this.context.textAlign = 'center';
        this.context.fillText('Food: ', 40, 32);
        //this.context.font = "20px FontAwesome";
        this.context.fillStyle = this.player.food <= 25 ? 'red' : 'white';
        this.context.textAlign = 'center';
        this.context.fillText(this.player.food, 90, 32);
    }
    this.startGame = () => {
        this.player.animate();
        this.wallObjects = [];
        var wallCount = 0;
        do {
            var randx = Math.floor(Math.random() * 10);
            var randy = Math.floor(Math.random() * 10);
            var randi = Math.floor(Math.random() * this.walls.length);
            if(this.playerGrid[randx][randy] === 0){
                this.playerGrid[randx][randy] = 8;
                var newWall = new Wall(randx, randy, this.walls[randi])
                this.wallObjects.push(newWall)
                wallCount++;
            }

        } while(wallCount < 6)

        var zCount = 0;
        do{
            var randx = Math.floor(Math.random() * 5);
            var randy = Math.floor(Math.random() * 10);
            if(this.playerGrid[randx][randy] === 0){
                var randi = Math.floor(Math.random() * 2) + 1;
                var idlePath = randi === 1 ? zombie1Idle : zombie2Idle;
                var attackPath = randi === 1 ? zombie1Attack : zombie2Attack;
                var zombie = new Enemy(randx, randy, idlePath, attackPath);
                zombie.animate();
                this.zombies.push(zombie);
                this.playerGrid[randx][randy] = 2;
                zCount += 1; 
            }
        } while (zCount < 1)

        var maxItems = Math.floor(Math.random() * 4);
        if(maxItems > 0){
            var iCount = 0;
            while(iCount < maxItems){
                var randx = Math.floor(Math.random() * 10);
                var randy = Math.floor(Math.random() * 10);
                if(this.playerGrid[randx][randy] === 0){
                    var randi = Math.floor(Math.random() * 2);
                    var sprite = randi === 1 ? this.soda : this.food;
                    var amount = randi === 1 ? 10 : 5;
                    var item = new Item({ x: randx, y: randy }, sprite, amount)
                    this.items.push(item);
                    this.playerGrid[randx][randy] = randi === 0 ? 3 : 4;
                    iCount++;
                }
            }
        }
        
        setTimeout(()=>{
            document.addEventListener('keydown', this.keyboardEvents);
            this.music = new Audio('./resources/audio/scavengers_music.mp3');
            this.music.loop = true;
            this.music.play();
            this.renderBackground();
            this.state = 'ready';
        }, 2000)
    }
    this.endTurn = () => {
        this.zombies.forEach(zombie => {
            zombie.move(this.player, this.playerGrid, this)
        })
    }
    this.handleClick = () => {
        this.clicked = true
    }
    this.update = () => {
        
        if(this.state === 'starting'){
            if(this.clicked){
                document.removeEventListener('click', this.handleClick);
                this.state = 'transition'
                this.startGame();
            } else {
                this.renderStart();
            }
        }
        if(this.state === 'loading'){
            if(this.loaded === 30){

                if(this.player.isloaded()){
                    this.state = 'starting';
                    document.addEventListener('click', this.handleClick )
                }
            }
        }
        if(this.state === 'ready'){
            if(this.player.state === 'dead') {
                this.endGame();
            } else {
                this.clear();
                this.render();
            }
        }
        if(this.state === 'transition'){
            this.clear();
            this.renderTransition();
        }
    }
    this.destroyWall = (wall, position) => {
        var i = this.wallObjects.indexOf(wall);
        this.wallObjects.splice(i,1);
        this.playerGrid[position.x][position.y] = 0;
    }
    this.loadNewLevel = () => {
        
        this.day += 1;
        var maxWalls = 6;
        var maxZombies = 1+Math.floor(this.day/10);
        this.state = 'transition';
        //delete all walls, zombies and items
        this.levelCleanup();
        //reset the playerGrid
        for(var x=0;x<10;x++){
            for(var y=0;y<10;y++){
                if(this.playerGrid[x][y] === 8 || this.playerGrid[x][y] === 2 || this.playerGrid[x][y] === 3 ||this.playerGrid[x][y] === 4){
                    this.playerGrid[x][y] = 0;
                }
            }
        }
        //reset the player position
        this.player.position.x = 8;
        this.player.position.y = 1;
        this.playerGrid[8][1] = 1;

        var wallCount = 0;
        while(wallCount < maxWalls){
            var randx = Math.floor(Math.random() * 10);
            var randy = Math.floor(Math.random() * 10);
            var randi = Math.floor(Math.random() * this.walls.length);
            if(this.playerGrid[randx][randy] === 0){
                this.playerGrid[randx][randy] = 8;
                var newWall = new Wall(randx, randy, this.walls[randi])
                this.wallObjects.push(newWall)
                wallCount++;
            }

        }

        var zCount = 0;
        while (zCount < maxZombies){
            var randx = Math.floor(Math.random() * 5);
            var randy = Math.floor(Math.random() * 10);
            if(this.playerGrid[randx][randy] === 0){
                var randi = Math.floor(Math.random() * 2) + 1;
                var idlePath = randi === 1 ? zombie1Idle : zombie2Idle;
                var attackPath = randi === 1 ? zombie1Attack : zombie2Attack;
                var zombie = new Enemy(randx, randy, idlePath, attackPath);
                zombie.animate();
                this.zombies.push(zombie);
                this.playerGrid[randx][randy] = 2;
                zCount += 1; 
            }
        }

        var maxItems = Math.floor(Math.random() * 4);
        if(maxItems > 0){
            var iCount = 0;
            while(iCount < maxItems){
                var randx = Math.floor(Math.random() * 10);
                var randy = Math.floor(Math.random() * 10);
                if(this.playerGrid[randx][randy] === 0){
                    var randi = Math.floor(Math.random() * 2);
                    var sprite = randi === 1 ? this.soda : this.food;
                    var amount = randi === 1 ? 10 : 5;
                    var item = new Item({ x: randx, y: randy }, sprite, amount)
                    this.items.push(item);
                    this.playerGrid[randx][randy] = randi === 0 ? 3 : 4;
                    iCount++;
                }
            }
        }
        setTimeout(()=> {
            this.state = 'ready';
            this.renderBackground()
            this.player.state = 'idle';
        }, 2000)
    }
    this.levelCleanup = () =>{
        delete this['wallObjects'];
        this.wallObjects = [];
        this.zombies.forEach(zombie => zombie.stopAnimation())
        delete this['zombies'];
        this.zombies = [];
        delete this.items;
        this.items = [];
    }
    this.endGame = () => {
        this.gameover = true;
        this.state = 'transition';
        this.music.pause();
        clearInterval(this.interval);
        this.clear()
        this.clearBackground();
        delete this['player'];
        this.levelCleanup();
        delete this.outerwalls;
        delete this.floors;
        delete this.walls;
        //document.removeEventListener('keydown');//no game restart
    }
    this.updatePlayerGrid = (oldPos, newPos, value) => {
        this.playerGrid[oldPos.x][oldPos.y] = 0;
        this.playerGrid[newPos.x][newPos.y] = value;
    }
}
class Sprite {
    sprite = null;
    position = { x: 8, y: 1, width: 64, height: 64 };

    update(ctx){
        ctx.drawImage(
            this.sprite, //image to render
            0, 0, 32, 32, //starting x, y, width, height of image to render
            this.position.y*64, this.position.x*64, //the x and y position on the canvas
            this.position.width, this.position.height //the width and height of the image on the canvas
        )
    }
}
class Player extends Sprite {
    state = 'idle';
    idle = [];
    attack = [];
    hit = [];
    food = 100;
    dependencies = 10;
    loaded = 0;
    init(idlepath, attackpath, hitpath){
        this.loadResources(idlepath, attackpath, hitpath);
    }
    loadResources(idlepath, attackpath, hitpath){
        idlepath.forEach(path => {
            var img = new Image();
            img.src = path;
            img.onload = this.loadedCounter();
            this.idle.push(img)
        })
        this.sprite = this.idle[0];
        attackpath.forEach(path => {
            var img = new Image();
            img.src = path;
            img.onload = this.loadedCounter();
            this.attack.push(img)
        })
        hitpath.forEach(path => {
            var img = new Image();
            img.src = path;
            img.onload = this.loadedCounter();
            this.hit.push(img)
        })
    }
    triggerAnimation(state){
        this.state = state;
    }
    loadedCounter(){
        this.loaded += 1;
    }
    isloaded(){
        return this.loaded === this.dependencies;
    }
    animate(){
        this.animTick = setInterval(() => {
            //console.log(this[this.state].indexOf(this.sprite))
            if(this.state === 'idle' || this.state === 'waiting'){
                var i = this.idle.indexOf(this.sprite) + 1;
                if(i > this.idle.length - 1) i = 0;
                this.sprite = this.idle[i];
            } else {
                var i = this[this.state].indexOf(this.sprite) + 1;
                if(i > this[this.state].length - 1) {
                    i = 0;
                    this.state = 'idle';
                }
                this.sprite = this[this.state][i];
            }
        }, 150)
    }
    stopAnimation(){
        clearInterval(this.animTick);
    }
    takeDamage(){
        var rand = Math.floor(Math.random() * 2);
        let src = rand === 0 ? './resources/audio/scavengers_enemy1.mp3' : './resources/audio/scavengers_enemy2.mp3';
        let sfx = new Audio(src);
        sfx.play();
        this.food -= 5;
        this.triggerAnimation('hit')
        if(this.food <= 0) {
            this.food = 0;
            this.die();
        }
    }
    takeFood(){
        this.food -= 1;
        if(this.food <= 0) {
            this.food = 0;
            this.die();
        }
    }
    gainFood(amount){
        if(amount === 10){
            //soda
            var rand = Math.floor(Math.random() * 2);
            let src = rand === 0 ? './resources/audio/scavengers_soda1.mp3' : './resources/audio/scavengers_soda2.mp3';
            let sfx = new Audio(src);
            sfx.play();
        } else {
            //fruit
            var rand = Math.floor(Math.random() * 2);
            let src = rand === 0 ? './resources/audio/scavengers_fruit1.mp3' : './resources/audio/scavengers_fruit2.mp3';
            let sfx = new Audio(src);
            sfx.play();
        }
        this.food += amount;
    }
    move(position){
        var rand = Math.floor(Math.random() * 2);
        let src = rand === 0 ? './resources/audio/scavengers_footstep1.mp3' : './resources/audio/scavengers_footstep2.mp3';
        let sfx = new Audio(src);
        sfx.play();
        this.position.x = position.x;
        this.position.y = position.y;
        this.takeFood();
    }
    attackBush(){
        var rand = Math.floor(Math.random() * 2);
        let src = rand === 0 ? './resources/audio/scavengers_chop1.mp3' : './resources/audio/scavengers_chop2.mp3';
        let sfx = new Audio(src);
        sfx.play();
        this.triggerAnimation('attack');
        this.takeFood();
    }
    die(){
        let sfx = new Audio('./resources/audio/scavengers_die.mp3');
        sfx.play();
        this.stopAnimation();
        this.state = 'dead';
    }
}
class Wall extends Sprite {
    health = 2;
    src = null;
    damaged = null;
    constructor(x, y, imgSrcs){
        super();
        this.position.x = x;
        this.position.y = y;
        this.src = imgSrcs[0];
        this.damaged = imgSrcs[1];
        this.sprite = this.src;
    }
    takeDamage(game){
        this.health -= 1;
        if(this.health === 1){
            this.sprite = this.damaged;
        } else if(this.health === 0){
            game.destroyWall(this, this.position);
        }
    }
    getSprite(){ return this.health === 2 ? this.src : this.damaged }
}
class Enemy extends Sprite {
    state = 'idle';
    canMove = false;
    idle = [];
    attack = [];
    dependencies = 8;
    loaded = 0;
    constructor(x, y, idlepath, attackpath){
        super();
        this.position.x = x;
        this.position.y = y;

        this.loadResources(idlepath, attackpath);
    }
    loadResources(idlepath, attackpath){
        idlepath.forEach(path => {
            var img = new Image();
            img.src = path;
            img.onload = this.loadedCounter();
            this.idle.push(img)
        })
        this.sprite = this.idle[0];
        attackpath.forEach(path => {
            var img = new Image();
            img.src = path;
            img.onload = this.loadedCounter();
            this.attack.push(img)
        })
    }
    loadedCounter(){
        this.loaded += 1;
    }
    isloaded(){
        return this.loaded === this.dependencies;
    }
    animate(){
        this.animTick = setInterval(() => {
            if(this.state === 'idle'){
                var i = this[this.state].indexOf(this.sprite) + 1;
                if(i > this[this.state].length - 1) i = 0;
                this.sprite = this[this.state][i];
            } else {
                var i = this[this.state].indexOf(this.sprite) + 1;
                if(i > this[this.state].length - 1) {
                    i = 0;
                    this.state = 'idle';
                }
                this.sprite = this[this.state][i];
            }
        }, 150)
    }
    triggerAnimation(state){
        this.state = state;
    }
    stopAnimation(){
        clearInterval(this.animTick);
    }
    getDistance(player){
        return Math.sqrt(Math.pow(player.position.x - this.position.x,2)+Math.pow(player.position.y - this.position.y,2));
    }
    distanceBetween(pos1, pos2){
        return Math.sqrt(Math.pow(pos2.x - pos1.x,2)+Math.pow(pos2.y - pos1.y,2));
    }
    move(player, level, game){
        if(this.canMove && this.getDistance(player) > 1){
            //check available directions
            var {x,y} = this.position;
            let directions = {};
            if(level[x-1][y] === 0) directions.up = {x: x-1, y: y};
            if(level[x+1][y] === 0) directions.down = {x: x+1, y: y}
            if(level[x][y-1] === 0) directions.left = {x: x, y: y-1}
            if(level[x][y+1] === 0) directions.right = {x: x, y: y+1}

            if(Object.keys(directions).length === 1){
                console.log(directions);
                let dir = directions[Object.keys(directions)[0]];
                game.updatePlayerGrid(this.position, dir, 2);
                this.position.x = dir.x;
                this.position.y = dir.y;
            } else {
                let dir = directions[Object.keys(directions)[0]];
                let dist = this.distanceBetween(dir, player.position);
                Object.keys(directions).forEach(direction => {
                    if(this.distanceBetween(directions[direction], player.position) < dist){
                        dir = directions[direction];
                        dist = this.distanceBetween(directions[direction], player.position);
                    }
                })
                game.updatePlayerGrid(this.position, dir, 2);
                this.position.x = dir.x;
                this.position.y = dir.y;
            }
        } 
        let distance = this.getDistance(player);
        if(distance === 1){
            player.takeDamage();
            this.triggerAnimation('attack')
        }
        this.canMove = !this.canMove;
    }
}
class Item extends Sprite {
    constructor(pos, sprite, value){
        super();
        this.position.x = pos.x;
        this.position.y = pos.y;
        this.sprite = sprite;
        this.value = value;
    }
    getValue(){ return this.value; }
}

const game = new Game(640, 640);

game.init();
