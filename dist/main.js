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
    depthWrite: false
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
    tex.offset.x = i / 2;
    tex.repeat.x = 1 / 2;
    tex.offset.y = 0;
    tex.repeat.y = 1;
}));
const receptorGlowImage = new Array(4).fill(0).map((_, i) => new THREE.TextureLoader().load(`./images/tex glow.png`, tex => {
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
}));
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
        setTimeout(animate, 1000 / 1);
        return;
    }
    data.player1.update();
    data.player2.update();
    setTimeout(animate, 1000 / 60);
};
window.addEventListener('resize', () => {
    if (window.innerWidth / window.innerHeight > displayRatio) {
        renderer.setSize(window.innerHeight * displayRatio, window.innerHeight);
        [data.player1, data.player2].forEach(player => {
            player.camera.aspect = window.innerHeight * displayRatio / window.innerHeight;
            player.camera.updateProjectionMatrix();
        });
    }
    else {
        renderer.setSize(window.innerWidth, window.innerWidth / displayRatio);
        [data.player1, data.player2].forEach(player => {
            player.camera.aspect = window.innerWidth / (window.innerWidth / displayRatio);
            player.camera.updateProjectionMatrix();
        });
    }
});
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
                console.log(entries);
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
            new THREE.Vector3(i - 1.5, -6, 0),
            new THREE.Vector3(i - 1.5, 3, 0),
        ]);
        this.model = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
            transparent: true,
            map: receptorImage[0]
        }));
        this.model.position.x = i - 1.5;
        this.model.position.y = 3;
        this.model.rotation.z = i < 1 ? -Math.PI / 2 : i < 2 ? 0 : i > 2 ? Math.PI / 2 : Math.PI;
        this.receptorGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({
            transparent: true,
            map: receptorGlowImage[0],
            opacity: 0.5
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
    position;
    mods;
    notes;
    receptors;
    model;
    pn;
    constructor(pn, x, y) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.position = new THREE.Vector3(x, y, 0);
        this.notes = [];
        this.mods = {
            rotationx: 0,
            rotationy: 0,
            rotationz: 0,
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
            cmod: 150,
            tipsy: 0,
            tipsyspeed: 0,
            tipsyoffset: 0,
            tipsyspacing: 0,
            flip: 0,
            invert: 0,
            alternate: 0,
            drunk: 25,
            drunkspeed: 0,
            drunkspacing: 0,
            drunkoffset: 0,
            confusion: 0,
            confusionxoffset: 0,
            confusionyoffset: 0,
            confusionzoffset: 0,
            movex: 0,
            movey: 0,
            dark: 0,
            vanish: 0,
            stealth: 0,
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
        }
        this.pn = Math.floor(pn);
        this.model = new THREE.Mesh(new THREE.PlaneGeometry(4, 8), new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.0
        }));
        this.model.position.x = x / 100;
        this.model.position.y = y / 100;
        this.scene.add(this.model);
        this.receptors = new Array(4).fill(0).map((_, i) => {
            const receptor = new Receptor(i);
            this.model.add(receptor.model);
            return receptor;
        });
        this.camera.position.z = 7.5;
    }
    update() {
        this.model.position.set(this.position.x / 100 + this.mods['x'] / 100, this.position.y / 100 + this.mods['y'] / 100, this.mods['z'] / 100);
        this.model.rotation.set(this.mods['rotationx'], this.mods['rotationy'], this.mods['rotationz']);
        this.model.scale.set(this.mods['zoomx'] / 100, this.mods['zoomy'] / 100, this.mods['zoomz'] / 100);
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
                    receptor.setGlow(100);
                }
                else {
                    receptor.setGlow(receptor.getGlow() - 0.5);
                }
                note.update();
                const drunk = ((this.mods['drunk'] + this.mods[`drunk${i}`]) / 100) * Math.sin((this.mods['drunkspeed'] / 100 + 1) * time + (i * ((this.mods['drunkspacing'] / 100) + 1) + (this.mods['drunkoffset'] / 100)) * 0.5);
                const spline = receptor.spline;
                const points = spline.points;
                for (let j = 0; j < points.length; j++) {
                    points[j].x = drunk + i - 1.5;
                }
                const tipsy = (this.mods['tipsy'] + this.mods[`tipsy${i}`]) / 100;
                const tipsyspeed = (this.mods['tipsyspeed'] + this.mods[`tipsyspeed${i}`]) / 100;
                const tipsyoffset = (this.mods['tipsyoffset'] + this.mods[`tipsyoffset${i}`]) / 100;
                const tipsyspacing = (this.mods['tipsyspacing'] + this.mods[`tipsyspacing${i}`]) / 100;
                const confusion = (this.mods['confusion'] + this.mods[`confusion${i}`]) / 100;
                const confusionxoffset = (this.mods['confusionxoffset'] + this.mods[`confusionxoffset${i}`]) / 100;
                const confusionyoffset = (this.mods['confusionyoffset'] + this.mods[`confusionyoffset${i}`]) / 100;
                const confusionzoffset = (this.mods['confusionzoffset'] + this.mods[`confusionzoffset${i}`]) / 100;
                const movex = (this.mods['movex'] + this.mods[`movex${i}`] + this.mods['x']) / 100;
                const movey = (this.mods['movey'] + this.mods[`movey${i}`] + this.mods['y']) / 100;
                let splinePosition = receptor.spline.getPosition((note.beat - songBeat) / modchart.BPMS[0][1] * -this.mods.xmod * 25 + 1);
                note.model.position.set(splinePosition.x, splinePosition.y, splinePosition.z);
                note.model.position.y += (tipsy) * Math.sin(((tipsyspeed + 100) / 100) * time + (i * (((tipsyspacing + 100) / 100)) + (tipsyoffset / 100)) * 0.5);
                note.model.rotation.z = i < 1 ? -Math.PI / 2 : i < 2 ? 0 : i > 2 ? Math.PI / 2 : Math.PI;
                note.model.rotation.z += time * confusion + confusionzoffset;
                if (note.beat < songBeat) {
                    note.model.material.opacity = 0;
                }
                else {
                    note.model.material.opacity = 1;
                }
            });
            receptor.update(this);
            receptor.model.position.y += (this.mods['tipsy'] / 100) * Math.sin(((this.mods['tipsyspeed'] + 100) / 100) * time + (i * ((this.mods['tipsyspacing'] + 100) / 100) + (this.mods['tipsyoffset'] / 100)) * 0.5);
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
        const curve = new THREE.CatmullRomCurve3(points);
        this.curve = curve;
        const points2 = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points2);
        const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2, transparent: true, opacity: 1 });
        const spline = new THREE.Line(geometry, material);
        this.spline = spline;
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
    constructor(type, lane, beat, len = 0, player) {
        this.type = type;
        this.lane = lane;
        this.beat = beat;
        this.len = len;
        this.player = player;
        this.model = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
            transparent: true,
            map: new THREE.TextureLoader().load(`./images/tex notes.png`, tex => {
                tex.offset.x = 0 / 4;
                tex.repeat.x = 1 / 4;
                tex.offset.y = 3 / 4;
                tex.repeat.y = 1 / 4;
            })
        }));
        this.model.rotation.z = lane < 1 ? -Math.PI / 2 : lane < 2 ? 0 : lane > 2 ? Math.PI / 2 : Math.PI;
        this.holdBody = null;
        if (type === 1) {
        }
        this.player.notes.push(this);
        this.player.scene.add(this.model);
    }
    update() {
        let player = this.player;
        let receptor = player.receptors[this.lane];
        let normalizedBeat = ((this.beat - songBeat) / modchart.BPMS[0][1]) * -player.mods.xmod * 25 + 1;
        let position = receptor.spline.getPosition(normalizedBeat);
        this.model.position.set(position.x + (this.player.position.x / 100), position.y, position.z);
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
    player1: new Player(1, -scx, 0),
    player2: new Player(2, scx, 0)
};
animate();
