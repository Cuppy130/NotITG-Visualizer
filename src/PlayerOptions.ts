namespace PlayerOptions {
    export class PlayerOptions {
        maxScrollBPM: number = 0;
        timeSpacing: number = 0;
        scrollSpeed: number = 1;
        scrollBPM: number = 200;
        accels: number[] = [];
        effects: number[] = [];
        appearances: number[] = [];
        scrolls: number[] = [];
        dark: number = 0;
        blind: number = 0;
        cover: number = 0;
        setTiltOrSkew: boolean = false;
        perspectiveTilt: number = 0;
        skew: number = 0;
        passmark: number = 0;
        randomSpeed: number = 0;
        timingScale: number = 1;
        turns: boolean[];
        transforms: boolean[] = [];
        scoreDisplay: number = 0;
        noteSkin: string = "default";

        speedMaxScrollBPM: number = 1;
        speedTimeSpacing: number = 1;
        speedScrollSpeed: number = 1;
        speedScrollBPM: number = 1;
        speedAccels: number[] = [];
        speedEffects: number[] = [];
        speedAppearances: number[] = [];
        speedScrolls: number[] = [];
        speedDark: number = 1;
        speedBlind: number = 1;
        speedCover: number = 1;
        speedPerspectiveTilt: number = 1;
        speedSkew: number = 1;
        speedPassmark: number = 1;
        speedRandomSpeed: number = 1;
        speedTimingScale: number = 1;
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
            this.turns = new Array<boolean>(Turn.NUM_TURNS).fill(false);
            this.transforms = new Array<boolean>(Transform.NUM_TRANSFORMS).fill(false);
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

        getString(): string {
            const mods: string[] = [];
            this.getMods(mods);
            return mods.join(", ");
        }

        getMods(addTo: string[] = []) {
            let sReturn: string;
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
            } else {
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

            if (this.timingScale != 1) this.addPart(addTo, this.timingScale, "Timing");

            if (this.turns[Turn.TURN_MIRROR]) addTo.push("Mirror");
            if (this.turns[Turn.TURN_LEFT]) addTo.push("Left");
            if (this.turns[Turn.TURN_RIGHT]) addTo.push("Right");
            if (this.turns[Turn.TURN_SHUFFLE]) addTo.push("Shuffle");
            if (this.turns[Turn.TURN_SUPER_SHUFFLE]) addTo.push("SuperShuffle");

            if (this.transforms[Transform.TRANSFORM_NOHOLDS]) addTo.push("NoHolds");
            if (this.transforms[Transform.TRANSFORM_HOLDSTOROLLS]) addTo.push("HoldsToRolls");
            if (this.transforms[Transform.TRANSFORM_NOROLLS]) addTo.push("NoRolls");
            if (this.transforms[Transform.TRANSFORM_NOMINES]) addTo.push("NoMines");
            if (this.transforms[Transform.TRANSFORM_LITTLE]) addTo.push("Little");
            if (this.transforms[Transform.TRANSFORM_WIDE]) addTo.push("Wide");
            if (this.transforms[Transform.TRANSFORM_BIG]) addTo.push("Big");
            if (this.transforms[Transform.TRANSFORM_QUICK]) addTo.push("Quick");
            if (this.transforms[Transform.TRANSFORM_BMRIZE]) addTo.push("BMRize");
            if (this.transforms[Transform.TRANSFORM_SKIPPY]) addTo.push("Skippy");
            if (this.transforms[Transform.TRANSFORM_MINES]) addTo.push("Mines");
            if (this.transforms[Transform.TRANSFORM_ECHO]) addTo.push("Echo");
            if (this.transforms[Transform.TRANSFORM_STOMP]) addTo.push("Stomp");
            if (this.transforms[Transform.TRANSFORM_PLANTED]) addTo.push("Planted");
            if (this.transforms[Transform.TRANSFORM_FLOORED]) addTo.push("Floored");
            if (this.transforms[Transform.TRANSFORM_TWISTER]) addTo.push("Twister");
            if (this.transforms[Transform.TRANSFORM_NOJUMPS]) addTo.push("NoJumps");
            if (this.transforms[Transform.TRANSFORM_NOHANDS]) addTo.push("NoHands");
            if (this.transforms[Transform.TRANSFORM_NOQUADS]) addTo.push("NoQuads");
            if (this.transforms[Transform.TRANSFORM_NOSTRETCH]) addTo.push("NoStretch");

            const { abs } = Math;

            if (this.skew == 0 && this.perspectiveTilt == 0) { if (this.setTiltOrSkew) addTo.push("Overhead"); }
            else if (this.skew == 0) {
                if (this.perspectiveTilt > 0) addTo.push("Distant"); else addTo.push("Hallway");
            } else if (abs(this.skew - this.perspectiveTilt) < 0.0001) {
                this.addPart(addTo, this.skew, "Space");
            } else if (abs(this.skew + this.perspectiveTilt) < 0.0001) {
                this.addPart(addTo, this.skew, "Incoming");
            }

            if (!this.empty(this.noteSkin) && this.compareNoCase("default")) {
                // in c this would be AddTo.push_back(s);
                addTo = addTo.reverse();
                addTo.push(this.noteSkin.toLowerCase());
                addTo = addTo.reverse();
            }
        }

        compareNoCase(value: string): boolean {
            return this.noteSkin.toLowerCase() == value.toLowerCase();
        }

        empty(value: string): boolean {
            return value == null || value == "";
        }

        addPart(addTo: string[], level: number, name: string) {
            if (level == 0) return;
            addTo.push(level == 1 ? "" : `${Math.round(level * 100)}` + name);
        }
        y

    }

    enum Transform {
        TRANSFORM_NOHOLDS,
        TRANSFORM_HOLDSTOROLLS,
        TRANSFORM_NOROLLS,
        TRANSFORM_NOMINES,
        TRANSFORM_LITTLE,
        TRANSFORM_WIDE,
        TRANSFORM_BIG,
        TRANSFORM_QUICK,
        TRANSFORM_BMRIZE,
        TRANSFORM_SKIPPY,
        TRANSFORM_MINES,
        TRANSFORM_ECHO,
        TRANSFORM_STOMP,
        TRANSFORM_PLANTED,
        TRANSFORM_FLOORED,
        TRANSFORM_TWISTER,
        TRANSFORM_NOJUMPS,
        TRANSFORM_NOHANDS,
        TRANSFORM_NOQUADS,
        TRANSFORM_NOSTRETCH,
        NUM_TRANSFORMS
    }

    enum Accel {
        ACCEL_BOOST,
        ACCEL_BRAKE,
        ACCEL_WAVE,
        ACCEL_EXPAND,
        ACCEL_BOOMERANG,
        NUM_ACCELS
    };

    enum Effect {
        EFFECT_DRUNK,
        EFFECT_DIZZY,
        EFFECT_TWIRL,
        EFFECT_ROLL,
        EFFECT_MINI,
        EFFECT_FLIP,
        EFFECT_INVERT,
        EFFECT_TORNADO,
        EFFECT_TIPSY,
        EFFECT_BUMPY,
        EFFECT_BEAT,
        NUM_EFFECTS
    };

    enum Appearance {
        APPEARANCE_HIDDEN,
        APPEARANCE_HIDDEN_OFFSET,
        APPEARANCE_SUDDEN,
        APPEARANCE_SUDDEN_OFFSET,
        APPEARANCE_STEALTH,
        APPEARANCE_BLINK,
        APPEARANCE_RANDOMVANISH,
        NUM_APPEARANCES
    };

    enum Turn {
        TURN_NONE = 0,
        TURN_MIRROR,
        TURN_LEFT,
        TURN_RIGHT,
        TURN_SHUFFLE,
        TURN_SUPER_SHUFFLE,
        NUM_TURNS
    };

    enum Scroll {
        SCROLL_REVERSE = 0,
        SCROLL_SPLIT,
        SCROLL_ALTERNATE,
        SCROLL_CROSS,
        SCROLL_CENTERED,
        NUM_SCROLLS
    };

    enum ScoreDisplay {
        SCORING_ADD = 0,
        SCORING_SUBTRACT,
        SCORING_AVERAGE,
        NUM_SCOREDISPLAYS
    };
}