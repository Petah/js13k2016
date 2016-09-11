soundGenerator = (() => {
    /**
     * Resets the parameters, used at the start of each generate function
     */
    defaultSynth = {
        waveType: 0,
        startFrequency: 0.3,
        minFrequency: 0,
        slide: 0,
        deltaSlide: 0,
        squareDuty: 0,
        dutySweep: 0,

        vibratoDepth: 0,
        vibratoSpeed: 0,

        attackTime: 0,
        sustainTime: 0.3,
        decayTime: 0.4,
        sustainPunch: 0,

        lpFilterResonance: 0,
        lpFilterCutoff: 1.0,
        lpFilterCutoffSweep: 0,
        hpFilterCutoff: 0,
        hpFilterCutoffSweep: 0,

        phaserOffset: 0,
        phaserSweep: 0,

        repeatSpeed: 0,

        changeSpeed: 0,
        changeAmount: 0,
    };


    let getSettingsString = (synth) => {
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

    return {
        /**
         * Sets the parameters to generate a pickup/coin sound
         */
        generatePickupCoin: () => {
            let synth = Object.assign({}, defaultSynth);

            synth.startFrequency = 0.4 + Math.random() * 0.5;

            synth.sustainTime = Math.random() * 0.1;
            synth.decayTime = 0.1 + Math.random() * 0.4;
            synth.sustainPunch = 0.3 + Math.random() * 0.3;

            if (Math.random() < 0.5) {
                synth.changeSpeed = 0.5 + Math.random() * 0.2;
                synth.changeAmount = 0.2 + Math.random() * 0.4;
            }
            return getSettingsString(synth);
        },

        /**
         * Sets the parameters to generate a laser/shoot sound
         */
        generateLaserShoot: () => {

            let synth = Object.assign({}, defaultSynth);

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
            return getSettingsString(synth);
        },

        /**
         * Sets the parameters to generate an explosion sound
         */
        generateExplosion: () => {

            let synth = Object.assign({}, defaultSynth);
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
                synth.slide = 0;
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
            return getSettingsString(synth);
        },

        /**
         * Sets the parameters to generate a powerup sound
         */
        generatePowerup: () => {

            let synth = Object.assign({}, defaultSynth);

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
                synth.slide = 05 + Math.random() * 0.2;

                if (Math.random() < 0.5) {
                    synth.vibratoDepth = Math.random() * 0.7;
                    synth.vibratoSpeed = Math.random() * 0.6;
                }
            }

            synth.sustainTime = Math.random() * 0.4;
            synth.decayTime = 0.1 + Math.random() * 0.4;
            return getSettingsString(synth);
        },

        /**
         * Sets the parameters to generate a hit/hurt sound
         */
        generateHitHurt: () => {

            let synth = Object.assign({}, defaultSynth);
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
            return getSettingsString(synth);
        },

        /**
         * Sets the parameters to generate a jump sound
         */
        generateJump: () => {

            let synth = Object.assign({}, defaultSynth);

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
            return getSettingsString(synth);
        },

        /**
         * Sets the parameters to generate a blip/select sound
         */
        generateBlipSelect: () => {

            let synth = Object.assign({}, defaultSynth);

            synth.waveType = Math.floor(Math.random() * 2);
            if (synth.waveType == 0)
                synth.squareDuty = Math.random() * 0.6;

            synth.startFrequency = 0.2 + Math.random() * 0.4;

            synth.sustainTime = 0.1 + Math.random() * 0.1;
            synth.decayTime = Math.random() * 0.2;
            synth.hpFilterCutoff = 0.1;
            return getSettingsString(synth);
        },
    };
})();
