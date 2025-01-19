"use strict";
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.autoClear = false;
renderer.domElement.style.imageRendering = 'pixelated';
const displayRatio = 4 / 3;
renderer.setSize(window.innerWidth, window.innerWidth / displayRatio);
document.body.appendChild(renderer.domElement);
let debug = true;
let song = null;
const scx = 640 / 2;
const backgroundImage = new THREE.TextureLoader().load('ITG2.png');
const backgroundMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({
    map: backgroundImage,
    depthTest: false,
    depthWrite: false,
    transparent: true
}));
const backgroundScene = new THREE.Scene();
const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
backgroundScene.add(backgroundCamera);
backgroundScene.add(backgroundMesh);
const receptorImage = new Array(4).fill(0).map((_, i) => new THREE.TextureLoader().load(`./images/tex receptors.png`, tex => {
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.offset.x = 1 / 2;
    tex.repeat.x = 1 / 2;
    tex.offset.y = 0;
    tex.repeat.y = 1;
}));
const receptorGlowImage = new THREE.TextureLoader().load(`./images/tex glow.png`, tex => {
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
});
const animate = function () {
    renderer.render(backgroundScene, backgroundCamera);
    renderer.render(data.player1.scene, data.player1.camera);
    renderer.render(data.player2.scene, data.player2.camera);
    if (song) {
        let songTime = song.currentTime;
        songBeat = (songTime + modchart.OFFSET) / 60 * modchart.BPMS[0][1];
    }
    else {
        console.log("Song missing");
        setTimeout(animate, 1000 / 2);
        return;
    }
    data.player1.update();
    data.player2.update();
    setTimeout(animate, 1000 / 60);
};
function onResize() {
    if (window.innerWidth / window.innerHeight > displayRatio) {
        renderer.setSize(window.innerHeight * displayRatio, window.innerHeight);
        [data.player1, data.player2].forEach(player => {
            player.camera.aspect = window.innerHeight * displayRatio / window.innerHeight;
            player.camera.updateProjectionMatrix();
        });
        const overlay2 = document.getElementById('overlay2');
        if (overlay2) {
            const image = overlay2.querySelector('img');
            if (image) {
                image.style.width = `${window.innerHeight * displayRatio}px`;
                image.style.height = `${window.innerHeight}px`;
            }
        }
    }
    else {
        renderer.setSize(window.innerWidth, window.innerWidth / displayRatio);
        [data.player1, data.player2].forEach(player => {
            player.camera.aspect = window.innerWidth / (window.innerWidth / displayRatio);
            player.camera.updateProjectionMatrix();
        });
        const overlay2 = document.getElementById('overlay2');
        if (overlay2) {
            const image = overlay2.querySelector('img');
            if (image) {
                image.style.width = `${window.innerWidth}px`;
                image.style.height = `${window.innerWidth / displayRatio}px`;
            }
        }
    }
}
window.addEventListener('resize', onResize);
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});
let folder = null;
let smFile;
let modsLua = null;
document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.dataTransfer || !e.dataTransfer.items[0]) {
        return;
    }
    const item = e.dataTransfer.items[0];
    if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry();
        if (entry && entry.isDirectory) {
            folder = entry;
            entry.createReader().readEntries((entries) => {
                loadSong(entries);
            });
        }
    }
});
async function loadSong(files) {
    let smFileSearch = files.find(file => file.name.endsWith('.sm'));
    if (!smFileSearch) {
        throw alert('No .sm file found');
    }
    smFile = await new Promise((resolve, reject) => {
        smFileSearch.file(resolve);
    });
    let smText = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsText(smFile);
    });
    let music = smText.match(/#MUSIC:([^;]+)/);
    if (music && music[1].trim() === "") {
        throw alert('Music not set up!');
    }
    else {
        console.log("Music found!");
        if (music) {
            song = new Audio();
            let songData = await new Promise((resolve, reject) => {
                folder?.getFile(music[1].trim(), {}, resolve, reject);
            });
            let songDataFile = await new Promise((resolve, reject) => {
                songData.file(resolve, reject);
            });
            let songDataBlob = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(reader.result);
                };
                reader.readAsArrayBuffer(songDataFile);
            });
            song.src = URL.createObjectURL(new Blob([songDataBlob]));
            song.volume = 0.05;
        }
        else {
            throw alert('Music not set up!');
        }
    }
    let fgChanges = smText.match(/#FGCHANGES:([^;]+)/);
    if (fgChanges && fgChanges[1].trim() === "") {
        throw alert('Mirin template not set up!');
    }
    else {
        console.log("Mirin template found!");
    }
    modchart = new SMFile(smText);
    let modsLuaFile = await new Promise((resolve, reject) => {
        folder?.getFile("lua/mods.lua", {}, resolve, reject);
    });
    modsLua = await new Promise((resolve, reject) => {
        modsLuaFile.file((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsText(file);
        });
    });
    document.getElementById("overlay")?.remove();
    let mods = modsLua.match(/--#BEGINMODS([\s\S]+)--#ENDMODS/);
    if (!mods) {
        modsLua += `
--#BEGINMODS
--#ENDMODS
`;
    }
    modfile = new Mods(modsLua);
}
let modfile;
class Mods {
    beforeModsBegin;
    afterModsEnd;
    mods;
    constructor(modsLua) {
        this.beforeModsBegin = modsLua.substring(0, modsLua.indexOf('--#BEGINMODS'));
        this.afterModsEnd = modsLua.substring(modsLua.indexOf('--#ENDMODS') + '--#ENDMODS'.length);
        this.mods = [];
        for (let mod of modsLua.substring(modsLua.indexOf('--#BEGINMODS') + '--#BEGINMODS'.length, modsLua.indexOf('--#ENDMODS')).split('\n')) {
            if (mod.trim() === '') {
                continue;
            }
            let type = mod.substring(0, mod.indexOf("{"));
            let args = mod.substring(mod.indexOf("{") + 1, mod.indexOf("}")).split(',').map(arg => arg.trim());
            this.mods.push(new Mod(type, ...args));
        }
    }
    toString() {
        return this.beforeModsBegin + '--#BEGINMODS\n' + this.mods.toString() + '\n--#ENDMODS\n' + this.afterModsEnd;
    }
}
class Receptor {
    model;
    spline;
    receptorGlow;
    constructor(i) {
        this.spline = new Spline([
            ...[...Array(10).keys()].map(i => new THREE.Vector3(0, i - 6, 0))
        ]);
        this.model = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
            transparent: true,
            map: receptorImage[0]
        }));
        this.model.position.x = i - 1.5;
        this.model.position.y = 2;
        this.model.rotation.z = i < 1 ? -Math.PI / 2 : i < 2 ? 0 : i > 2 ? Math.PI / 2 : Math.PI;
        this.receptorGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({
            transparent: true,
            map: receptorGlowImage,
            opacity: 0
        }));
        this.model.add(this.receptorGlow);
    }
    setDark(value) {
        this.model.material.opacity = 1 - value / 100;
    }
    setGlow(value) {
        this.receptorGlow.material.opacity = value / 100;
    }
    getGlow() {
        return this.receptorGlow.material.opacity * 100;
    }
    update(player) {
        this.model.position.x = this.spline.getPosition(1).x;
        this.model.position.y = this.spline.getPosition(1).y;
        this.model.position.z = this.spline.getPosition(1).z;
    }
}
const increments = [4, 8, 12, 16, 20, 24, 32, 48, 64, 96, 192];
let increment = 0;
function floorToNearestBeat(audio, beat) {
    const bpm = modchart.BPMS[0][1];
    const secondsPerBeat = 60 / bpm;
    return Math.floor(audio.currentTime / secondsPerBeat / beat) * beat;
}
function ceilToNearestBeat(audio, beat) {
    const bpm = modchart.BPMS[0][1];
    const secondsPerBeat = 60 / bpm;
    return Math.ceil(audio.currentTime / secondsPerBeat / beat) * beat;
}
function addBeat(measure) {
    const bpm = modchart.BPMS[0][1];
    const secondsPerBeat = 60 / bpm;
    song.currentTime += measure * secondsPerBeat;
    songBeat += measure;
}
function onKeyPressed(e) {
    if (e.key === ' ') {
        if (song) {
            song.paused ? song.play() : song.pause();
        }
    }
    if (e.key === 'ArrowRight') {
        increment++;
        increment = Math.min(increments.length - 1, increment);
    }
    if (e.key === 'ArrowLeft') {
        increment--;
        increment = Math.max(0, increment);
    }
    if (e.key === 'ArrowUp') {
        addBeat(-1 / increments[increment]);
        song.currentTime = floorToNearestBeat(song, 1 / increments[increment]) * (60 / modchart.BPMS[0][1]);
    }
    if (e.key === 'ArrowDown') {
        addBeat(1 / increments[increment]);
        song.currentTime = ceilToNearestBeat(song, 1 / increments[increment]) * (60 / modchart.BPMS[0][1]);
    }
}
document.addEventListener('keydown', onKeyPressed);
class Player {
    scene;
    camera;
    mods;
    notes;
    receptors;
    model;
    pn;
    constructor(pn, x) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.notes = [];
        this.mods = {
            rotationx: 0,
            rotationy: 0,
            rotationz: 0,
            wave: 0,
            x: 0,
            y: 0,
            z: 0,
            zoom: 100,
            zoomx: 100,
            zoomy: 100,
            zoomz: 100,
            skewx: 0,
            skewy: 0,
            xmod: 1.5,
            tipsy: 0,
            tipsyspeed: 0,
            tipsyoffset: 0,
            tipsyspacing: 0,
            flip: 0,
            invert: 0,
            alternate: 0,
            reverse: 0,
            drunk: 50,
            drunkspeed: 0,
            drunkspacing: 0,
            drunkoffset: 0,
            confusion: 0,
            confusionxoffset: 0,
            confusionyoffset: 0,
            confusionzoffset: 0,
            movex: 0,
            movey: 0,
            dark: 50,
            vanish: 0,
            stealth: 75,
        };
        for (let i = 0; i < 4; i++) {
            this.mods[`dark${i}`] = 0;
            this.mods[`vanish${i}`] = 0;
            this.mods[`stealth${i}`] = 0;
            this.mods[`movex${i}`] = 0;
            this.mods[`movey${i}`] = 0;
            this.mods[`tipsy${i}`] = 0;
            this.mods[`tipsyspeed${i}`] = 0;
            this.mods[`tipsyoffset${i}`] = 0;
            this.mods[`tipsyspacing${i}`] = 0;
            this.mods[`confusion${i}`] = 0;
            this.mods[`confusionxoffset${i}`] = 0;
            this.mods[`confusionyoffset${i}`] = 0;
            this.mods[`confusionzoffset${i}`] = 0;
            this.mods[`drunk${i}`] = 0;
            this.mods[`drunkspeed${i}`] = 0;
            this.mods[`drunkspacing${i}`] = 0;
            this.mods[`drunkoffset${i}`] = 0;
            this.mods[`wave${i}`] = 0;
        }
        this.pn = Math.floor(pn);
        this.model = new THREE.Mesh(new THREE.PlaneGeometry(4, 8), new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.0
        }));
        this.scene.add(this.model);
        this.receptors = new Array(4).fill(0).map((_, i) => {
            const receptor = new Receptor(i);
            this.model.add(receptor.model);
            return receptor;
        });
        this.camera.position.z = 10;
        this.camera.setViewOffset(640, 480, x / 2, 0, 640, 480);
    }
    update() {
        this.model.rotation.set(this.mods['rotationx'], this.mods['rotationy'], this.mods['rotationz']);
        this.scene.scale.set((this.mods['zoomx'] * this.mods['zoom']) / 10000, (this.mods['zoomy'] * this.mods['zoom']) / 10000, (this.mods['zoomz'] * this.mods['zoom']) / 10000);
        let time = song.currentTime;
        this.receptors.forEach((receptor, i) => {
            receptor.setDark(this.mods[`dark${i}`] + this.mods['dark']);
            let flash = (songBeat % 1) < 0.25 ? 0 : 0.5;
            receptor.model.material.map.offset.x = flash;
            let notesInRow = this.notes.filter(note => note.lane === i);
            notesInRow.forEach(note => {
                if (note.beat < songBeat && note.beat + note.len > songBeat && note.type === 1) {
                    receptor.setGlow(100);
                }
                else if (note.beat <= songBeat && note.beat + 0.1 >= songBeat && note.type === 0) {
                    receptor.setGlow(100);
                }
                else if (note.beat <= songBeat && note.beat + note.len >= songBeat && note.type === 4) {
                    let tri = Math.abs((songBeat - note.beat) * 2 % 1 - 0.5) * 2;
                    receptor.setGlow(tri * 100);
                }
                else {
                    receptor.setGlow(receptor.getGlow() - 0.5);
                }
                if (this.mods.stealth > 0) {
                    note.model.material.opacity = 1 - (this.mods.stealth / 100);
                    if (note.holdBody) {
                        note.holdBody.material.opacity = 1 - (this.mods.stealth / 100);
                        note.tail.material.opacity = 1 - (this.mods.stealth / 100);
                    }
                }
                note.update();
                const drunk = (this.mods['drunk'] + this.mods[`drunk${i}`]) / 100;
                const tipsy = ((this.mods['tipsy'] + this.mods[`tipsy${i}`]) / 100) * Math.sin((this.mods['tipsyspeed'] / 100 + 1) * time + (i * ((this.mods['tipsyspacing'] / 100) + 1) + (this.mods['tipsyoffset'] / 100)) * 0.5);
                const spline = receptor.spline;
                const points = spline.points;
                for (let j = 0; j < points.length; j++) {
                    points[j].x = (drunk * Math.sin(j + i / 4)) + (i - 1.5) * ((this.mods.flip / -50) + 1);
                    points[j].y = tipsy * (j / 10) + j - 7;
                }
                const confusion = (this.mods['confusion'] + this.mods[`confusion${i}`]) / 100;
                const confusionxoffset = (this.mods['confusionxoffset'] + this.mods[`confusionxoffset${i}`]) / 100;
                const confusionyoffset = (this.mods['confusionyoffset'] + this.mods[`confusionyoffset${i}`]) / 100;
                const confusionzoffset = (this.mods['confusionzoffset'] + this.mods[`confusionzoffset${i}`]) / 100;
                let splinePosition = receptor.spline.getPosition((note.beat - songBeat) / modchart.BPMS[0][1] * -this.mods.xmod * 25 + 1);
                note.model.position.set(splinePosition.x, splinePosition.y, splinePosition.z);
                note.model.rotation.z = i < 1 ? -Math.PI / 2 : i < 2 ? 0 : i > 2 ? Math.PI / 2 : Math.PI;
                note.model.rotation.z += time * confusion + confusionzoffset;
                note.model.rotation.x = confusionxoffset;
                note.model.rotation.y = confusionyoffset;
                if (note.beat < songBeat) {
                    note.model.material.opacity = 0;
                }
                else {
                    note.model.material.opacity = 1;
                }
            });
            receptor.update(this);
            receptor.model.rotation.z = i < 1 ? -Math.PI / 2 : i < 2 ? 0 : i > 2 ? Math.PI / 2 : Math.PI;
            receptor.model.rotation.z += time * (this.mods['confusion'] / 100) + (this.mods['confusionzoffset'] / 100);
            receptor.model.position.x += (this.mods['movex'] / 100);
        });
    }
}
class Spline {
    points;
    curve;
    spline;
    constructor(points) {
        this.points = points;
        this.curve = new THREE.CatmullRomCurve3(points);
        const points2 = this.curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points2);
        const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2, transparent: true, opacity: 1 });
        this.spline = new THREE.Line(geometry, material);
    }
    getPosition(beat) {
        beat = THREE.MathUtils.clamp(beat, 0, 1);
        return this.curve.getPointAt(beat);
    }
    setPosition(index, position) {
        this.points[index].set(position.x, position.y, position.z);
    }
}
let songBeat = 0;
let modchart;
class Mod {
    type;
    beat;
    len;
    ease;
    mods;
    values;
    constructor(...args) {
        this.type = args[0];
        this.beat = parseFloat(args[1]);
        if (this.type === 'ease' || this.type === 'func_ease') {
            this.len = parseFloat(args[2]);
            this.ease = args[3];
        }
        else {
            this.len = null;
            this.ease = null;
        }
        if (this.len && this.len == 0 || this.ease && this.ease == 'instant') {
            this.len = null;
            this.ease = null;
        }
        if (!this.len && !this.ease) {
            this.type = 'set';
        }
        else if (!this.len) {
            this.type = 'set';
        }
        this.mods = [];
        this.values = [];
        for (let i = this.len ? 4 : 2; i < args.length; i++) {
            if (i % 2 === 0) {
                this.values.push(parseFloat(args[i]));
            }
            else {
                this.mods.push(args[i]);
            }
        }
    }
    toString() {
        if (this.type === 'set') {
            let str = '';
            for (let i = 0; i < (this.mods.length + this.values.length) / 2; i++) {
                str += `${this.values[i]}, ${this.mods[i]}, `;
            }
            return `${this.type}{${str}}`;
        }
        else if (this.type === 'ease') {
            let str = '';
            for (let i = 0; i < (this.mods.length + this.values.length) / 2; i++) {
                str += `${this.values[i]}, ${this.mods[i]}, `;
            }
            return `${this.type}{${this.beat}, ${this.len}, ${this.ease}, ${str}}`;
        }
        else if (this.type === 'func_ease') {
            let str = '';
            for (let i = 0; i < (this.mods.length + this.values.length) / 2; i++) {
                str += `${this.values[i]}, ${this.mods[i]}, `;
            }
            return `${this.type}{${this.beat}, ${this.len}, ${this.ease}, ${str}}`;
        }
    }
}
renderer.getClearColor(new THREE.Color(0xffffff));
renderer.autoClear = false;
document.addEventListener('wheel', (e) => {
    if (e.deltaY > 0) {
        addBeat(1 / increments[increment]);
    }
    else {
        addBeat(-1 / increments[increment]);
    }
});
class Note {
    type;
    lane;
    beat;
    len;
    player;
    model;
    holdBody;
    tail;
    constructor(type, lane, beat, len = 0, player) {
        this.type = type;
        this.lane = lane;
        this.beat = beat;
        this.len = len;
        this.player = player;
        this.model = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
            transparent: true,
            map: new THREE.TextureLoader().load(`./images/tex notes.png`, tex => {
                let ox = 0;
                let oy = 3;
                if (Math.round((beat % 1) * 128) / 128 === .5) {
                    ox = 1;
                    oy = 3;
                }
                else if (Math.round((beat % 1) * 128) / 128 === 1 / 3) {
                    ox = 2;
                    oy = 3;
                }
                else if (Math.round((beat % 1) * 128) / 128 === 2 / 3) {
                    ox = 0;
                    oy = 2;
                }
                else if (Math.round((beat % 1) * 128) / 128 === 1 / 4) {
                    ox = 3;
                    oy = 3;
                }
                else if (Math.round((beat % 1) * 128) / 128 === 3 / 4) {
                    ox = 3;
                    oy = 3;
                }
                tex.offset.x = ox / 4;
                tex.offset.y = oy / 4;
                tex.repeat.x = 1 / 4;
                tex.repeat.y = 1 / 4;
            }),
            depthWrite: false,
            depthTest: false
        }));
        this.model.rotation.z = lane < 1 ? -Math.PI / 2 : lane < 2 ? 0 : lane > 2 ? Math.PI / 2 : Math.PI;
        this.holdBody = null;
        this.tail = null;
        if (type === 1) {
            this.holdBody = new THREE.Mesh(new THREE.PlaneGeometry(1, len, 1, len * 8), new THREE.MeshBasicMaterial({
                transparent: true,
                map: new THREE.TextureLoader().load(`./images/tex notes.png`, tex => {
                    tex.offset.x = 2 / 4;
                    tex.repeat.x = 1 / 4;
                    tex.offset.y = 1 / 4;
                    tex.repeat.y = 1 / 4;
                    tex.minFilter = THREE.NearestFilter;
                    tex.magFilter = THREE.NearestFilter;
                }),
                side: THREE.DoubleSide,
                opacity: 0.5,
                depthWrite: false,
                depthTest: false
            }));
            let position = this.player.receptors[this.lane].spline.getPosition(0);
            this.holdBody.position.set(position.x, position.y, position.z);
            this.player.scene.add(this.holdBody);
            this.tail = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
                transparent: true,
                map: new THREE.TextureLoader().load(`./images/tex notes.png`, tex => {
                    tex.offset.x = 2 / 4;
                    tex.repeat.x = 1 / 4;
                    tex.offset.y = 0 / 4;
                    tex.repeat.y = 1 / 4;
                    tex.minFilter = THREE.NearestFilter;
                    tex.magFilter = THREE.NearestFilter;
                }),
                side: THREE.DoubleSide,
                depthWrite: false,
                depthTest: false
            }));
            this.player.scene.add(this.tail);
        }
        else if (type === 4) {
            this.holdBody = new THREE.Mesh(new THREE.PlaneGeometry(1, len, 1, len * 8), new THREE.MeshBasicMaterial({
                transparent: true,
                map: new THREE.TextureLoader().load(`./images/tex notes.png`, tex => {
                    tex.offset.x = 3 / 4;
                    tex.repeat.x = 1 / 4;
                    tex.offset.y = 1 / 4;
                    tex.repeat.y = 1 / 4;
                    tex.minFilter = THREE.NearestFilter;
                    tex.magFilter = THREE.NearestFilter;
                }),
                side: THREE.DoubleSide,
                opacity: 0.5,
                depthWrite: false,
                depthTest: false
            }));
            let position = this.player.receptors[this.lane].spline.getPosition(0);
            this.holdBody.position.set(position.x, position.y, position.z);
            this.player.scene.add(this.holdBody);
            this.tail = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
                transparent: true,
                map: new THREE.TextureLoader().load(`./images/tex notes.png`, tex => {
                    tex.offset.x = 3 / 4;
                    tex.repeat.x = 1 / 4;
                    tex.offset.y = 0 / 4;
                    tex.repeat.y = 1 / 4;
                    tex.minFilter = THREE.NearestFilter;
                    tex.magFilter = THREE.NearestFilter;
                }),
                side: THREE.DoubleSide,
                depthWrite: false,
                depthTest: false
            }));
            let position2 = this.player.receptors[this.lane].spline.getPosition(1);
            this.tail.position.set(position2.x, position2.y, position2.z);
            this.player.scene.add(this.tail);
        }
        else if (type === 2) {
            this.model.material.map = new THREE.TextureLoader().load(`./images/tex notes.png`, tex => {
                tex.offset.x = 1 / 4;
                tex.repeat.x = 1 / 4;
                tex.offset.y = 1 / 4;
                tex.repeat.y = 1 / 4;
            });
        }
        this.player.notes.push(this);
        this.player.scene.add(this.model);
    }
    update() {
        let player = this.player;
        let receptor = player.receptors[this.lane];
        let pos = this.model.position.clone();
        this.holdBody?.position.set(pos.x, pos.y, pos.z);
        if (this.beat + this.len < songBeat) {
            if (this.holdBody) {
                this.holdBody.material.opacity = 0;
                this.tail.material.opacity = 0;
            }
        }
        else {
            if (this.holdBody) {
                this.holdBody.material.opacity = 1;
                this.tail.material.opacity = 1;
                let points = this.holdBody.geometry.attributes.position.array;
                let holdWidth = 1;
                let spline = receptor.spline;
                this.holdBody.position.set(0, 0, 0);
                this.holdBody.geometry.attributes.position.needsUpdate = true;
                for (let i = 0; i < points.length; i += 6) {
                    let beat = (i / points.length) * this.len;
                    let normalizedBeat = ((this.beat + beat - songBeat) / modchart.BPMS[0][1]) * -player.mods.xmod * 25 + 1;
                    let position = spline.getPosition(normalizedBeat);
                    points[i] = position.x - holdWidth / 2;
                    points[i + 1] = position.y;
                    points[i + 2] = position.z;
                    points[i + 3] = position.x + holdWidth / 2;
                    points[i + 4] = position.y;
                    points[i + 5] = position.z;
                }
                this.holdBody.geometry.attributes.position.needsUpdate = true;
                if (this.tail) {
                    let normalizedBeat = ((this.beat + this.len - songBeat) / modchart.BPMS[0][1]) * -player.mods.xmod * 25 + 1;
                    let yOffset = this.player.mods.xmod / 100;
                    let position = spline.getPosition(normalizedBeat + yOffset);
                    this.tail.position.set(position.x, position.y, position.z);
                }
            }
        }
    }
}
class Chart {
    notes;
    type;
    credit;
    difficulty;
    meter;
    radarValues;
    constructor(chart, player) {
        this.notes = [];
        let chartArr = chart.split('\n').map(line => line.trim());
        let someData = chartArr.slice(0, 5).map(line => line.slice(0, line.indexOf(':')));
        this.type = "";
        this.credit = "";
        this.difficulty = "";
        this.meter = 0;
        this.radarValues = [];
        let chartArr2 = chartArr.slice(5).join('\n').split(',').map(line => line.trim());
        this.type = someData[0];
        this.credit = someData[1];
        this.difficulty = someData[2];
        this.meter = parseFloat(someData[3]);
        this.radarValues = someData[4].split(',').map(value => parseFloat(value));
        let isHold = [false, false, false, false];
        let holdStarts = [0, 0, 0, 0];
        let holdEnds = [0, 0, 0, 0];
        let isRoll = [false, false, false, false];
        let rollStarts = [0, 0, 0, 0];
        let rollEnds = [0, 0, 0, 0];
        let beat = 0;
        for (let line of chartArr2) {
            let line2 = line.split('\n').map(line => line.split(''));
            for (let i of line2) {
                for (let j = 0; j < 4; j++) {
                    if (i[j] === '1') {
                        this.notes.push(new Note(0, j, beat, 0, player));
                    }
                    else if (i[j] === '2') {
                        holdStarts[j] = beat;
                        isHold[j] = true;
                    }
                    else if (i[j] === '3' && (isHold[j] || isRoll[j])) {
                        holdEnds[j] = beat;
                        this.notes.push(new Note(isHold[j] ? 1 : 4, j, holdStarts[j] ? holdStarts[j] : rollStarts[j], holdEnds[j] - (holdStarts[j] ? holdStarts[j] : rollStarts[j]), player));
                        isHold[j] = false;
                        isRoll[j] = false;
                        holdStarts[j] = 0;
                        holdEnds[j] = 0;
                    }
                    else if (i[j] === '4') {
                        rollStarts[j] = beat;
                        isRoll[j] = true;
                    }
                    else if (i[j] === 'M') {
                        this.notes.push(new Note(2, j, beat, 0, player));
                    }
                }
                beat += i.length / line2.length;
            }
        }
        console.log("Chart loaded!");
    }
}
class SMFile {
    TITLE;
    SUBTITLE;
    ARTIST;
    TITLETRANSLIT;
    SUBTITLETRANSLIT;
    ARTISTTRANSLIT;
    GENRE;
    MUSIC;
    CREDIT;
    BANNER;
    BACKGROUND;
    CDTITLE;
    SAMPLESTART;
    SAMPLELENGTH;
    SELECTABLE;
    OFFSET;
    BPMS;
    STOPS;
    BGCHANGES;
    FGCHANGES;
    NOTES1;
    NOTES2;
    constructor(smFileContents) {
        let smFile = smFileContents;
        this.TITLE = this.getSMValue(smFile, 'TITLE');
        this.SUBTITLE = this.getSMValue(smFile, 'SUBTITLE');
        this.ARTIST = this.getSMValue(smFile, 'ARTIST');
        this.TITLETRANSLIT = this.getSMValue(smFile, 'TITLETRANSLIT');
        this.SUBTITLETRANSLIT = this.getSMValue(smFile, 'SUBTITLETRANSLIT');
        this.ARTISTTRANSLIT = this.getSMValue(smFile, 'ARTISTTRANSLIT');
        this.GENRE = this.getSMValue(smFile, 'GENRE');
        this.MUSIC = this.getSMValue(smFile, 'MUSIC');
        this.CREDIT = this.getSMValue(smFile, 'CREDIT');
        this.BANNER = this.getSMValue(smFile, 'BANNER');
        this.BACKGROUND = this.getSMValue(smFile, 'BACKGROUND');
        this.CDTITLE = this.getSMValue(smFile, 'CDTITLE');
        this.SAMPLESTART = parseFloat(this.getSMValue(smFile, 'SAMPLESTART'));
        this.SAMPLELENGTH = parseFloat(this.getSMValue(smFile, 'SAMPLELENGTH'));
        this.SELECTABLE = this.getSMValue(smFile, 'SELECTABLE') === 'YES';
        this.OFFSET = parseFloat(this.getSMValue(smFile, 'OFFSET'));
        this.BPMS = this.getSMValue(smFile, 'BPMS').split(',').map(bpm => bpm.split('=')).map(([beat, bpm]) => [parseFloat(beat), parseFloat(bpm)]);
        this.STOPS = this.getSMValue(smFile, 'STOPS').split(',').map(stop => stop.split('=')).map(([beat, stop]) => [parseFloat(beat), parseFloat(stop)]);
        this.BGCHANGES = this.getSMValue(smFile, 'BGCHANGES');
        this.FGCHANGES = this.getSMValue(smFile, 'FGCHANGES');
        this.NOTES1 = new Chart(this.getSMValue(smFile, 'NOTES'), data.player1);
        this.NOTES2 = new Chart(this.getSMValue(smFile, 'NOTES'), data.player2);
        this.STOPS = this.STOPS.filter(([beat, stop]) => !isNaN(beat) && !isNaN(stop));
        console.log("SM File loaded!");
    }
    getSMValue(smFile, key) {
        let match = smFile.match(new RegExp(`#${key}:([^;]+)`));
        if (match) {
            return match[1].trim();
        }
        return '';
    }
}
let data = {
    player1: new Player(1, scx),
    player2: new Player(2, -scx)
};
onResize();
animate();
