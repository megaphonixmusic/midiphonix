// Define controllable parameters and corresponding MIDI info
// Format: [command, type, CC#/channel index]

exports.params = [

    // Name             Type      FL Ctrl#  Query Name
    ['cutoff',         'knob',   		20, '?cutoff'],
    ['reverb',         'knob',  		21, '?reverb'],
    ['delay',          'knob',   		22,  '?delay'],
    ['phaser',		   'knob',			23, '?phaser'],
    ['tempo',          'knob',          24,  '?tempo'],
    ['bpm',            'knob',          24,    '?bpm'],
    ['key',            'knob',          34,    '?key'],

    // Name             Type        Note #   Mute Ctrl#     MuteGroup
    ['kick',           'oneshot', 		48,         25,       'drums'],
    ['snare',          'oneshot', 		50,         26,       'drums'],
    ['hihat',          'oneshot', 		52,         27,       'drums'],
    ['tom',            'oneshot', 		53,         28,       'drums'],
    ['crash',          'oneshot', 		55,         29,       'drums'],
    ['downsweep',      'oneshot',      57],
    ['damnson',        'oneshot',      59],
    ['hookedonphonix', 'oneshot',      60],
    ['randomsound',    'randomsound',   0],
    ['piano',          'instrument',	 1,         30, 'instruments'],
    ['bass',           'instrument',	 2,         31, 'instruments'],
    ['pad',            'instrument',	 3,         32, 'instruments'],
    ['lead',           'instrument',	 4,         33, 'instruments'],
    ['help',           'help',          0],
    ['mute',           'mute',          0],
    ['unmute',         'unmute',        0],
    ['play',           'play',        251],
    ['pause',          'pause',       252],
    ['record',         'record',        0]

];