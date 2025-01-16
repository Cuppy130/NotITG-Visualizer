declare const THREE: typeof import('three');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.autoClear = false;
renderer.domElement.style.imageRendering = 'pixelated';
const displayRatio = 4/3;
renderer.setSize(window.innerWidth, window.innerWidth / displayRatio);
document.body.appendChild(renderer.domElement);

let song : any = null;

const backgroundImage = new THREE.TextureLoader().load('ITG2.png');
const backgroundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({
        map: backgroundImage,
        depthTest: false,
        depthWrite: false
    })
);


const backgroundScene = new THREE.Scene();
const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
backgroundScene.add(backgroundCamera);
backgroundScene.add(backgroundMesh);

camera.position.z = 5;



const receptorImage = new Array(4).fill(0).map((_, i) => new THREE.TextureLoader().load(`./images/tex receptors.png`, tex => {
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    // make sure that the texture can crop
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;

    tex.offset.x = i / 2;
    tex.repeat.x = 1 / 2;

    tex.offset.y = 0;
    tex.repeat.y = 1;
}));

const receptorGlowImage = new Array(4).fill(0).map((_, i) => new THREE.TextureLoader().load(`./images/tex glow.png`, tex => {
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    // make sure that the texture can crop
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;

    tex.offset.x = 0;
    tex.repeat.x = 1;

    tex.offset.y = 0;
    tex.repeat.y = 1;
}));



let player1 = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 8),
    new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.5
    })
);

let player1Mods = {
    tipsy: 100,
    tipsyspeed: 0,
    tipsyoffset: 0,
    tipsyspacing: 0,

    confusion: 100,

    x: 0,
    y: 0,
    z: 0,

    rotationx: 0,
    rotationy: 0,
    rotationz: 0,

    zoom: 100,
    zoomx: 100,
    zoomy: 100,
    zoomz: 100,

    skewx: 0,
    skewy: 0,

    xmod: 1.5,
    cmod: 150,

    
};

const receptors = new Array(4).fill(0).map((_, i) => {
    const receptor = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
            transparent: true,
            map: receptorImage[0]
        })
    );
    receptor.position.x = i - 1.5;
    receptor.position.y = 2;

    //make them face <- v ^ ->
    // by default they face down
    receptor.rotation.z = i < 1 ? -Math.PI / 2 : i < 2 ? 0 : i > 2 ? Math.PI / 2 : Math.PI;
    player1.add(receptor);
    return receptor;
});

const receptorGlow = new Array(4).fill(0).map((_, i) => {
    const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 1.5),
        new THREE.MeshBasicMaterial({
            transparent: true,
            map: receptorGlowImage[0]
        })
    );
    glow.position.z = 0.001;
    receptors[i].add(glow);
    return glow;
});

scene.add(player1);


const animate = function () {


    receptors.forEach((receptor, i : number) => {
        if(!song){
            receptor.rotation.z = i < 1 ? -Math.PI / 2 : i < 2 ? 0 : i > 2 ? Math.PI / 2 : Math.PI;

            receptor.rotation.z += ((Date.now() * 0.0025) % (Math.PI * 2)) * (player1Mods.confusion / 100);

            // receptor.rotation.z += 0.05;
            // receptor.position.y = (Math.sin(Date.now() * 0.001 + i) * 0.5) * (player1Mods.tipsy / 100) + 2;

            receptor.position.y = 2 + (Math.sin(((player1Mods.tipsyspeed + 100) / 100) * Date.now() * 0.001 + (i * ((player1Mods.tipsyspacing + 100) / 100)) + (player1Mods.tipsyoffset / 100)) * 0.5) * (player1Mods.tipsy / 100);

            receptor.material.map = receptorImage[Math.floor(Date.now() * 0.001) % 2];

            let date = Date.now() * 0.005 % 4;
            //make a wave glow effect
            let glow = receptorGlow[i];
            //let the first one glow and fade out
            let glow0 = Math.abs(date - i) < 0.5;
            
            glow.material.opacity = Math.min(1, Math.max(0, (glow0) ? 1 : glow.material.opacity - 0.05));
        } else {
        }
    });
    

    renderer.render(backgroundScene, backgroundCamera);
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
};

animate();

window.addEventListener('resize', () => {
    if (window.innerWidth / window.innerHeight > displayRatio) {
        renderer.setSize(window.innerHeight * displayRatio, window.innerHeight);
    } else {
        renderer.setSize(window.innerWidth, window.innerWidth / displayRatio);
    }
    
});

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

let folder : FileSystemDirectoryEntry | null = null;
let smFile = null;
let modsLua : string | ArrayBuffer | undefined | null = null;

document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if(!e.dataTransfer || !e.dataTransfer.items[0]){
        return;
    }
    const item = e.dataTransfer.items[0];
    if(item.webkitGetAsEntry){
        const entry = item.webkitGetAsEntry();
        if(entry && entry.isDirectory){
            folder = (entry as FileSystemDirectoryEntry);
            (entry as FileSystemDirectoryEntry).createReader().readEntries((entries) => {
                loadSong(entries);
            });
        }
    }
    document.getElementById("overlay")?.remove();
});

async function loadSong(files : FileSystemEntry[]){
    smFile = files?.find(file => file.name.endsWith('.sm')) as FileSystemFileEntry;
    smFile.file((file) => {
        const reader = new FileReader();
        reader.onload = function(e){
            smFile = e.target?.result;
        };
        reader.readAsText(file);
    });

    let luaFolder = files.find(file => file.name === 'lua') as FileSystemDirectoryEntry;
    luaFolder.createReader().readEntries((entries) => {
        const modsLuaFile = entries.find(file => file.name === 'mods.lua') as FileSystemFileEntry;
        modsLuaFile.file((file) => {
            const reader = new FileReader();
            reader.onload = function(e){
                modsLua = e.target?.result;
            };
            reader.readAsText(file);
        });
    });



}