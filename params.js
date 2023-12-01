// Define controllable parameters and corresponding MIDI info

exports.params = [

    // Name                         Type       FL Ctrl#
    [['filter','?filter'],          'knob',   	    20],
    [['reverb','?reverb'],          'knob',  		21],
    [['delay','?delay'],            'knob',   		22],
    [['phaser','?phaser'],		    'knob',			23],
    [['tempo','?tempo'],            'knob',         24],
    [['bpm','?bpm'],                'knob',         24],
    [['key','?key'],                'knob',         35],
    [['pitch','?pitch'],            'knob',         35],
    ['vocalX',                      'knob',         36],
    ['vocalY',                      'knob',         37],
    [['tremolo','?tremolo'],        'knob',         38],

    // Name             Type        Note #   Mute Ctrl#     MuteGroup
    ['kick',           'oneshot', 		48,         25,       'drums'],
    ['snare',          'oneshot', 		50,         26,       'drums'],
    ['hihat',          'oneshot', 		52,         27,       'drums'],
    ['tom',            'oneshot', 		53,         28,       'drums'],
    ['crash',          'oneshot', 		55,         29,       'drums'],
    ['downsweep',      'oneshot',       57],
    ['damnson',        'oneshot',       59],
    ['hookedonphonix', 'oneshot',       60],
    ['airhorn',        'oneshot',       62],
    ['randomsound',    'randomsound',    0],
    ['piano',          'instrument',	 1,         30, 'instruments'],
    ['bass',           'instrument',	 2,         31, 'instruments'],
    ['pad',            'instrument',	 3,         32, 'instruments'],
    ['lead',           'instrument',	 4,         33, 'instruments'],
    ['arp',            'instrument',     5,         34, 'instruments'],
    ['vocal',          'instrument',     6],
    ['help',           'help',           0],
    ['midiphonix',     'help',           0],
    ['mute',           'mute',           0],
    ['unmute',         'unmute',         0],
    ['play',           'play',         251],
    ['pause',          'pause',        252],
    ['record',         'record',         0],
    ['perfmode',       'mode',           0],
    ['seq',            'seq',            0],
    ['commands',       'commands',       0],

    // Figure out how to remove these perfModeOrder duplicates without breaking the bot.js checks
    ['clap',           'oneshot',        0],
    ['shaker',           'oneshot',        0],
    ['perc',           'oneshot',        0],
    ['texture',           'oneshot',        0],
    ['buildup',           'oneshot',        0],
    ['cymbals',         'oneshot',          0],
    ['brekabeat',       'oneshot',          0]

];

// This must match the order of Tracks in the Performance Mode playlist/arrangement:

exports.perfModeOrder = [

    'kick',
    'snare',
    'hihat',
    'tom',
    'clap',
    'cymbals',
    'crash',
    'shaker',
    'perc',
    'buildup',
    null,
    'bass',
    'pad',
    'lead',
    'arp',
    'texture',
    'breakbeat'

];