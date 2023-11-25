// Define controllable parameters and corresponding MIDI info
// Format: [command, type, CC#/channel index]

exports.params = [
    ['#cutoff',         'knob',   		20, '#?cutoff'],
    ['#reverb',         'knob',  		21, '#?reverb'],
    ['#delay',          'knob',   		22,  '#?delay'],
    ['#phaser',			'knob',			23, '#?phaser'],
    ['#tempo',          'knob',         24,  '#?tempo'],
    ['#bpm',            'knob',         24,    '#?bpm'],
    ['#kick',           'oneshot', 		48], // drums, Ctrl 25
    ['#snare',          'oneshot', 		50], // drums, Ctrl 26
    ['#hihat',          'oneshot', 		52], // drums, Ctrl 27
    ['#tom',            'oneshot', 		53], // drums, Ctrl 28
    ['#crash',          'oneshot', 		55], // drums, Ctrl 29
    ['#downsweep',      'oneshot',      57],
    ['#damnson',        'oneshot',      59],
    ['#hookedonphonix', 'oneshot',      60],
    ['#randomsound',    'randomsound',   0],
    ['#piano',          'instrument',	 1],  // Ctrl 30
    ['#bass',           'instrument',	 2],  // Ctrl 31
    ['#pad',            'instrument',	 3],  // Ctrl 32
    ['#lead',           'instrument',	 4],  // Ctrl 33
    ['#help',           'help',          0],
    ['#mute',           'mute',          0],
    ['#unmute',         'unmute',        0],
    ['#play',           'play',        251],
    ['#pause',          'pause',       252],
    ['#record',         'record',        0],
    ['#transpose',      'knob',        25, '#transpose']
];


// IF YOU UPDATE THESE, PLEASE CHECK BOT.JS FOR ANY HARDCODED #S THAT MAY BREAK!
exports.mutes = [
    ['kick',   25],
    ['snare',  26],
    ['hihat',  27],
    ['tom',    28],
    ['crash',  29],
    ['piano',  30],
    ['bass',   31],
    ['pad',    32],
    ['lead',   33]
];