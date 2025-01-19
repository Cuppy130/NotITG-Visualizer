"use strict";
var PlayerOptions;
(function (PlayerOptions_1) {
    class PlayerOptions {
        maxScrollBPM = 0;
        timeSpacing = 0;
        scrollSpeed = 1;
        scrollBPM = 200;
        accels = [];
        effects = [];
        appearances = [];
        scrolls = [];
        dark = 0;
        blind = 0;
        cover = 0;
        setTiltOrSkew = false;
        perspectiveTilt = 0;
        skew = 0;
        passmark = 0;
        randomSpeed = 0;
        timingScale = 1;
        turns;
        transforms = [];
        scoreDisplay = 0;
        noteSkin = "default";
        speedMaxScrollBPM = 1;
        speedTimeSpacing = 1;
        speedScrollSpeed = 1;
        speedScrollBPM = 1;
        speedAccels = [];
        speedEffects = [];
        speedAppearances = [];
        speedScrolls = [];
        speedDark = 1;
        speedBlind = 1;
        speedCover = 1;
        speedPerspectiveTilt = 1;
        speedSkew = 1;
        speedPassmark = 1;
        speedRandomSpeed = 1;
        speedTimingScale = 1;
        constructor() {
            this.maxScrollBPM = 0;
            this.timeSpacing = 0;
            this.scrollSpeed = 1;
            this.scrollBPM = 200;
            this.accels = [];
            this.effects = [];
            this.appearances = [];
            this.scrolls = [];
            this.dark = 0;
            this.blind = 0;
            this.cover = 0;
            this.setTiltOrSkew = false;
            this.perspectiveTilt = 0;
            this.skew = 0;
            this.passmark = 0;
            this.randomSpeed = 0;
            this.timingScale = 1;
            this.turns = new Array(Turn.NUM_TURNS).fill(false);
            this.transforms = new Array(Transform.NUM_TRANSFORMS).fill(false);
            this.scoreDisplay = ScoreDisplay.SCORING_ADD;
            this.noteSkin = "default";
            this.speedMaxScrollBPM = 1;
            this.speedTimeSpacing = 1;
            this.speedScrollSpeed = 1;
            this.speedScrollBPM = 1;
            this.speedAccels = [];
            this.speedEffects = [];
            this.speedAppearances = [];
            this.speedScrolls = [];
            this.speedDark = 1;
            this.speedBlind = 1;
            this.speedCover = 1;
            this.speedPerspectiveTilt = 1;
            this.speedSkew = 1;
            this.speedPassmark = 1;
            this.speedRandomSpeed = 1;
            this.speedTimingScale = 1;
        }
        getFirstAccel() {
        }
        getString() {
            const mods = [];
            this.getMods(mods);
            return mods.join(", ");
        }
        getMods(addTo = []) {
            let sReturn;
            if (!this.timeSpacing) {
                if (this.maxScrollBPM) {
                    addTo.push(`m${this.maxScrollBPM}`);
                }
                else if (this.scrollSpeed != 1) {
                    let s = this.scrollSpeed.toFixed(2);
                    if (s[s.length - 1] == '0') {
                        s = s.substring(0, s.length - 1);
                        if (s[s.length - 1] == '0') {
                            s = s.substring(0, s.length - 2);
                        }
                    }
                    addTo.push(`${s}x`);
                }
            }
            else {
                addTo.push(`C${this.timeSpacing}`);
            }
            this.addPart(addTo, this.accels[Accel.ACCEL_BOOST], "Boost");
            this.addPart(addTo, this.accels[Accel.ACCEL_BRAKE], "Brake");
            this.addPart(addTo, this.accels[Accel.ACCEL_WAVE], "Wave");
            this.addPart(addTo, this.accels[Accel.ACCEL_EXPAND], "Expand");
            this.addPart(addTo, this.accels[Accel.ACCEL_BOOMERANG], "Boomerang");
            this.addPart(addTo, this.effects[Effect.EFFECT_DRUNK], "Drunk");
            this.addPart(addTo, this.effects[Effect.EFFECT_DIZZY], "Dizzy");
            this.addPart(addTo, this.effects[Effect.EFFECT_TWIRL], "Twirl");
            this.addPart(addTo, this.effects[Effect.EFFECT_ROLL], "Roll");
            this.addPart(addTo, this.effects[Effect.EFFECT_MINI], "Mini");
            this.addPart(addTo, this.effects[Effect.EFFECT_FLIP], "Flip");
            this.addPart(addTo, this.effects[Effect.EFFECT_INVERT], "Invert");
            this.addPart(addTo, this.effects[Effect.EFFECT_TORNADO], "Tornado");
            this.addPart(addTo, this.effects[Effect.EFFECT_TIPSY], "Tipsy");
            this.addPart(addTo, this.effects[Effect.EFFECT_BUMPY], "Bumpy");
            this.addPart(addTo, this.effects[Effect.EFFECT_BEAT], "Beat");
            this.addPart(addTo, this.appearances[Appearance.APPEARANCE_HIDDEN], "Hidden");
            this.addPart(addTo, this.appearances[Appearance.APPEARANCE_HIDDEN_OFFSET], "HiddenOffset");
            this.addPart(addTo, this.appearances[Appearance.APPEARANCE_SUDDEN], "Sudden");
            this.addPart(addTo, this.appearances[Appearance.APPEARANCE_SUDDEN_OFFSET], "SuddenOffset");
            this.addPart(addTo, this.appearances[Appearance.APPEARANCE_STEALTH], "Stealth");
            this.addPart(addTo, this.appearances[Appearance.APPEARANCE_BLINK], "Blink");
            this.addPart(addTo, this.appearances[Appearance.APPEARANCE_RANDOMVANISH], "RandomVanish");
            this.addPart(addTo, this.scrolls[Scroll.SCROLL_REVERSE], "Reverse");
            this.addPart(addTo, this.scrolls[Scroll.SCROLL_SPLIT], "Split");
            this.addPart(addTo, this.scrolls[Scroll.SCROLL_ALTERNATE], "Alternate");
            this.addPart(addTo, this.scrolls[Scroll.SCROLL_CROSS], "Cross");
            this.addPart(addTo, this.scrolls[Scroll.SCROLL_CENTERED], "Centered");
            this.addPart(addTo, this.dark, "Dark");
            this.addPart(addTo, this.blind, "Blind");
            this.addPart(addTo, this.cover, "Cover");
            this.addPart(addTo, this.passmark, "Passmark");
            this.addPart(addTo, this.randomSpeed, "RandomSpeed");
            if (this.timingScale != 1)
                this.addPart(addTo, this.timingScale, "Timing");
            if (this.turns[Turn.TURN_MIRROR])
                addTo.push("Mirror");
            if (this.turns[Turn.TURN_LEFT])
                addTo.push("Left");
            if (this.turns[Turn.TURN_RIGHT])
                addTo.push("Right");
            if (this.turns[Turn.TURN_SHUFFLE])
                addTo.push("Shuffle");
            if (this.turns[Turn.TURN_SUPER_SHUFFLE])
                addTo.push("SuperShuffle");
            if (this.transforms[Transform.TRANSFORM_NOHOLDS])
                addTo.push("NoHolds");
            if (this.transforms[Transform.TRANSFORM_HOLDSTOROLLS])
                addTo.push("HoldsToRolls");
            if (this.transforms[Transform.TRANSFORM_NOROLLS])
                addTo.push("NoRolls");
            if (this.transforms[Transform.TRANSFORM_NOMINES])
                addTo.push("NoMines");
            if (this.transforms[Transform.TRANSFORM_LITTLE])
                addTo.push("Little");
            if (this.transforms[Transform.TRANSFORM_WIDE])
                addTo.push("Wide");
            if (this.transforms[Transform.TRANSFORM_BIG])
                addTo.push("Big");
            if (this.transforms[Transform.TRANSFORM_QUICK])
                addTo.push("Quick");
            if (this.transforms[Transform.TRANSFORM_BMRIZE])
                addTo.push("BMRize");
            if (this.transforms[Transform.TRANSFORM_SKIPPY])
                addTo.push("Skippy");
            if (this.transforms[Transform.TRANSFORM_MINES])
                addTo.push("Mines");
            if (this.transforms[Transform.TRANSFORM_ECHO])
                addTo.push("Echo");
            if (this.transforms[Transform.TRANSFORM_STOMP])
                addTo.push("Stomp");
            if (this.transforms[Transform.TRANSFORM_PLANTED])
                addTo.push("Planted");
            if (this.transforms[Transform.TRANSFORM_FLOORED])
                addTo.push("Floored");
            if (this.transforms[Transform.TRANSFORM_TWISTER])
                addTo.push("Twister");
            if (this.transforms[Transform.TRANSFORM_NOJUMPS])
                addTo.push("NoJumps");
            if (this.transforms[Transform.TRANSFORM_NOHANDS])
                addTo.push("NoHands");
            if (this.transforms[Transform.TRANSFORM_NOQUADS])
                addTo.push("NoQuads");
            if (this.transforms[Transform.TRANSFORM_NOSTRETCH])
                addTo.push("NoStretch");
            const { abs } = Math;
            if (this.skew == 0 && this.perspectiveTilt == 0) {
                if (this.setTiltOrSkew)
                    addTo.push("Overhead");
            }
            else if (this.skew == 0) {
                if (this.perspectiveTilt > 0)
                    addTo.push("Distant");
                else
                    addTo.push("Hallway");
            }
            else if (abs(this.skew - this.perspectiveTilt) < 0.0001) {
                this.addPart(addTo, this.skew, "Space");
            }
            else if (abs(this.skew + this.perspectiveTilt) < 0.0001) {
                this.addPart(addTo, this.skew, "Incoming");
            }
            if (!this.empty(this.noteSkin) && this.compareNoCase("default")) {
                addTo = addTo.reverse();
                addTo.push(this.noteSkin.toLowerCase());
                addTo = addTo.reverse();
            }
        }
        compareNoCase(value) {
            return this.noteSkin.toLowerCase() == value.toLowerCase();
        }
        empty(value) {
            return value == null || value == "";
        }
        addPart(addTo, level, name) {
            if (level == 0)
                return;
            addTo.push(level == 1 ? "" : `${Math.round(level * 100)}` + name);
        }
    }
    PlayerOptions_1.PlayerOptions = PlayerOptions;
    let Transform;
    (function (Transform) {
        Transform[Transform["TRANSFORM_NOHOLDS"] = 0] = "TRANSFORM_NOHOLDS";
        Transform[Transform["TRANSFORM_HOLDSTOROLLS"] = 1] = "TRANSFORM_HOLDSTOROLLS";
        Transform[Transform["TRANSFORM_NOROLLS"] = 2] = "TRANSFORM_NOROLLS";
        Transform[Transform["TRANSFORM_NOMINES"] = 3] = "TRANSFORM_NOMINES";
        Transform[Transform["TRANSFORM_LITTLE"] = 4] = "TRANSFORM_LITTLE";
        Transform[Transform["TRANSFORM_WIDE"] = 5] = "TRANSFORM_WIDE";
        Transform[Transform["TRANSFORM_BIG"] = 6] = "TRANSFORM_BIG";
        Transform[Transform["TRANSFORM_QUICK"] = 7] = "TRANSFORM_QUICK";
        Transform[Transform["TRANSFORM_BMRIZE"] = 8] = "TRANSFORM_BMRIZE";
        Transform[Transform["TRANSFORM_SKIPPY"] = 9] = "TRANSFORM_SKIPPY";
        Transform[Transform["TRANSFORM_MINES"] = 10] = "TRANSFORM_MINES";
        Transform[Transform["TRANSFORM_ECHO"] = 11] = "TRANSFORM_ECHO";
        Transform[Transform["TRANSFORM_STOMP"] = 12] = "TRANSFORM_STOMP";
        Transform[Transform["TRANSFORM_PLANTED"] = 13] = "TRANSFORM_PLANTED";
        Transform[Transform["TRANSFORM_FLOORED"] = 14] = "TRANSFORM_FLOORED";
        Transform[Transform["TRANSFORM_TWISTER"] = 15] = "TRANSFORM_TWISTER";
        Transform[Transform["TRANSFORM_NOJUMPS"] = 16] = "TRANSFORM_NOJUMPS";
        Transform[Transform["TRANSFORM_NOHANDS"] = 17] = "TRANSFORM_NOHANDS";
        Transform[Transform["TRANSFORM_NOQUADS"] = 18] = "TRANSFORM_NOQUADS";
        Transform[Transform["TRANSFORM_NOSTRETCH"] = 19] = "TRANSFORM_NOSTRETCH";
        Transform[Transform["NUM_TRANSFORMS"] = 20] = "NUM_TRANSFORMS";
    })(Transform || (Transform = {}));
    let Accel;
    (function (Accel) {
        Accel[Accel["ACCEL_BOOST"] = 0] = "ACCEL_BOOST";
        Accel[Accel["ACCEL_BRAKE"] = 1] = "ACCEL_BRAKE";
        Accel[Accel["ACCEL_WAVE"] = 2] = "ACCEL_WAVE";
        Accel[Accel["ACCEL_EXPAND"] = 3] = "ACCEL_EXPAND";
        Accel[Accel["ACCEL_BOOMERANG"] = 4] = "ACCEL_BOOMERANG";
        Accel[Accel["NUM_ACCELS"] = 5] = "NUM_ACCELS";
    })(Accel || (Accel = {}));
    ;
    let Effect;
    (function (Effect) {
        Effect[Effect["EFFECT_DRUNK"] = 0] = "EFFECT_DRUNK";
        Effect[Effect["EFFECT_DIZZY"] = 1] = "EFFECT_DIZZY";
        Effect[Effect["EFFECT_TWIRL"] = 2] = "EFFECT_TWIRL";
        Effect[Effect["EFFECT_ROLL"] = 3] = "EFFECT_ROLL";
        Effect[Effect["EFFECT_MINI"] = 4] = "EFFECT_MINI";
        Effect[Effect["EFFECT_FLIP"] = 5] = "EFFECT_FLIP";
        Effect[Effect["EFFECT_INVERT"] = 6] = "EFFECT_INVERT";
        Effect[Effect["EFFECT_TORNADO"] = 7] = "EFFECT_TORNADO";
        Effect[Effect["EFFECT_TIPSY"] = 8] = "EFFECT_TIPSY";
        Effect[Effect["EFFECT_BUMPY"] = 9] = "EFFECT_BUMPY";
        Effect[Effect["EFFECT_BEAT"] = 10] = "EFFECT_BEAT";
        Effect[Effect["NUM_EFFECTS"] = 11] = "NUM_EFFECTS";
    })(Effect || (Effect = {}));
    ;
    let Appearance;
    (function (Appearance) {
        Appearance[Appearance["APPEARANCE_HIDDEN"] = 0] = "APPEARANCE_HIDDEN";
        Appearance[Appearance["APPEARANCE_HIDDEN_OFFSET"] = 1] = "APPEARANCE_HIDDEN_OFFSET";
        Appearance[Appearance["APPEARANCE_SUDDEN"] = 2] = "APPEARANCE_SUDDEN";
        Appearance[Appearance["APPEARANCE_SUDDEN_OFFSET"] = 3] = "APPEARANCE_SUDDEN_OFFSET";
        Appearance[Appearance["APPEARANCE_STEALTH"] = 4] = "APPEARANCE_STEALTH";
        Appearance[Appearance["APPEARANCE_BLINK"] = 5] = "APPEARANCE_BLINK";
        Appearance[Appearance["APPEARANCE_RANDOMVANISH"] = 6] = "APPEARANCE_RANDOMVANISH";
        Appearance[Appearance["NUM_APPEARANCES"] = 7] = "NUM_APPEARANCES";
    })(Appearance || (Appearance = {}));
    ;
    let Turn;
    (function (Turn) {
        Turn[Turn["TURN_NONE"] = 0] = "TURN_NONE";
        Turn[Turn["TURN_MIRROR"] = 1] = "TURN_MIRROR";
        Turn[Turn["TURN_LEFT"] = 2] = "TURN_LEFT";
        Turn[Turn["TURN_RIGHT"] = 3] = "TURN_RIGHT";
        Turn[Turn["TURN_SHUFFLE"] = 4] = "TURN_SHUFFLE";
        Turn[Turn["TURN_SUPER_SHUFFLE"] = 5] = "TURN_SUPER_SHUFFLE";
        Turn[Turn["NUM_TURNS"] = 6] = "NUM_TURNS";
    })(Turn || (Turn = {}));
    ;
    let Scroll;
    (function (Scroll) {
        Scroll[Scroll["SCROLL_REVERSE"] = 0] = "SCROLL_REVERSE";
        Scroll[Scroll["SCROLL_SPLIT"] = 1] = "SCROLL_SPLIT";
        Scroll[Scroll["SCROLL_ALTERNATE"] = 2] = "SCROLL_ALTERNATE";
        Scroll[Scroll["SCROLL_CROSS"] = 3] = "SCROLL_CROSS";
        Scroll[Scroll["SCROLL_CENTERED"] = 4] = "SCROLL_CENTERED";
        Scroll[Scroll["NUM_SCROLLS"] = 5] = "NUM_SCROLLS";
    })(Scroll || (Scroll = {}));
    ;
    let ScoreDisplay;
    (function (ScoreDisplay) {
        ScoreDisplay[ScoreDisplay["SCORING_ADD"] = 0] = "SCORING_ADD";
        ScoreDisplay[ScoreDisplay["SCORING_SUBTRACT"] = 1] = "SCORING_SUBTRACT";
        ScoreDisplay[ScoreDisplay["SCORING_AVERAGE"] = 2] = "SCORING_AVERAGE";
        ScoreDisplay[ScoreDisplay["NUM_SCOREDISPLAYS"] = 3] = "NUM_SCOREDISPLAYS";
    })(ScoreDisplay || (ScoreDisplay = {}));
    ;
})(PlayerOptions || (PlayerOptions = {}));
