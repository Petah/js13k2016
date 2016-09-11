var undef; // intentionally left undefined
var Float32Array = synth.Float32Array || Array;

var sfxr = synth.sfxr = (function () {
    /**
     * Resets the parameters, used at the start of each generate function
     */
    var initSynth = () => {
        return {
            waveType: 0,
            startFrequency: 0.3,
            minFrequency: 0.0,
            slide: 0.0,
            deltaSlide: 0.0,
            squareDuty: 0.0,
            dutySweep: 0.0,

            vibratoDepth: 0.0,
            vibratoSpeed: 0.0,

            attackTime: 0.0,
            sustainTime: 0.3,
            decayTime: 0.4,
            sustainPunch: 0.0,

            lpFilterResonance: 0.0,
            lpFilterCutoff: 1.0,
            lpFilterCutoffSweep: 0.0,
            hpFilterCutoff: 0.0,
            hpFilterCutoffSweep: 0.0,

            phaserOffset: 0.0,
            phaserSweep: 0.0,

            repeatSpeed: 0.0,

            changeSpeed: 0.0,
            changeAmount: 0.0,
        };
    };

    return {
        /**
         * Sets the parameters to generate a pickup/coin sound
         */
        generatePickupCoin: () => {
            synth = initSynth(synth);

            synth.startFrequency = 0.4 + Math.random() * 0.5;

            synth.sustainTime = Math.random() * 0.1;
            synth.decayTime = 0.1 + Math.random() * 0.4;
            synth.sustainPunch = 0.3 + Math.random() * 0.3;

            if (Math.random() < 0.5) {
                synth.changeSpeed = 0.5 + Math.random() * 0.2;
                synth.changeAmount = 0.2 + Math.random() * 0.4;
            }
            return synth;
        },

        /**
         * Sets the parameters to generate a laser/shoot sound
         */
        generateLaserShoot: () => {

            synth = initSynth(synth);

            synth.waveType = Math.floor(Math.random() * 3);
            if (synth.waveType == 2 && Math.random() < 0.5) {
                synth.waveType = Math.floor(Math.random() * 2);
            }

            synth.startFrequency = 0.5 + Math.random() * 0.5;
            synth.minFrequency = synth.startFrequency - 0.2 - Math.random() * 0.6;
            if (synth.minFrequency < 0.2) {
                synth.minFrequency = 0.2;
            }

            synth.slide = -0.15 - Math.random() * 0.2;

            if (Math.random() < 0.33) {
                synth.startFrequency = 0.3 + Math.random() * 0.6;
                synth.minFrequency = Math.random() * 0.1;
                synth.slide = -0.35 - Math.random() * 0.3;
            }

            if (Math.random() < 0.5) {
                synth.squareDuty = Math.random() * 0.5;
                synth.dutySweep = Math.random() * 0.2;
            } else {
                synth.squareDuty = 0.4 + Math.random() * 0.5;
                synth.dutySweep = -Math.random() * 0.7;
            }

            synth.sustainTime = 0.1 + Math.random() * 0.2;
            synth.decayTime = Math.random() * 0.4;
            if (Math.random() < 0.5)
                synth.sustainPunch = Math.random() * 0.3;

            if (Math.random() < 0.33) {
                synth.phaserOffset = Math.random() * 0.2;
                synth.phaserSweep = -Math.random() * 0.2;
            }

            if (Math.random() < 0.5)
                synth.hpFilterCutoff = Math.random() * 0.3;
            return synth;
        },

        /**
         * Sets the parameters to generate an explosion sound
         */
        generateExplosion: () => {

            synth = initSynth(synth);
            synth.waveType = 3;

            if (Math.random() < 0.5) {
                synth.startFrequency = 0.1 + Math.random() * 0.4;
                synth.slide = -0.1 + Math.random() * 0.4;
            } else {
                synth.startFrequency = 0.2 + Math.random() * 0.7;
                synth.slide = -0.2 - Math.random() * 0.2;
            }

            synth.startFrequency *= synth.startFrequency;

            if (Math.random() < 0.2)
                synth.slide = 0.0;
            if (Math.random() < 0.33)
                synth.repeatSpeed = 0.3 + Math.random() * 0.5;

            synth.sustainTime = 0.1 + Math.random() * 0.3;
            synth.decayTime = Math.random() * 0.5;
            synth.sustainPunch = 0.2 + Math.random() * 0.6;

            if (Math.random() < 0.5) {
                synth.phaserOffset = -0.3 + Math.random() * 0.9;
                synth.phaserSweep = -Math.random() * 0.3;
            }

            if (Math.random() < 0.33) {
                synth.changeSpeed = 0.6 + Math.random() * 0.3;
                synth.changeAmount = 0.8 - Math.random() * 1.6;
            }
            return synth;
        },

        /**
         * Sets the parameters to generate a powerup sound
         */
        generatePowerup: () => {

            synth = initSynth(synth);

            if (Math.random() < 0.5)
                synth.waveType = 1;
            else
                synth.squareDuty = Math.random() * 0.6;

            if (Math.random() < 0.5) {
                synth.startFrequency = 0.2 + Math.random() * 0.3;
                synth.slide = 0.1 + Math.random() * 0.4;
                synth.repeatSpeed = 0.4 + Math.random() * 0.4;
            } else {
                synth.startFrequency = 0.2 + Math.random() * 0.3;
                synth.slide = 0.05 + Math.random() * 0.2;

                if (Math.random() < 0.5) {
                    synth.vibratoDepth = Math.random() * 0.7;
                    synth.vibratoSpeed = Math.random() * 0.6;
                }
            }

            synth.sustainTime = Math.random() * 0.4;
            synth.decayTime = 0.1 + Math.random() * 0.4;
            return synth;
        },

        /**
         * Sets the parameters to generate a hit/hurt sound
         */
        generateHitHurt: () => {

            synth = initSynth(synth);
            synth.waveType = Math.floor(Math.random() * 3);
            if (synth.waveType == 2)
                synth.waveType = 3;
            else if (synth.waveType == 0)
                synth.squareDuty = Math.random() * 0.6;

            synth.startFrequency = 0.2 + Math.random() * 0.6;
            synth.slide = -0.3 - Math.random() * 0.4;

            synth.sustainTime = Math.random() * 0.1;
            synth.decayTime = 0.1 + Math.random() * 0.2;

            if (Math.random() < 0.5)
                synth.hpFilterCutoff = Math.random() * 0.3;
            return synth;
        },

        /**
         * Sets the parameters to generate a jump sound
         */
        generateJump: () => {

            synth = initSynth(synth);

            synth.waveType = 0;
            synth.squareDuty = Math.random() * 0.6;
            synth.startFrequency = 0.3 + Math.random() * 0.3;
            synth.slide = 0.1 + Math.random() * 0.2;

            synth.sustainTime = 0.1 + Math.random() * 0.3;
            synth.decayTime = 0.1 + Math.random() * 0.2;

            if (Math.random() < 0.5)
                synth.hpFilterCutoff = Math.random() * 0.3;
            if (Math.random() < 0.5)
                synth.lpFilterCutoff = 1.0 - Math.random() * 0.6;
            return synth;
        },

        /**
         * Sets the parameters to generate a blip/select sound
         */
        generateBlipSelect: () => {

            synth = initSynth(synth);

            synth.waveType = Math.floor(Math.random() * 2);
            if (synth.waveType == 0)
                synth.squareDuty = Math.random() * 0.6;

            synth.startFrequency = 0.2 + Math.random() * 0.4;

            synth.sustainTime = 0.1 + Math.random() * 0.1;
            synth.decayTime = Math.random() * 0.2;
            synth.hpFilterCutoff = 0.1;
            return synth;
        },

        /**
         * Randomly adjusts the parameters ever so slightly
         */
        mutate: function (synth, mutation) {
            mutation = mutation || 0.05;

            if (Math.random() < 0.5)
                synth.startFrequency += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.minFrequency += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.slide += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.deltaSlide += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.squareDuty += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.dutySweep += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.vibratoDepth += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.vibratoSpeed += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.attackTime += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.sustainTime += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.decayTime += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.sustainPunch += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.lpFilterCutoff += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.lpFilterCutoffSweep += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.lpFilterResonance += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.hpFilterCutoff += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.hpFilterCutoffSweep += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.phaserOffset += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.phaserSweep += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.repeatSpeed += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.changeSpeed += Math.random() * mutation * 2 - mutation;
            if (Math.random() < 0.5)
                synth.changeAmount += Math.random() * mutation * 2 - mutation;

            synth.validate();
        },

        /**
         * Sets all parameters to random values
         */
        randomize: () => {

            synth.waveType = Math.floor(Math.random() * 4);

            synth.attackTime = Math.pow(Math.random() * 2 - 1, 4);
            synth.sustainTime = Math.pow(Math.random() * 2 - 1, 2);
            synth.sustainPunch = Math.pow(Math.random() * 0.8, 2);
            synth.decayTime = Math.random();

            synth.startFrequency = (Math.random() < 0.5) ? Math.pow(Math.random() * 2 - 1, 2) : (Math.pow(Math.random() * 0.5, 3) + 0.5);
            synth.minFrequency = 0.0;

            synth.slide = Math.pow(Math.random() * 2 - 1, 5);
            synth.deltaSlide = Math.pow(Math.random() * 2 - 1, 3);

            synth.vibratoDepth = Math.pow(Math.random() * 2 - 1, 3);
            synth.vibratoSpeed = Math.random() * 2 - 1;

            synth.changeAmount = Math.random() * 2 - 1;
            synth.changeSpeed = Math.random() * 2 - 1;

            synth.squareDuty = Math.random() * 2 - 1;
            synth.dutySweep = Math.pow(Math.random() * 2 - 1, 3);

            synth.repeatSpeed = Math.random() * 2 - 1;

            synth.phaserOffset = Math.pow(Math.random() * 2 - 1, 3);
            synth.phaserSweep = Math.pow(Math.random() * 2 - 1, 3);

            synth.lpFilterCutoff = 1 - Math.pow(Math.random(), 3);
            synth.lpFilterCutoffSweep = Math.pow(Math.random() * 2 - 1, 3);
            synth.lpFilterResonance = Math.random() * 2 - 1;

            synth.hpFilterCutoff = Math.pow(Math.random(), 5);
            synth.hpFilterCutoffSweep = Math.pow(Math.random() * 2 - 1, 5);

            if (synth.attackTime + synth.sustainTime + synth.decayTime < 0.2) {
                synth.sustainTime = 0.2 + Math.random() * 0.3;
                synth.decayTime = 0.2 + Math.random() * 0.3;
            }

            if ((synth.startFrequency > 0.7 && synth.slide > 0.2) || (synth.startFrequency < 0.2 && synth.slide < -0.05)) {
                synth.slide = -synth.slide;
            }

            if (synth.lpFilterCutoff < 0.1 && synth.lpFilterCutoffSweep < -0.05) {
                synth.lpFilterCutoffSweep = -synth.lpFilterCutoffSweep;
            }
        }
    };
})();

getSettingsString = function (synth)
{
    return [synth.waveType
                , synth.attackTime, synth.sustainTime
                , synth.sustainPunch, synth.decayTime
                , synth.startFrequency, synth.minFrequency
                , synth.slide, synth.deltaSlide
                , synth.vibratoDepth, synth.vibratoSpeed
                , synth.changeAmount, synth.changeSpeed
                , synth.squareDuty, synth.dutySweep
                , synth.repeatSpeed, synth.phaserOffset
                , synth.phaserSweep, synth.lpFilterCutoff
                , synth.lpFilterCutoffSweep, synth.lpFilterResonance
                , synth.hpFilterCutoff, synth.hpFilterCutoffSweep
                , 0.5];
};

