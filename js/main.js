const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.setClearColor( 0xb7c3f3 , 1 ) ; 
const light = new THREE.AmbientLight(0xffffff) ; 
scene.add(light) ; 
/* const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube ); */

//global variabes 
const start_position = 3 
const end_position = -start_position
const text = document.querySelector(".text") 
const TIME_LIMIT = 10
let gameStat = "loading"
let ifLookinBackward = true


function createCube (size , positionX , rotY = 0 , color = 0xfbc851) {
    const geometry = new THREE.BoxGeometry(size.w , size.h , size.d);
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = positionX ; 
    cube.rotation.y = rotY ; 
    scene.add( cube ); 
    return cube;

}

camera.position.z = 5; //the smaller the number the closer the camera is to the object

const loader = new THREE.GLTFLoader();

function delay(ms){
    return new Promise(resolve => setTimeout(resolve , ms) )
} ; 
class Doll {
    constructor() {

        
loader.load('../models/scene.gltf' , (gltf) => {
    //we use an arrow function because a regular function will have its own context and it this.doll will refer to the function.doll and not the object doll
    scene.add(gltf.scene) ;
    gltf.scene.scale.set(.4 , .4 , .4) ; 
    gltf.scene.position.set (0, -1 , 0)
    this.doll = gltf.scene ; 

}) ; 

        
    }

    lookBackward() {
       // this.doll.rotation.y = -3.15 ; 
       gsap.to(this.doll.rotation , {y: -3.15 , duration: .45}) ; //it takes 450 ms for the doll to look backward
    setTimeout(() => ifLookinBackward = true , 150)
    }
    lookForward() {
    //    this.doll.rotation.y = 0 ; 
    gsap.to(this.doll.rotation , {y: 0 , duration: .45});
    setTimeout(() => ifLookinBackward = true , 450)

    }
async start() {

    this.lookBackward()
    await delay(Math.random()*1000 + 1000) 
    this.lookForward()
    await delay(Math.random()*750 + 750)
    this.start()
}

}

function createTrack() {
    createCube( {w: start_position *2 + 0.2 ,h: 1.5 ,d: 1} , 0 , 0, 0xe5a716).position.z = - 1;

    createCube( {w:.2 ,h: 1.5 ,d: 1} , start_position , - .35 ) ;
    createCube( {w:.2 ,h: 1.5 ,d: 1} , end_position , .35) ;



}
createTrack() ;

class Player {
    constructor(){
        const geometry = new THREE.SphereGeometry( .3, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z = 1 
        sphere.position.x = start_position
        scene.add( sphere );
        this.player = sphere
        this.playerInfo = {
            positionX : start_position , 
            velocity: 0  //speed
        }
        


    }
    run (){
        this.playerInfo.velocity = .03
            
    }
    update() {
        this.playerInfo.positionX -= this.playerInfo.velocity  
        this.player.position.x = this.playerInfo.positionX ; 
    }

    stop() {
     //   this.playerInfo.velocity = .0 ;
     gsap.to(this.playerInfo , {velocity:0 , duration: .1})
    }

    check() {
        if((this.playerInfo.velocity > 0 ) && !isLookingBackward ) {
            text.innerText("You lost!")
            gameStat ="over"
        }
        if(this.playerInfo.positionX <end_position +.4 ) {
            text.innerText("You won!") ; 
            gameStat ="over" ; 
        }

    }

    
}


async function init() {
    await delay(500)
    text.innerText = "Starting in 3"
    await delay(500)
    text.innerText = "Starting in 2"
    await delay(500)
    text.innerText = "Starting in 1"
    await delay(500)
    text.innerText = "GO!"
    startGame() ;

}

function startGame() {
    gameStat = "started"
    let progressBar = createCube({w:5 ,h: .1 ,d: 1} , 0)
    progressBar.position.y = 3.35
    gsap.to(progressBar.scale , {x:0 , duration: TIME_LIMIT ,ease: "none" })
    doll.start()  ;
    setTimeout(() => {
        if(gameStat != "over") {
            text.innerText = "You ran out of time!"
            gameStat ="over"
        }

    } , TIME_LIMIT * 1000) //because TIME_LIMIT is in seconds and timeout is in ms

}

init()

const player = new Player()

let doll = new Doll() ; 
setTimeout(() => {
    doll.start()
} , 1000 ) ; 


function animate() {
    if(gameStat == "over") return
    renderer.render(scene , camera) ;

	requestAnimationFrame( animate );
    player.update() ; 
 }
animate();
//to make it responsive
window.addEventListener('resize' , onWindowResize , false) ; 

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight ; 
    camera.updateProjectionMatrix() ; 
    renderer.setSize(window.innerWidth , window.innerHeight) ; 

}

window.addEventListener('keydown' , (e) => {
    if (gameStat != "started") return
    if(e.key == "ArrowUp") {
        player.run()
    }

}) 

window.addEventListener('keyup' , (e) => {
    if(e.key =="ArrowUp") {
        player.stop()
    }
})