
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
        // Cutoff multiplier which adjusts the ah the wave position can a
        _hpFilterCutoff = p['v'] * p['v'] * .1,
        // Speed of the high-pass cutoff multiplier
        _hpFilterDeltaCutoff = 1 + p['w'] * .0003,
        // Cutoff multiplier which adjusts the ah the wave position can a
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

playSound = (params, x, y) => {
    let distance = n(svgNode.viewBox.baseVal.x + (window.innerWidth * zoom) / 2, svgNode.viewBox.baseVal.y + (window.innerHeight * zoom) / 2, x, y);
    if (distance < 2000) {
        let soundURL = jsfxr(params);
        let v = new Audio();
        v.src = soundURL;
        v.volume = -(1 / 2000 * distance) + 1;
        v.play();
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

p = (length, d) => {
    return Math.sin(d * Math.PI / 180) * length;
};

motionAdd = (self, e, d) => {
    let x2 = o(self.e, self.d) + o(e, d);
    let y2 = p(self.e, self.d) + p(e, d);
    self.e = Math.hypot(x2, y2);
    self.d = m(0, 0, x2, y2);
};

randomSign = () => Math.random() > 0.5 ? -1 : 1;

a = (element, x, y) => {
    element.transform.baseVal[0].matrix.e = x;
    element.transform.baseVal[0].matrix.f = y;
};

b = (element, angle, z, aa) => {
    element.transform.baseVal[1].setRotate(angle, z, aa);
};

createExplosion = (x, y, sound) => {
    playSound(sound, x, y);
    for (let i = 0; i < 16; i++) {
        if (!nodeExplosions.length) {
            return;
        }
        explosionClone = nodeExplosions.pop();
        explosionClone.style.fill = ['#FD6D0A', '#FE9923', '#FFDE03', '#fff'][Math.floor(i / 4)];
        explosionClone.r.baseVal.value = 10;
        explosionClone.style.opacity = 1;
        explosionClone.style.display = '';
        ac.push({
            x: x + ((Math.random() * 10) - 5),
            y: y + ((Math.random() * 10) - 5),
            c: explosionClone,
            life: 5000,
            e: Math.random() / 2,
            d: Math.random() * 360,
            animationState: 0,
            animationSpeed: Math.random() * 2 + 5,
            animate: (ae) => {
                ae.animationState += ae.animationSpeed;
                ae.c.r.baseVal.value = -(Math.cos(ae.animationState * (Math.PI / 100)) - 1) * 5;
                ae.c.style.opacity -= 0.02;
                if (ae.animationState > 200) {
                    ae.life = 0;
                }
            },
            destroy: (node) => {
                node.style.display = 'none';
                nodeExplosions.push(node);
            },
        });
    }
};
    
emit = (ad, x, y, e, d) => {
    ad.af--;
    if (ad.af < 0) {
        ad.af = ad.ag;

        for (let i = 0; i < ad.ah; i++) {
            if (!nodeBubbles.length) {
                return;
            }
            ak = nodeBubbles.pop();
            ak.style.opacity = 1;
            ak.style.display = '';
            ac.push({
                x: x + o(-e, d),
                y: y + p(-e, d),
                c: ak,
                life: 30,
                e: e / 10,
                d: (d - 180) + ((Math.random() * 30) - 15),
                animate: (ae) => {
                    ae.c.style.opacity -= 0.04;
                },
                destroy: (node) => {
                    node.style.display = 'none';
                    nodeBubbles.push(node);
                },
            });
        }
    }
};

applyGravity = (self) => {
    for (let j = 0; j < planets.length; j++) {
        let planetDistance = n(self.x, self.y, planets[j].x, planets[j].y);
        let planetDirection = m(self.x, self.y, planets[j].x, planets[j].y);
        motionAdd(self, 1 / self.mass * gravityPower * (self.mass * planets[j].mass) / (planetDistance * planetDistance), planetDirection);
    }
};

moveGameObjects = (ab) => {
    for (let i = 0; i < ab.length; i++) {
        ab[i].x += o(ab[i].e, ab[i].d);
        ab[i].y += p(ab[i].e, ab[i].d);

        a(ab[i].c, ab[i].x, ab[i].y);
        b(ab[i].b, ab[i].d, ab[i].z, ab[i].aa);
    }
};

moveGameObjects2 = (ab) => {
    for (let i = 0; i < ab.length; i++) {
        motionAdd(ab[i], ab[i].currentAcceleration, ab[i].facing);
        ab[i].e = Math.min(ab[i].e, ab[i].f);
        ab[i].x += o(ab[i].e, ab[i].d);
        ab[i].y += p(ab[i].e, ab[i].d);

        a(ab[i].c, ab[i].x, ab[i].y);
        b(ab[i].b, ab[i].facing, ab[i].z, ab[i].aa);
    }
};

destroy = (ab, i) => {
    if (ab[i].destroy) {
        ab[i].destroy(ab[i].c);
    } else {
        ab[i].c.remove();
    }
    ab.splice(i, 1);
};

checkCollisions = (self, others) => {
    for (let i = 0; i < others.length; i++) {
        if (self.owner && self.owner.id == others[i].id) {
            continue;
        }
        collisionDistance = n(self.x, self.y, others[i].x, others[i].y);
        if (collisionDistance < self.collisionRadius + others[i].collisionRadius) {
            self.life = 0;
            others[i].life -= self.damage;
            updateHud(others[i], 'life');
            break;
        }
    }
};

buttonMoveDown = false;
buttonShootDown = false;
buttonTurnLeftDown = false;
buttonTurnRightDown = false;

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
    if (e.which == 32) {
        buttonShootDown = true;
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
    if (e.which == 32) {
        buttonShootDown = false;
    }
};

controlUpdate = (playerIndex) => {
    if (buttonMoveDown) {
        players[playerIndex].currentAcceleration = players[playerIndex].l;
    } else {
        players[playerIndex].currentAcceleration = 0;
    }

    if (buttonTurnLeftDown) {
        players[playerIndex].g = Math.max(players[playerIndex].g - players[playerIndex].k, -players[playerIndex].h);
    } else if (buttonTurnRightDown) {
        players[playerIndex].g = Math.min(players[playerIndex].g + players[playerIndex].k, players[playerIndex].h);
    } else {
        players[playerIndex].g /= players[playerIndex].turnFriction;
    }

    if (buttonShootDown) {
        players[playerIndex].shoot = true;
    }


};

controlUpdate = (playerIndex) => {   
    let gamepads = navigator.getGamepads();
    if (!gamepads[playerIndex]) {
        return;
    }
    if (gamepads[playerIndex].buttons[0].pressed) {
        players[playerIndex].shoot = true;
    }

    players[playerIndex].glitch--;
    if (gamepads[playerIndex].buttons[2].pressed && players[playerIndex].glitch < 0) {
        players[playerIndex].glitch = players[playerIndex].glitchTime;
        players[playerIndex].x += Math.random() * 2000 - 1000;
        players[playerIndex].y += Math.random() * 2000 - 1000;
        let playerNode = boatWrapper.cloneNode(true);
        playerNode.id = '';
        topLayer.appendChild(playerNode);
        glitches.push({
            c: playerNode,
            b: playerNode.children[0],
            glitchLog: players[playerIndex].glitchLog,
        });
        players[playerIndex].glitchLog = [];
    }
    players[playerIndex].glitchLog.push([players[playerIndex].x, players[playerIndex].y, players[playerIndex].facing]);

    if (gamepads[playerIndex].buttons[7].value > 0.2) {
        players[playerIndex].currentAcceleration = gamepads[playerIndex].buttons[7].value * players[playerIndex].l;
    } else {
        players[playerIndex].currentAcceleration = 0;
    }

    if (gamepads[playerIndex].axes[0] > 0.3 || gamepads[playerIndex].axes[0] < -0.3) {
        players[playerIndex].g = Math.round(gamepads[playerIndex].axes[0] * players[playerIndex].h);
    } else {
        players[playerIndex].g /= players[playerIndex].turnFriction;
    }

    if (gamepads[playerIndex].buttons[6].pressed) {
        zoom += 0.1;
        zoom = Math.min(10, zoom);
    }
    if (gamepads[playerIndex].buttons[4].pressed) {
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
        t = (cpu.facing - m(cpu.x, cpu.y, closestPlayer.x, closestPlayer.y) + 360) % 360;
        if (closestPlayerDistance < 200) {
            t = -t + 360;
        }
        if (t < 180) {
            if (t > 3) {
                cpu.g = Math.max(cpu.g - cpu.k, -cpu.h);
            } else {
                cpu.shoot = true;
                cpu.g /= 1.2;
            }
        } else if (t > 180) {
            if (t < 357) {
                cpu.g = Math.min(cpu.g + cpu.k, cpu.h);
            } else {
                cpu.shoot = true;
                cpu.g /= 1.2;
            }
        }
    } else {
        cpu.currentAccelleration = 0;
        cpu.g /= 1.2;
    }
};

stateStartInit = () => {
    svgStartNode.style.display = 'block';
    svgDeadNode.style.display = 'none';
    state = stateStart;
};

stateStart = () => {
    if (buttonShootDown) {
        stateGameInit();
    }
    let gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i].buttons[9].pressed) {
            stateGameInit();
        }
    }
};

stateGameInit = () => {
    svgStartNode.style.display = 'none';
    svgDeadNode.style.display = 'none';
    state = stateGame;
    
    createSolarSystem(solarSystemData);
    
    createPlayer({
        ag: 5,
    });
    
    createHud(hudData, players[0]);

    s(true);
}

stateGame = () => {
    // Move planets
    for (let i = 0; i < planets.length; i++) {
        planets[i].angle += planets[i].orbitSpeed;
        planets[i].x = o(planets[i].distance, planets[i].angle);
        planets[i].y = p(planets[i].distance, planets[i].angle);
        a(planets[i].c, planets[i].x, planets[i].y);
        planets[i].c.children[planets[i].c.children.length - 1].transform.baseVal[0].setRotate(m(0, 0, planets[i].x, planets[i].y), 0, 0);
    }

    for (let i = 0; i < players.length; i++) {
        checkCollisions(players[i], planets);
        if (players[i].life > 0) {
            applyGravity(players[i]);
            controlUpdate(i);
            updatePlayer(players[i]);
        } else {
            createExplosion(players[i].x, players[i].y, players[i].explosionSound);
            destroy(players, i);
        }
    }
    for (let i = 0; i < cpus.length; i++) {
        checkCollisions(cpus[i], planets);
        if (cpus[i].life > 0) {
            applyGravity(cpus[i]);
            ai(cpus[i]);
            updatePlayer(cpus[i]);
        } else {
            createExplosion(cpus[i].x, cpus[i].y, cpus[i].explosionSound);
            destroy(cpus, i);
        }
    }
    

    for (let i = 0; i < glitches.length; i++) {
        if (glitches[i].glitchLog[0]) {
            a(glitches[i].c, glitches[i].glitchLog[0][0], glitches[i].glitchLog[0][1]);
            b(glitches[i].b, glitches[i].glitchLog[0][2], 16, 4);
        }
        if (!glitches[i].glitchLog.shift()) {
            destroy(glitches, i);
        }
    }

    moveGameObjects2(players);
    moveGameObjects2(cpus);
    moveGameObjects(bullets);
    bulletLoop: for (let i = 0; i < bullets.length; i++) {
//        emit(bullets[i].ad, bullets[i].x, bullets[i].y, bullets[i].e, bullets[i].d);
        applyGravity(bullets[i]);

        // Collide with ships
        checkCollisions(bullets[i], players);
        checkCollisions(bullets[i], cpus);
        checkCollisions(bullets[i], planets);
        
        // Bullet life
        bullets[i].life--;
        if (bullets[i].life <= 0) {
            createExplosion(bullets[i].x, bullets[i].y, bullets[i].owner.explosionSound);
            destroy(bullets, i);
        }
    }
    
    for (let i = 0; i < ac.length; i++) {
        ac[i].x += o(ac[i].e, ac[i].d);
        ac[i].y += p(ac[i].e, ac[i].d);
        ac[i].animate(ac[i]);

        a(ac[i].c, ac[i].x, ac[i].y);
//        b(ac[i].b, ac[i].d, ac[i].z, ac[i].aa);
        ac[i].life--;
        if (ac[i].life < 0) {
            destroy(ac, i);
        }
    }
    
    if (players[0]) {
        svgNode.viewBox.baseVal.x = players[0].x - (window.innerWidth * zoom) / 2;
        svgNode.viewBox.baseVal.y = players[0].y - (window.innerHeight * zoom) / 2;
        svgNode.viewBox.baseVal.width = window.innerWidth * zoom;
        svgNode.viewBox.baseVal.height = window.innerHeight * zoom;
    }
    
    while (cpus.length < 3) {
        createCpu({
            lifeMax: 1,
        });
    }
    
    if (!players.length) {
        stateDeadInit();
    }
}

stateDeadInit = () => {
    svgStartNode.style.display = 'none';
    svgDeadNode.style.display = 'block';
    state = stateDead;
    while (players.length) {
        destroy(players, 0);
    }
    while (cpus.length) {
        destroy(cpus, 0);
    }
    while (ac.length) {
        destroy(ac, 0);
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
    while (stars.length) {
        destroy(planets, 0);
    }
    while(hudLayer.firstChild) {
        hudLayer.removeChild(hudLayer.firstChild);
    }
};

stateDead = () => {
    if (buttonShootDown) {
        stateGameInit();
    }
    let gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i].buttons[9].pressed) {
            stateGameInit();
        }
    }
};



zoom = 2;
gravityPower = 2500;
cpus = [];
glitches = [];
players = [];
planets = [];
bullets = [];
ac = [];

createNodes = (nodeArray, node, layer) => {
    while (nodeArray.length < 1000) {
        let nodeClone = node.cloneNode(true);
        nodeClone.id = '';
        layer.appendChild(nodeClone);
        nodeArray.push(nodeClone);
    }
};

nodeExplosions = [];
createNodes(nodeExplosions, explosion, topLayer);
nodeBullets = [];
createNodes(nodeBullets, bullet, bottomLayer);
nodeBubbles = [];
createNodes(nodeBubbles, bubbleParticle, bottomLayer);

createSolarSystem = (data) => {
    // Append Planets
    data.planets.forEach((asset, i) => {
        let planetClone = asset.cloneNode(true);
        planetClone.id = '';
        let planet = {
            c: planetClone,
            distance: 1000 * i,
            angle: Math.random() * 360,
            scale: i > 0 ? Math.random() + 0.5 : 3,
            orbitSpeed: 0.1 - (1 / 100000 * (300 * i)),
        };
        planet.collisionRadius = 100 * planet.scale;
        planet.mass = planet.scale * 10;
        planets.push(planet);
        planetClone.transform.baseVal[1].setScale(planet.scale, planet.scale); 
        planetLayer.appendChild(planetClone);
    });
};

solarSystemData = {
    planets: [
        sunStar,
        planetOrange,
        planetBlue,
        planetGrey,
        planetOrange,
        planetBlue,
        planetGrey,
    ],
    stars: {
        count: 10000,
        field: {
            width: window.innerWidth * 15,
            height: window.innerHeight * 15,
        },
    }
};

// Append stars
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

    stars.appendChild(star);
}

createPlayer = (options) => {
    let playerNode = boatWrapper.cloneNode(true);
    playerNode.id = '';
    playerNode.setAttributeNS(null, 'class', 'player1');
    topLayer.appendChild(playerNode);
    let v = {
        id: Math.floor(Math.random() * 1000000),
        c: playerNode,
        b: playerNode.children[0],
        z: 67/2,
        aa: 53/2,
        
        lifeMax: 20,

        hud: {},
        
        shootSound: soundGenerator.generateLaserShoot(),
        explosionSound: soundGenerator.generateExplosion(),

        x: Math.random() * 5000 - 2500,
        y: Math.random() * 5000 - 2500,
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
        af: 0,
        ag: 10,
        gunMount: 0,
        gunMounts: [20, -20],
        
        glitch: 0,
        glitchMax: 20,
        glitchLog: [],
        glitchTime: 30,

        ad: {
            ae: bubbleParticle,
            af: 0,
            ag: 1,
            ah: 1,
        },
    };
    
    for (let key in options) {
        v[key] = options[key];
    }
    
    v.life = v.lifeMax;
    players.push(v);
};

createCpu = (options) => {
    createPlayer(options);
    cpuPlayer = players.pop();
    cpuPlayer.c.setAttributeNS(null, 'class', 'player2');
    cpus.push(cpuPlayer);
};

updatePlayer = (v) => {
    v.facing += v.g;

    while (v.facing > 360) {
        v.facing -= 360;
    }
    while (v.facing < 0) {
        v.facing += 360;
    }

    v.ad.af--;
    if (v.currentAcceleration > 0.1) {
        emit(v.ad, v.x, v.y, 25, v.facing);
    }
    
    v.af--;
    if (v.shoot && v.af < 0 && nodeBullets.length) {
        playSound(v.shootSound, v.x, v.y);
        v.af = v.ag;
        am = nodeBullets.pop();
        am.style.display = '';
        bullets.push({
            owner: v,
            c: am,
            b: am,
            z: 0,
            aa: 0,
            x: v.x + o(v.gunMounts[v.gunMount], v.facing + 90),
            y: v.y + p(v.gunMounts[v.gunMount], v.facing + 90),
            d: v.facing,
            e: 30,
            life: 200,
            mass: 0.8,
            collisionRadius: 10,
            damage: 1,
            ad: {
                ae: bubbleParticle,
                af: 0,
                ag: 1,
                ah: 1,
            },
            destroy: (node) => {
                node.style.display = 'none';
                nodeBullets.push(node);
            },
        });
        
        v.gunMount++;
        if (v.gunMount >= v.gunMounts.length) {
            v.gunMount = 0;
        }
    }
    v.shoot = false;
};

// HUD
createHud = (data, v) => {
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
            a(base, baseW, 0);
            a(h.children[0].children[1], baseW - 112, 76);
        }

        // Append bars
        let bars = h.children[1];
        h.children[0].children[1].innerHTML = data[j].text;
        for (let i = 0; i < v.lifeMax; i++) {
            let bar = i == 0 ? bars.children[0] : bars.children[0].cloneNode(true);
            bar.setAttributeNS(null, 'x', i * data[j].bars.offset);
            if (i >= v[data[j].id]) {
                bar.setAttributeNS(null, 'class', 'hudBar hudBarE');
            }
            bars.appendChild(bar);
        }

        h.style.display = '';
        hudLayer.appendChild(h);
        v.hud[data[j].id] = hudLayer.children[hudLayer.children.length - 1];
    }
};

updateHud = (v, id) => {
    if (v[id] >= 0 && v.hud.hasOwnProperty(id)) {
        v.hud[id].children[1].children[v[id]].setAttributeNS(null, 'class', 'hudBar hudBarE');
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

s = (init) => {
    

    state();

    if (init !== true) {
        requestAnimationFrame(s);
    }
};

stateStartInit();
s();
