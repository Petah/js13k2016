
function SfxrParams() {
  this.setSettings = function(values)
  {
    for ( let i = 0; i < 24; i++ )
    {
      this[String.fromCharCode( 97 + i )] = values[i] || 0;
    }
    if (this['c'] < .01) {
      this['c'] = .01;
    }
    let totalTime = this['b'] + this['c'] + this['e'];
    if (totalTime < .18) {
      let multiplier = .18 / totalTime;
      this['b']  *= multiplier;
      this['c'] *= multiplier;
      this['e']   *= multiplier;
    }
  }
}

function SfxrSynth() {
  this._params = new SfxrParams();
  let _envelopeLength0, // Length of the attack stage
      _envelopeLength1, // Length of the sustain stage
      _envelopeLength2, // Length of the decay stage
      _period,          // Period of the wave
      _maxPeriod,       // Maximum period before sound stops (from minFrequency)
      _slide,           // Note slide
      _deltaSlide,      // Change in slide
      _changeAmount,    // Amount to change the note by
      _changeTime,      // Counter for the note change
      _changeLimit,     // Once the time reaches this limit, the note changes
      _squareDuty,      // Offset of center switching point in the square wave
      _dutySweep;       // Amount to change the duty by
  this.reset = function() {
    let p = this._params;
    _period       = 100 / (p['f'] * p['f'] + .001);
    _maxPeriod    = 100 / (p['g']   * p['g']   + .001);
    _slide        = 1 - p['h'] * p['h'] * p['h'] * .01;
    _deltaSlide   = -p['i'] * p['i'] * p['i'] * .000001;
    if (!p['a']) {
      _squareDuty = .5 - p['n'] / 2;
      _dutySweep  = -p['o'] * .00005;
    }
    _changeAmount =  1 + p['l'] * p['l'] * (p['l'] > 0 ? -.9 : 10);
    _changeTime   = 0;
    _changeLimit  = p['m'] == 1 ? 0 : (1 - p['m']) * (1 - p['m']) * 20000 + 32;
  }

  this.totalReset = function() {
    this.reset();
    let p = this._params;
    _envelopeLength0 = p['b']  * p['b']  * 100000;
    _envelopeLength1 = p['c'] * p['c'] * 100000;
    _envelopeLength2 = p['e']   * p['e']   * 100000 + 12;
    return ((_envelopeLength0 + _envelopeLength1 + _envelopeLength2) / 3 | 0) * 3;
  }
  this.synthWave = function(buffer, length) {
    // Shorter reference
    let p = this._params;

    // If the filters are active
    let _filters = p['s'] != 1 || p['v'],
        // Cutoff multiplier which adjusts the ai the wave position can a
        _hpFilterCutoff = p['v'] * p['v'] * .1,
        // Speed of the high-pass cutoff multiplier
        _hpFilterDeltaCutoff = 1 + p['w'] * .0003,
        // Cutoff multiplier which adjusts the ai the wave position can a
        _lpFilterCutoff = p['s'] * p['s'] * p['s'] * .1,
        // Speed of the low-pass cutoff multiplier
        _lpFilterDeltaCutoff = 1 + p['t'] * .0001,
        // If the low pass filter is active
        _lpFilterOn = p['s'] != 1,
        // masterVolume * masterVolume (for quick calculations)
        _masterVolume = p['x'] * p['x'],
        // Minimum frequency before stopping
        _minFreqency = p['g'],
        // If the phaser is active
        _phaser = p['q'] || p['r'],
        // Change in phase offset
        _phaserDeltaOffset = p['r'] * p['r'] * p['r'] * .2,
        // Phase offset for phaser effect
        _phaserOffset = p['q'] * p['q'] * (p['q'] < 0 ? -1020 : 1020),
        // Once the time reaches this limit, some of the    iables are reset
        _repeatLimit = p['p'] ? ((1 - p['p']) * (1 - p['p']) * 20000 | 0) + 32 : 0,
        // The punch factor (louder at begining of sustain)
        _sustainPunch = p['d'],
        // Amount to change the period of the wave by at the peak of the vibrato wave
        _vibratoAmplitude = p['j'] / 2,
        // Speed at which the vibrato phase moves
        _vibratoSpeed = p['k'] * p['k'] * .01,
        // The type of wave to generate
        _waveType = p['a'];

    let _envelopeLength      = _envelopeLength0,     // Length of the current envelope stage
        _envelopeOverLength0 = 1 / _envelopeLength0, // (for quick calculations)
        _envelopeOverLength1 = 1 / _envelopeLength1, // (for quick calculations)
        _envelopeOverLength2 = 1 / _envelopeLength2; // (for quick calculations)

    // Damping muliplier which restricts how fast the wave position can a
    let _lpFilterDamping = 5 / (1 + p['u'] * p['u'] * 20) * (.01 + _lpFilterCutoff);
    if (_lpFilterDamping > .8) {
      _lpFilterDamping = .8;
    }
    _lpFilterDamping = 1 - _lpFilterDamping;

    let _finished = false,     // If the sound has finished
        _envelopeStage    = 0, // Current stage of the envelope (attack, sustain, decay, end)
        _envelopeTime     = 0, // Current time through current enelope stage
        _envelopeVolume   = 0, // Current volume of the envelope
        _hpFilterPos      = 0, // Adjusted wave position after high-pass filter
        _lpFilterDeltaPos = 0, // Change in low-pass wave position, as allowed by the cutoff and damping
        _lpFilterOldPos,       // Previous low-pass wave position
        _lpFilterPos      = 0, // Adjusted wave position after low-pass filter
        _periodTemp,           // Period modified by vibrato
        _phase            = 0, // Phase through the wave
        _phaserInt,            // Integer phaser offset, for bit maths
        _phaserPos        = 0, // Position through the phaser buffer
        _pos,                  // Phase expresed as a Number from 0-1, used for fast sin approx
        _repeatTime       = 0, // Counter for the repeats
        _sample,               // Sub-sample calculated 8 times per actual sample, averaged out to get the super sample
        _superSample,          // Actual sample writen to the wave
        _vibratoPhase     = 0; // Phase through the vibrato sine wave

    // Buffer of wave values used to create the out of phase second wave
    let _phaserBuffer = new Array(1024),
        // Buffer of random values used to generate noise
        _noiseBuffer  = new Array(32);
    for (let i = _phaserBuffer.length; i--; ) {
      _phaserBuffer[i] = 0;
    }
    for (let i = _noiseBuffer.length; i--; ) {
      _noiseBuffer[i] = Math.random() * 2 - 1;
    }

    for (let i = 0; i < length; i++) {
      if (_finished) {
        return i;
      }

      // Repeats every _repeatLimit times, partially resetting the sound parameters
      if (_repeatLimit) {
        if (++_repeatTime >= _repeatLimit) {
          _repeatTime = 0;
          this.reset();
        }
      }

      // If _changeLimit is reached, shifts the pitch
      if (_changeLimit) {
        if (++_changeTime >= _changeLimit) {
          _changeLimit = 0;
          _period *= _changeAmount;
        }
      }

      // Acccelerate and apply slide
      _slide += _deltaSlide;
      _period *= _slide;

      // Checks for frequency getting too low, and stops the sound if a minFrequency was set
      if (_period > _maxPeriod) {
        _period = _maxPeriod;
        if (_minFreqency > 0) {
          _finished = true;
        }
      }

      _periodTemp = _period;

      // Applies the vibrato effect
      if (_vibratoAmplitude > 0) {
        _vibratoPhase += _vibratoSpeed;
        _periodTemp *= 1 + Math.sin(_vibratoPhase) * _vibratoAmplitude;
      }

      _periodTemp |= 0;
      if (_periodTemp < 8) {
        _periodTemp = 8;
      }

      // Sweeps the square duty
      if (!_waveType) {
        _squareDuty += _dutySweep;
        if (_squareDuty < 0) {
          _squareDuty = 0;
        } else if (_squareDuty > .5) {
          _squareDuty = .5;
        }
      }

      // Moves through the different stages of the volume envelope
      if (++_envelopeTime > _envelopeLength) {
        _envelopeTime = 0;

        switch (++_envelopeStage)  {
          case 1:
            _envelopeLength = _envelopeLength1;
            break;
          case 2:
            _envelopeLength = _envelopeLength2;
        }
      }

      // Sets the volume based on the position in the envelope
      switch (_envelopeStage) {
        case 0:
          _envelopeVolume = _envelopeTime * _envelopeOverLength0;
          break;
        case 1:
          _envelopeVolume = 1 + (1 - _envelopeTime * _envelopeOverLength1) * 2 * _sustainPunch;
          break;
        case 2:
          _envelopeVolume = 1 - _envelopeTime * _envelopeOverLength2;
          break;
        case 3:
          _envelopeVolume = 0;
          _finished = true;
      }

      // Moves the phaser offset
      if (_phaser) {
        _phaserOffset += _phaserDeltaOffset;
        _phaserInt = _phaserOffset | 0;
        if (_phaserInt < 0) {
          _phaserInt = -_phaserInt;
        } else if (_phaserInt > 1023) {
          _phaserInt = 1023;
        }
      }

      // Moves the high-pass filter cutoff
      if (_filters && _hpFilterDeltaCutoff) {
        _hpFilterCutoff *= _hpFilterDeltaCutoff;
        if (_hpFilterCutoff < .00001) {
          _hpFilterCutoff = .00001;
        } else if (_hpFilterCutoff > .1) {
          _hpFilterCutoff = .1;
        }
      }

      _superSample = 0;
      for (let j = 8; j--; ) {
        // Cycles through the period
        _phase++;
        if (_phase >= _periodTemp) {
          _phase %= _periodTemp;

          // Generates new random noise for this period
          if (_waveType == 3) {
            for (let n = _noiseBuffer.length; n--; ) {
              _noiseBuffer[n] = Math.random() * 2 - 1;
            }
          }
        }

        // Gets the sample from the oscillator
        switch (_waveType) {
          case 0: // Square wave
            _sample = ((_phase / _periodTemp) < _squareDuty) ? .5 : -.5;
            break;
          case 1: // Saw wave
            _sample = 1 - _phase / _periodTemp * 2;
            break;
          case 2: // Sine wave (fast and accurate approx)
            _pos = _phase / _periodTemp;
            _pos = (_pos > .5 ? _pos - 1 : _pos) * 6.28318531;
            _sample = 1.27323954 * _pos + .405284735 * _pos * _pos * (_pos < 0 ? 1 : -1);
            _sample = .225 * ((_sample < 0 ? -1 : 1) * _sample * _sample  - _sample) + _sample;
            break;
          case 3: // Noise
            _sample = _noiseBuffer[Math.abs(_phase * 32 / _periodTemp | 0)];
        }

        // Applies the low and high pass filters
        if (_filters) {
          _lpFilterOldPos = _lpFilterPos;
          _lpFilterCutoff *= _lpFilterDeltaCutoff;
          if (_lpFilterCutoff < 0) {
            _lpFilterCutoff = 0;
          } else if (_lpFilterCutoff > .1) {
            _lpFilterCutoff = .1;
          }

          if (_lpFilterOn) {
            _lpFilterDeltaPos += (_sample - _lpFilterPos) * _lpFilterCutoff;
            _lpFilterDeltaPos *= _lpFilterDamping;
          } else {
            _lpFilterPos = _sample;
            _lpFilterDeltaPos = 0;
          }

          _lpFilterPos += _lpFilterDeltaPos;

          _hpFilterPos += _lpFilterPos - _lpFilterOldPos;
          _hpFilterPos *= 1 - _hpFilterCutoff;
          _sample = _hpFilterPos;
        }

        // Applies the phaser effect
        if (_phaser) {
          _phaserBuffer[_phaserPos % 1024] = _sample;
          _sample += _phaserBuffer[(_phaserPos - _phaserInt + 1024) % 1024];
          _phaserPos++;
        }

        _superSample += _sample;
      }

      // Averages out the super samples and applies volumes
      _superSample *= .125 * _envelopeVolume * _masterVolume;

      // Clipping if too loud
      buffer[i] = _superSample >= 1 ? 32767 : _superSample <= -1 ? -32768 : _superSample * 32767 | 0;
    }

    return length;
  }
}

// Adapted from http://codebase.es/riffwave/
let synth = new SfxrSynth();
// Export for the Closure Compiler
let jsfxr = function(settings) {
  // Initialize SfxrParams
  synth._params.setSettings(settings);
  // Synthesize Wave
  let envelopeFullLength = synth.totalReset();
  let data = new Uint8Array(((envelopeFullLength + 1) / 2 | 0) * 4 + 44);
  let used = synth.synthWave(new Uint16Array(data.buffer, 44), envelopeFullLength) * 2;
  let dv = new Uint32Array(data.buffer, 0, 44);
  // Initialize header
  dv[0] = 0x46464952; // "RIFF"
  dv[1] = used + 36;  // put total size here
  dv[2] = 0x45564157; // "WAVE"
  dv[3] = 0x20746D66; // "fmt "
  dv[4] = 0x00000010; // size of the following
  dv[5] = 0x00010001; // Mono: 1 channel, PCM format
  dv[6] = 0x0000AC44; // 44,100 samples per second
  dv[7] = 0x00015888; // byte rate: two bytes per sample
  dv[8] = 0x00100002; // 16 bits per sample, aligned on every two bytes
  dv[9] = 0x61746164; // "data"
  dv[10] = used;      // put number of samples here

  // Base64 encoding written by me, @maettig
  used += 44;
  let i = 0,
      base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      output = 'data:audio/wav;base64,';
  for (; i < used; i += 3)
  {
    let a = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
    output += base64Characters[a >> 18] + base64Characters[a >> 12 & 63] + base64Characters[a >> 6 & 63] + base64Characters[a & 63];
  }
  return output;
}

createSound = (params) => {
    let players = [];
    for (let i = 0; i < 10; i++) {
        let soundURL = jsfxr(params);
        let w = new Audio();
        w.src = soundURL;
        players.push(w);
    }
    return players;
};

playSound = (players, x, y) => {
    let minDistance = 2000;
    for (let p = 0; p < panes.length; p++) {
        let distance = n(panes[p].viewBox.baseVal.x + (window.innerWidth * zoom) / 2, panes[p].viewBox.baseVal.y + (window.innerHeight * zoom) / 2, x, y);
        if (distance < minDistance) {
            minDistance = distance;
        }
    }
    if (minDistance < 2000) {
        w = players.shift();
        w.volume = -(1 / 2000 * minDistance) + 1;
        w.play();
        players.push(w);
    }
};

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

m = (x1, y1, x2, y2) => {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
};

n = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
};

o = (length, d) => {
    return Math.cos(d * Math.PI / 180) * length;
};

q = (length, d) => {
    return Math.sin(d * Math.PI / 180) * length;
};

motionAdd = (self, e, d) => {
    let x2 = o(self.e, self.d) + o(e, d);
    let y2 = q(self.e, self.d) + q(e, d);
    self.e = Math.hypot(x2, y2);
    self.d = m(0, 0, x2, y2);
};

randomSign = () => Math.random() > 0.5 ? -1 : 1;

a = (node, x, y) => {
    for (let i = 0; i < node.elements.length; i++) {
        node.elements[i].transform.baseVal[0].matrix.e = x;
        node.elements[i].transform.baseVal[0].matrix.f = y;
    }
};

b = (node, angle, aa, ab) => {
    for (let i = 0; i < node.elements.length; i++) {
        node.elements[i].children[0].transform.baseVal[1].setRotate(angle, aa, ab);
    }
};

createExplosion = (x, y, sound) => {
    playSound(sound, x, y);
    for (let i = 0; i < 4; i++) {
        ad.push({
            x: x + ((Math.random() * 20) - 10),
            y: y + ((Math.random() * 20) - 10),
            node: nodeCreate('explosion', '.topLayer', (element) => {
                element.children[0].style.fill = ['#FD6D0A', '#FE9923', '#FFDE03', '#fff'][Math.floor(i)];
            }),
            life: 50,
            e: Math.random() / 4,
            d: Math.random() * 360,
            animate: (af, element) => {
                element.children[0].r.baseVal.value = af.life / 2 + 20;
                element.children[0].style.opacity = 1 / 50 * af.life;
            },
        });
    }
};
    
emit = (x, y, e, d) => {
    if (Math.random() > quality) {
        return;
    }
    ad.push({
        x: x + o(-e, d),
        y: y + q(-e, d),
        node: nodeCreate('bubbleParticle', '.bottomLayer'),
        life: 120,
        e: e / 10,
        d: (d - 180) + ((Math.random() * 30) - 15),
        animate: (af, element) => {
            element.children[0].style.opacity = 1 / 30 * af.life;
        },
    });
};

applyGravity = (self) => {
    for (let j = 0; j < planets.length; j++) {
        let planetDistance = n(self.x, self.y, planets[j].x, planets[j].y);
        let planetDirection = m(self.x, self.y, planets[j].x, planets[j].y);
        motionAdd(self, 1 / self.mass * gravityPower * (self.mass * planets[j].mass) / (planetDistance * planetDistance), planetDirection);
    }
};

moveGameObjects = (ac) => {
    for (let i = 0; i < ac.length; i++) {
        ac[i].x += o(ac[i].e, ac[i].d);
        ac[i].y += q(ac[i].e, ac[i].d);

        a(ac[i].node, ac[i].x, ac[i].y);
        b(ac[i].node, ac[i].d, ac[i].aa, ac[i].ab);
    }
};

moveGameObjects2 = (ac) => {
    for (let i = 0; i < ac.length; i++) {
        if (ac[i].glitching || ac[i].dead) {
            continue;
        }
        motionAdd(ac[i], ac[i].currentAcceleration, ac[i].facing);
        ac[i].currentAcceleration = 0;
        ac[i].e = Math.min(ac[i].e, ac[i].f);
        ac[i].x += o(ac[i].e, ac[i].d);
        ac[i].y += q(ac[i].e, ac[i].d);

        a(ac[i].node, ac[i].x, ac[i].y);
        b(ac[i].node, ac[i].facing, ac[i].aa, ac[i].ab);
    }
};

destroy = (ac, i) => {
    nodeDestroy(ac[i].node);
//    if (ac[i].destroy) {
//        ac[i].destroy(ac[i].c);
//    } else {
//        for (let j = 0; j < ac[j].c.length; j++) {
//            ac[i].c[j].remove();
//        }
//    }
    ac.splice(i, 1);
};

nodes = {};

nodeCreate = (baseNode, layer, init) => {
    if (!nodes[baseNode]) {
        nodes[baseNode] = [];
    }
    if (!nodes[baseNode].length) {
        let elements = [];
        for (let p = 0; p < panes.length; p++) {
            let element = window[baseNode].cloneNode(true);
            element.id = '';
            elements.push(element);
            panes[p].querySelector(layer).appendChild(element);
        }
        nodes[baseNode].push({
            baseNode: baseNode,
            elements: elements,
        });
    }
    let node = nodes[baseNode].pop();
    for (let n = 0; n < node.elements.length; n++) {
        node.elements[n].style.display = '';
        node.elements[n].style.opacity = 1;
        if (init) {
            init(node.elements[n], n);
        }
    }
    return node;
};

nodeDestroy = (node) => {
    for (let n = 0; n < node.elements.length; n++) {
        node.elements[n].style.display = 'none';
    }
    nodes[node.baseNode].push(node);
};

checkCollisions = (self, others) => {
    if (self.dead) {
        return;
    }
    for (let i = 0; i < others.length; i++) {
        if (self.owner && self.owner.id == others[i].id) {
            continue;
        }
        collisionDistance = n(self.x, self.y, others[i].x, others[i].y);
        if (collisionDistance < self.collisionRadius + others[i].collisionRadius) {
            self.life = 0;
            others[i].life -= self.damage;
            if (others[i].type === 'cpu') {
                for (let j = 0; j < players.length; j++) {
                    if (players[j].id === self.owner.id) {
                        players[j].points++;
                        if (!split) {
                        	killCount.innerText = players[j].points;
                        }
                    }
                }
            }
            break;
        }
    }
};

buttonMoveDown = false;
buttonShootDown = false;
buttonTurnLeftDown = false;
buttonTurnRightDown = false;
buttonGlitchDown = false;

document.body.onkeydown = (e) => {
    if (e.which == 38) {
        buttonMoveDown = true;
    }
    if (e.which == 37) {
        buttonTurnLeftDown = true;
    }
    if (e.which == 39) {
        buttonTurnRightDown = true;
    }
    if (e.which == 17) {
        buttonShootDown = true;
    }
    if (e.which == 16) {
        buttonGlitchDown = true;
    }
};

document.body.onkeyup = (e) => {
    if (e.which == 38) {
        buttonMoveDown = false;
    }
    if (e.which == 37) {
        buttonTurnLeftDown = false;
    }
    if (e.which == 39) {
        buttonTurnRightDown = false;
    }
    if (e.which == 17) {
        buttonShootDown = false;
    }
    if (e.which == 16) {
        buttonGlitchDown = false;
    }
};

controlKeyboardUpdate = (playerIndex) => {
    if (buttonMoveDown) {
        players[playerIndex].currentAcceleration = players[playerIndex].l;
    }

    if (buttonTurnLeftDown) {
        players[playerIndex].g = Math.max(players[playerIndex].g - players[playerIndex].k, -players[playerIndex].h);
    } else if (buttonTurnRightDown) {
        players[playerIndex].g = Math.min(players[playerIndex].g + players[playerIndex].k, players[playerIndex].h);
    } else {
        players[playerIndex].g /= players[playerIndex].turnFriction;
    }

    if (buttonGlitchDown) {
        players[playerIndex].glitch = true;
    }

    if (buttonShootDown) {
        players[playerIndex].shoot = true;
    }
};

controlGamepadUpdate = (playerIndex, gamepadIndex) => {
    let gamepads = navigator.getGamepads();
    if (!gamepads[gamepadIndex]) {
        return;
    }
    if (gamepads[gamepadIndex].buttons[0].pressed) {
        players[playerIndex].shoot = true;
    }

    if (gamepads[gamepadIndex].buttons[2].pressed) {
        players[playerIndex].glitch = true;
    }

    if (gamepads[gamepadIndex].buttons[7].value > 0.2) {
        players[playerIndex].currentAcceleration = gamepads[gamepadIndex].buttons[7].value * players[playerIndex].l;
    }

    if (gamepads[gamepadIndex].axes[0] > 0.3 || gamepads[gamepadIndex].axes[0] < -0.3) {
        players[playerIndex].g = Math.round(gamepads[gamepadIndex].axes[0] * players[playerIndex].h);
    } else {
        players[playerIndex].g /= players[playerIndex].turnFriction;
    }

    if (gamepads[gamepadIndex].buttons[6].pressed) {
        zoom += 0.1;
        zoom = Math.min(10, zoom);
    }
    if (gamepads[gamepadIndex].buttons[4].pressed) {
        zoom -= 0.1;
        zoom = Math.max(0.1, zoom);
    }
};

ai = (cpu) => {
    closestPlayer = 0;
    closestPlayerDistance = 0;
    for (let j = 0;j < players.length; j++) {
        playerDisatance = n(cpu.x, cpu.y, players[j].x, players[j].y);
        if (!closestPlayer || closestPlayerDistance > playerDisatance) {
            closestPlayer = players[j];
            closestPlayerDistance = playerDisatance;
        }
    }
    if (Math.random() < 0.8) {
        cpu.currentAcceleration = cpu.l;
        u = (cpu.facing - m(cpu.x, cpu.y, closestPlayer.x, closestPlayer.y) + 360) % 360;
        if (closestPlayerDistance < 800) {
            u = -u + 360;
        }
        if (closestPlayerDistance < 400 && Math.random() < 0.2) {
            cpu.glitch = true;
        }
        if (u < 180) {
            if (u > 3) {
                cpu.g = Math.max(cpu.g - cpu.k, -cpu.h);
            } else {
                if (closestPlayerDistance < 1000) {
                    cpu.shoot = true;
                }
                cpu.g /= 1.2;
            }
        } else if (u > 180) {
            if (u < 357) {
                cpu.g = Math.min(cpu.g + cpu.k, cpu.h);
            } else {
                if (closestPlayerDistance < 1000) {
                    cpu.shoot = true;
                }
                cpu.g /= 1.2;
            }
        }
    } else {
        cpu.currentAccelleration = 0;
        cpu.g /= 1.2;
    }
};

startTimer = null;
startCountDown = 0;
playerJoined = {};

stateStartInit = () => {
    svgStartNode.style.display = 'block';
    svgDeadNode.style.display = 'none';
    state = stateStart;
};

countDown = () => {
    startCountDown--;
    if (startCountDown <= 0) {
        stateGameInit();
    } else {
        startText.textContent = startCountDown;
        startTimer = setTimeout(countDown, 500)
    }
};

stateStart = () => {
    if (buttonShootDown && !playerJoined.keyboard) {
        playerJoined.keyboard = true;
        playerInputs.push([controlKeyboardUpdate]);
        if (startTimer) {
            clearTimeout(startTimer);
        }
        startText.classList.remove('blink');
        if (split && playerInputs.length < 2) {
            startText.textContent = 'Waiting for w 2';
        } else {
            startCountDown = 3;
            startText.textContent = startCountDown;
            startTimer = setTimeout(countDown, 500);
        }
    }
    let gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        if (!gamepads[i]) {
            continue;
        }
        for (let b = 0; b < gamepads[i].buttons.length; b++) {
            if (gamepads[i] && gamepads[i].buttons[b].pressed && !playerJoined['gamepad' + i]) {
                playerJoined['gamepad' + i] = true;
                playerInputs.push([controlGamepadUpdate, i]);
                if (startTimer) {
                    clearTimeout(startTimer);
                }
                if (split && playerInputs.length < 2) {
                    startText.textContent = 'Waiting for w 2';
                } else {
                    startText.classList.remove('blink');
                    startCountDown = 3;
                    startText.textContent = startCountDown;
                    startTimer = setTimeout(countDown, 500);
                }
            }
        }
    }
};

stateGameInit = () => {
    svgStartNode.style.display = 'none';
    svgDeadNode.style.display = 'none';
    state = stateGame;

    createSolarSystem(solarSystemData);

    playerInputs.forEach(() => {
        createPlayer({
            ah: 5,
        });
    });

    if (!split) {
        hudLayerBottom.style.display = 'block';
        updateTimeElapsed();
        killCount.innerText = elapsedTime.innetText = '0';
        createHud(hudData, players[0]);
    }

    t(0, true);
}

stateGame = () => {
    // Move planets
    for (let i = 0; i < planets.length; i++) {
        planets[i].angle += planets[i].orbitSpeed;
        planets[i].x = o(planets[i].distance, planets[i].angle);
        planets[i].y = q(planets[i].distance, planets[i].angle);
        a(planets[i].node, planets[i].x, planets[i].y);
        for (let n = 0; n < planets[i].node.elements.length; n++) {
            planets[i].node.elements[n].children[planets[i].node.elements[n].children.length - 1].transform.baseVal[0].setRotate(m(0, 0, planets[i].x, planets[i].y), 0, 0);
        }
    }

    for (let i = 0; i < players.length; i++) {
        checkCollisions(players[i], planets);
        if (players[i].life > 0) {
            applyGravity(players[i]);
            playerInputs[i][0](i, playerInputs[i][1]);
            updatePlayer(players[i]);
            if (players[i].life > 0) {
                players[i].life += 0.005;
                if (players[i].life > players[i].lifeMax) {
                    players[i].life = players[i].lifeMax;
                }
                players[i].glitchCharge += 0.2;
                if (players[i].glitchCharge > players[i].glitchMax) {
                    players[i].glitchCharge = players[i].glitchMax;
                }
            }
            let minDistance = 9999999;
            let closest = null;
            for (let j = 0; j < players.length; j++) {
                if (i === j) {
                    continue;
                }
                let distance = n(players[i].x, players[i].y, players[j].x, players[j].y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = players[j];
                }
            }
            for (let j = 0; j < cpus.length; j++) {
                let distance = n(players[i].x, players[i].y, cpus[j].x, cpus[j].y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = cpus[j];
                }
            }
            let pointer = players[i].node.elements[i].children[1].children[0];
            if (closest !== null) {
                let d = m(players[i].x, players[i].y, closest.x, closest.y);
                minDistance /= 20;
                if (minDistance < 70) {
                    minDistance = 70;
                } else if (minDistance > 200) {
                    minDistance = 200;
                }
                pointer.transform.baseVal[0].matrix.e = o(minDistance, d - 90);
                pointer.transform.baseVal[0].matrix.f = q(minDistance, d - 90);
                pointer.children[0].transform.baseVal[0].setRotate(d - 90, 0, 0);
                pointer.style.display = '';
            } else {
                pointer.style.display = 'none';
            }
        
            if (!split) {
                updateHud(players[i], players[i].life, players[i].lifeMax, 'life');
                updateHud(players[i], players[i].glitchCharge, players[i].glitchMax, 'glitch');
            }
        } else {
            if (!players[i].dead) {
                createExplosion(players[i].x, players[i].y, players[i].explosionSound);
                players[i].dead = true;
                for (let e = 0; e < players[i].node.elements.length; e++) {
                    players[i].node.elements[e].style.display = 'none';
                }
            }
            if (!split) {
                destroy(players, i);
            }
        } 
        if (split && players[i].dead) {
            players[i].life--;
            if (players[i].life < -100) {
                players[i].dead = false;
                for (let e = 0; e < players[i].node.elements.length; e++) {
                    players[i].node.elements[e].style.display = '';
                }
                players[i].life = players[i].lifeMax;
                players[i].e = 0;
                spawnPlayer(players[i]);
            }
        }
    }
    for (let i = 0; i < cpus.length; i++) {
        checkCollisions(cpus[i], planets);
        if (cpus[i].life > 0) {
            applyGravity(cpus[i]);
            ai(cpus[i]);
            updatePlayer(cpus[i]);
            cpus[i].glitchCharge += 0.2;
            if (cpus[i].glitchCharge > cpus[i].glitchMax) {
                cpus[i].glitchCharge = cpus[i].glitchMax;
            }
        } else {
            createExplosion(cpus[i].x, cpus[i].y, cpus[i].explosionSound);
            destroy(cpus, i);
        }
    }


    for (let i = 0; i < glitches.length; i++) {
        if (glitches[i].delay !== null && glitches[i].delay-- < 0) {
            // Emit glitch ad
            let glitch = glitches[i].glitchLog[0];
            for (let i = 0; i < 30; i++) {
                ad.push({
                    x: glitch[0] + o((Math.random() * 50) - 25, glitch[2]),
                    y: glitch[1] + q((Math.random() * 50) - 25, glitch[2]),
                    node: nodeCreate('glitchParticle', '.glitchLayer', (element) => {
                        element.children[0].style.fill = ['#9417FF', '#5A30CC', '#9417FF', '#fff'][Math.floor(Math.random() * 4)];
                        element.children[0].style.opacity = Math.random();
                        element.children[0].transform.baseVal[0].setRotate(glitch[2], 0, 0);
                        element.children[0].transform.baseVal[1].setScale(1, 1);
                    }),
                    life: 100,
                    e: Math.random() * 2,
                    d: i % 2 == 0 ? glitch[2] + 90 : glitch[2] - 90,
                    animate: (af, element) => {
                        element.children[0].transform.baseVal[1].setScale(1 / 50 * af.life, 1 / 50 * af.life);
                        element.children[0].style.opacity = 1 / 50 * af.life;
                    },
                });
            }
            
            glitches[i].delay = null;
            for (let n = 0; n < glitches[i].node.elements.length; n++) {
                glitches[i].node.elements[n].style.display = '';
            }
        }
        
        if (glitches[i].delay === null) {
            let glitch = glitches[i].glitchLog.shift();
            a(glitches[i].node, glitch[0], glitch[1]);
            b(glitches[i].node, glitch[2], glitches[i].aa, glitches[i].ab);
            if (glitch[3] > 0.1) {
                emit(glitch[0], glitch[1], 25, glitch[2]);
            }
            
            if (glitch[4]) {
                playSound(glitches[i].owner.shootSound, glitch[0], glitch[1]);
                bullets.push({
                    owner: glitches[i].owner,
                    node: nodeCreate('bullet', '.bottomLayer'),
                    aa: 0,
                    ab: 0,
                    x: glitch[0] + o(glitches[i].owner.gunMounts[glitch[5]], glitch[2] + 90),
                    y: glitch[1] + q(glitches[i].owner.gunMounts[glitch[5]], glitch[2] + 90),
                    d: glitch[2],
                    e: 30,
                    life: 60,
                    mass: 0.8,
                    collisionRadius: 10,
                    damage: 1,
                });
            }
            
            if (!glitches[i].glitchLog.length) {
                // Emit glitch ad
                for (let i = 0; i < 30; i++) {
                    ad.push({
                        x: glitch[0] + o((Math.random() * 50) - 25, glitch[2]),
                        y: glitch[1] + q((Math.random() * 50) - 25, glitch[2]),
                        node: nodeCreate('glitchParticle', '.glitchLayer', (element) => {
                            element.children[0].style.fill = ['#9417FF', '#5A30CC', '#9417FF', '#fff'][Math.floor(Math.random() * 4)];
                            element.children[0].style.opacity = Math.random();
                            element.children[0].transform.baseVal[0].setRotate(glitch[2], 0, 0);
                            element.children[0].transform.baseVal[1].setScale(1, 1);
                        }),
                        life: 100,
                        e: Math.random() * 2,
                        d: i % 2 == 0 ? glitch[2] + 90 : glitch[2] - 90,
                        animate: (af, element) => {
                            element.children[0].transform.baseVal[1].setScale(1 / 50 * af.life, 1 / 50 * af.life);
                            element.children[0].style.opacity = 1 / 50 * af.life;
                        },
                    });
                }
                destroy(glitches, i);
            }
        }
    }

    moveGameObjects2(players);
    moveGameObjects2(cpus);
    moveGameObjects(bullets);
    
    for (let i = 0; i < bullets.length; i++) {
        applyGravity(bullets[i]);

        // Collide with ships
        checkCollisions(bullets[i], players);
        checkCollisions(bullets[i], cpus);
        checkCollisions(bullets[i], planets);
        if (bullets[i].life <= 0) {
            bullets[i].explode = true;
        }

        // Bullet life
        bullets[i].life--;
        if (bullets[i].life <= 0) {
            if (bullets[i].explode) {
                createExplosion(bullets[i].x, bullets[i].y, bullets[i].owner.explosionSound);
            }
            destroy(bullets, i);
        }
    }

    for (let i = 0; i < ad.length; i++) {
        ad[i].x += o(ad[i].e, ad[i].d);
        ad[i].y += q(ad[i].e, ad[i].d);
        for (let j = 0; j < ad[i].node.elements.length; j++) {
            ad[i].animate(ad[i], ad[i].node.elements[j]);
        }

        a(ad[i].node, ad[i].x, ad[i].y);
        ad[i].life--;
        if (ad[i].life < 0) {
            destroy(ad, i);
        }
    }


    for (let p = 0; p < panes.length; p++) {
        if (players[p]) {
            panes[p].viewBox.baseVal.x = players[p].x - (window.innerWidth * zoom) / 2;
            panes[p].viewBox.baseVal.y = players[p].y - (window.innerHeight * zoom) / 2;
            panes[p].viewBox.baseVal.width = window.innerWidth * zoom;
            panes[p].viewBox.baseVal.height = window.innerHeight * zoom;
        }
    }

    if (playerInputs.length === 1 && players[0]) {
        while (cpus.length < (players[0].points / 3) + 1) {
            createCpu({
                lifeMax: 1,
            });
        }
    }

    if (!split && !players.length) {
        stateDeadInit();
    }
}

stateDeadInit = () => {
    svgStartNode.style.display = 'none';
    svgDeadNode.style.display = 'block';
    state = stateDead;
    if (timeElapsedID) {
        clearInterval(timeElapsedID);
        timeElapsedID = false;
        timeElapsed = 0;
    }
    while (players.length) {
        destroy(players, 0);
    }
    while (cpus.length) {
        destroy(cpus, 0);
    }
    while (ad.length) {
        destroy(ad, 0);
    }
    while (bullets.length) {
        destroy(bullets, 0);
    }
    while (glitches.length) {
        destroy(glitches, 0);
    }
    while (planets.length) {
        destroy(planets, 0);
    }
    while (hudLayer.firstChild) {
        hudLayer.removeChild(hudLayer.firstChild);
    }
    canRestart = false;
    setTimeout(() => {
        canRestart = true;
    }, 2000);
};

stateDead = () => {
    if (!canRestart) {
        return;
    }

    if (buttonShootDown) {
        location.reload();
    }
    let gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        if (!gamepads[i]) {
            continue;
        }
        for (let b = 0; b < gamepads[i].buttons.length; b++) {
            if (gamepads[i] && gamepads[i].buttons[b].pressed) {
                location.reload();
            }
        }
    }
};



bullets = [];
cpus = [];
glitches = [];
gravityPower = 2500;
low = location.search.indexOf('low') !== -1;
planets = [];
players = [];
playerInputs = [];
ad = [];
quality = low ? 0.1 : 1;
split = location.search.indexOf('split') !== -1;
timeElapsed = 0;
timeElapsedID = false;
zoom = 2;
glitchColors = {
    human: ['#9417FF', '#5A30CC', '#9417FF', '#fff'],
    cpu: ['#e0421d', '#ed4559', '#e0421d', '#fff']
};

setGameState = (s, l) => {
    split = s;
    low = l;
    location = '?' + (split ? 'split' : 'cpu') + ',' + (low ? 'low' : 'high');
};

updateLinkClass = (c, a) => {
    els = document.getElementsByClassName(c);
    for (var i = 0; i < els.length; i++) {
        els[i].className += a;
    }
};

updateButtons = () => {
    c = location.search.substr(1).split(',');
    for(var i = 0; i < c.length; ++i) {
        updateLinkClass(c[i], ' active');
    }
};

updateTimeElapsed = () => {
    timeElapsedID = setInterval(() => {
        elapsedTime.innerText = ++timeElapsed;
    }, 1000);
};

if (split) {
    panes = [
        document.querySelector('.splitLeft'),
        document.querySelector('.splitRight'),
    ];
} else {
    panes = [
        document.querySelector('.splitLeft'),
    ];
    panes[0].style.width = '100vw';
}

createNodes = (nodeArray, node, layer) => {
    for (let p = 0; p < panes.length; p++) {
        for (let p = 0; p < panes.length; p++) {
            while (nodeArray.length < 1000) {
                let nodeClone = node.cloneNode(true);
                nodeClone.id = '';
                panes[p].querySelector(layer).appendChild(nodeClone);
                nodeArray.push(nodeClone);
            }
        }
    }
};

//nodeExplosions = [];
//createNodes(nodeExplosions, explosion, '.topLayer');
//nodeBullets = [];
//createNodes(nodeBullets, bullet, '.bottomLayer');
//nodeBubbles = [];
//createNodes(nodeBubbles, bubbleParticle, '.bottomLayer');

createSolarSystem = () => {
    let planetNodes = [
        'sunStar',
        'planetOrange',
        'planetBlue',
        'planetGrey',
        'planetOrange',
        'planetBlue',
        'planetGrey',
    ];
    for (let i = 0; i < planetNodes.length; i++) {
        let scale = i > 0 ? Math.random() + 0.5 : 3;
        let planet = {
            node: nodeCreate(planetNodes[i], '.planetLayer', (element) => {
                element.transform.baseVal[1].setScale(scale, scale);
            }),
            distance: 1000 * i,
            angle: Math.random() * 360,
            scale: scale,
            mass: scale * 10,
            collisionRadius: scale * 100,
            orbitSpeed: 0.1 - (1 / 100000 * (300 * i)),
        };
        planets.push(planet);
    }
};

solarSystemData = {
    stars: {
        count: 2000 * quality,
        field: {
            width: window.innerWidth * 15,
            height: window.innerHeight * 15,
        },
    }
};

// Append stars
for (let p = 0; p < panes.length; p++) {
    for (let i = 0; i < solarSystemData.stars.count; i++) {
        let star = starNode.cloneNode(true);
        star.id = '';

        star.r.baseVal.value = Math.random() * 5;
        star.cx.baseVal.value = solarSystemData.stars.field.width * 2 * Math.random() - solarSystemData.stars.field.width;
        star.cy.baseVal.value = solarSystemData.stars.field.height * 2 * Math.random() - solarSystemData.stars.field.height;
        star.style.opacity = Math.random();

        star.style.fill = '#c0f7ff';
        if (Math.random() <= 0.5){
            star.style.fill = '#fff';
        } else if (Math.random() <= 0.5){
            star.style.fill = '#fffec4';
        }

        panes[p].querySelector('.stars').appendChild(star);
    }
}

createPlayer = (options) => {
    let x = 0, y = 0, minDistance;
    do {
        minDistance = 9999999;
        x += Math.random() * 10000 - 5000;
        y += Math.random() * 10000 - 5000;
        for (let i = 0; i < planets.length; i++) {
            let distance = Math.abs(n(x, y, o(planets[i].distance, planets[i].angle), q(planets[i].distance, planets[i].angle)));
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
    } while (minDistance < 1000);
    let w = {
        id: Math.floor(Math.random() * 1000000),
        type: 'human',
        node: nodeCreate('boatWrapper', '.topLayer', (element, i) => {
            if (i !== players.length) {
                element.children[1].style.display = 'none';
            }
        }),
        aa: 67/2,
        ab: 53/2,
        
        hud: {},
        
        life: split ? 10 : 20,
        lifeMax: split ? 10 : 20,
        
        glitch: false,
        glitchCharge: 0,
        glitchMax: 20,
        glitchLog: [],
        glitchReloadTime: 30,
        glitchReloading: 30,
        glitching: false,

        shootSound: createSound(soundGenerator.generateLaserShoot()),
        glitchSound: createSound(soundGenerator.generateJump()),
        explosionSound: createSound(soundGenerator.generateHitHurt()),

        x: x,
        y: y,
        d: 0,
        facing: 0,
        e: 0,

        mass: 1,
        collisionRadius: 30,

        f: 15,
        l: 0.4,
        friction: 1.1,

        g: 0,
        h: 5,
        k: 0.5,
        turnFriction: 1.2,
        currentAcceleration: 0,

        shoot: false,
        ag: 0,
        ah: 10,
        gunMount: 0,
        gunMounts: [20, -20],

        points: 0,
    };

    for (let key in options) {
        w[key] = options[key];
    }

    w.life = w.lifeMax;
    players.push(w);
};

createCpu = (options) => {
    createPlayer(options);
    cpuPlayer = players.pop();
    cpuPlayer.type = 'cpu';
    cpuPlayer.node.elements[0].classList = 'player2';
    cpus.push(cpuPlayer);
};

spawnPlayer = (w) => {
    let x = 0, y = 0, minDistance;
    do {
        minDistance = 9999999;
        x += Math.random() * 200 - 100;
        y += Math.random() * 200 - 100;
        for (let i = 0; i < planets.length; i++) {
            let distance = Math.abs(n(x, y, o(planets[i].distance, planets[i].angle), q(planets[i].distance, planets[i].angle)));
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
        for (let i = 0; i < players.length; i++) {
            let distance = Math.abs(n(x, y, players[i].x, players[i].y));
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
        for (let i = 0; i < cpus.length; i++) {
            let distance = Math.abs(n(x, y, cpus[i].x, cpus[i].y));
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
        for (let i = 0; i < glitches.length; i++) {
            let distance = Math.abs(n(x, y, glitches[i].glitchLog[0][0], glitches[i].glitchLog[0][1]));
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
    } while (minDistance < 700);
    w.x = x;
    w.y = y;
};

updatePlayer = (w) => {
    w.facing += w.g;

    while (w.facing > 360) {
        w.facing -= 360;
    }
    while (w.facing < 0) {
        w.facing += 360;
    }

    if (w.currentAcceleration > 0.1 && !w.glitching) {
        emit(w.x, w.y, 25, w.facing);
    }
    
    if (w.glitch && w.glitchReloading < 0 && w.glitchCharge >= w.glitchMax) {
        // Emit glitch ad
        for (let i = 0; i < 30; i++) {
            ad.push({
                x: w.x + o((Math.random() * 50) - 25, w.facing),
                y: w.y + q((Math.random() * 50) - 25, w.facing),
                node: nodeCreate('glitchParticle', '.glitchLayer', (element) => {
                    element.children[0].style.fill = glitchColors[w.type][Math.floor(Math.random() * 4)];
                    element.children[0].style.opacity = Math.random();
                    element.children[0].transform.baseVal[0].setRotate(w.facing, 0, 0);
                    element.children[0].transform.baseVal[1].setScale(1, 1);
                }),
                life: 100,
                e: Math.random() * 2,
                d: i % 2 == 0 ? w.facing + 90 : w.facing - 90,
                animate: (af, element) => {
                    element.children[0].transform.baseVal[1].setScale(1 / 50 * af.life, 1 / 50 * af.life);
                    element.children[0].style.opacity = 1 / 50 * af.life;
                },
            });
        }
        
        // Glitch w
        playSound(w.glitchSound, w.x, w.y);
        w.glitchCharge = 0;
        w.glitching = true;
        w.glitchReloading = w.glitchReloadTime;
        for (let e = 0; e < w.node.elements.length; e++) {
            w.node.elements[e].style.display = 'none';
        }
        w.e = 0;
    }
    
    if (w.glitching && w.glitchReloading  < 0) {
        w.glitching = false;
        for (let e = 0; e < w.node.elements.length; e++) {
            w.node.elements[e].style.display = '';
        }
        glitches.push({
            owner: w,
            node: nodeCreate('boatWrapper', '.topLayer', (element) => {
                element.style.display = 'none';
                element.children[1].children[0].style.display = 'none';
                if (w.type === 'cpu') {
                    element.classList = 'player2';
                }
            }),
            aa: 67/2,
            ab: 53/2,
            delay: Math.random() * 100,
            glitchLog: w.glitchLog,
        });
        
        w.glitchLog = [];
        spawnPlayer(w);
    }
    
    if (!w.glitching) {
        w.glitchLog.push([w.x, w.y, w.facing, w.currentAcceleration, w.shoot && w.ag < 0 && !w.glitching, w.gunMount]);
    }
    
    if (w.shoot && w.ag < 0 && !w.glitching) {
        playSound(w.shootSound, w.x, w.y);
        w.ag = w.ah;
        bullets.push({
            owner: w,
            node: nodeCreate('bullet', '.bottomLayer'),
            aa: 0,
            ab: 0,
            x: w.x + o(w.gunMounts[w.gunMount], w.facing + 90),
            y: w.y + q(w.gunMounts[w.gunMount], w.facing + 90),
            d: w.facing,
            e: 30,
            life: 60,
            mass: 0.8,
            collisionRadius: 10,
            damage: 1,
        });
        
        w.gunMount++;
        if (w.gunMount >= w.gunMounts.length) {
            w.gunMount = 0;
        }
    }
    
    w.glitchReloading--;
    w.glitch = false;
    w.ag--;
    w.shoot = false;
};

// HUD
createHud = (data, w) => {
    for (let j = 0; j < data.length; j++) {
        let h = hud.cloneNode(true);
        h.id = 'hud' + data[j].id.charAt(0).toUpperCase() + data[j].id.substr(1).toLowerCase();

        // Scale to suit viewport
        hScale = (window.innerWidth / 900 * 0.1) + 0.5;
        h.transform.baseVal[1].setScale(hScale, hScale);

        // Flip base if aligning right
        if (data[j].hasOwnProperty('hAlign') && data[j].hAlign === 'right') {
            h.setAttributeNS(null, 'class', 'hudRight');
            let base = h.children[0].children[0];
            let baseW = 436; // Magic
            base.transform.baseVal[1].setScale(-1, 1);
            a({elements:[base]}, baseW, 0);
            a({elements:[h.children[0].children[1]]}, baseW - 112, 76);
        }

        // Append bars
        let bars = h.children[1];
        h.children[0].children[1].innerHTML = data[j].text;
        for (let i = 0; i < w.lifeMax; i++) {
            let bar = i == 0 ? bars.children[0] : bars.children[0].cloneNode(true);
            bar.setAttributeNS(null, 'x', i * data[j].bars.offset);
            if (i >= w[data[j].id]) {
                bar.setAttributeNS(null, 'class', 'hudBar hudBarE');
            }
            bars.appendChild(bar);
        }

        h.style.display = '';
        hudLayer.appendChild(h);
        w.hud[data[j].id] = {
            data: data[j],
            element: hudLayer.children[hudLayer.children.length - 1],
        };
    }
};

updateHud = (w, current, max, stat) => {
    if (current >= 0 && current <= max) {
        let bClass = 'hudBar';
        for (let i = 0; i < w.hud[stat].element.children[1].children.length; i++) {
            if (i >= current) {
                bClass += ' hudBarE';
            }
            let index = (w.hud[stat].data.hAlign === 'right') ? (w.hud[stat].element.children[1].children.length - (i + 1)) : i;
            w.hud[stat].element.children[1].children[index].classList = bClass;
        }
    }
};

hudData = [
    {
        id: 'glitch',
        hAlign: 'right',
        bars: {
            width: 16,
            offset: 22,
        },
        text: 'GLITCH',
    },
    {
        id: 'life',
        bars: {
            width: 16,
            offset: 22,
        },
        text: 'HEALTH',
    },
];

t = (time, init) => {
    state();

    if (init !== true) {
        requestAnimationFrame(t);
    }
};

stateStartInit();
updateButtons();
t();

//setInterval(() => {
//    state();
//}, 1000 / 60);
