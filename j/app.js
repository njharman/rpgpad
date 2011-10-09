/* vim: set expandtab tabstop=2 shiftwidth=2: */
// Norman J. Harman Jr. njharman@gmail.com

String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

if (typeof Object.create !== 'function') {
  Object.create = function (o) {
    function F() {}
    F.prototype = o;
    return new F();
    };
  }

if (typeof Object.spawn !== 'function') {
  Object.spawn = function (parent, props) {
    var defs = {}, key;
    for (key in props) {
      if (props.hasOwnProperty(key)) {
        defs[key] = {value: props[key], enumerable: true};
        }
      }
    return Object.create(parent, defs);
    }
  }

Ext.regModel('PC', {
  fields: [
    {name: 'id'},
    {name: 'name',    type: 'string'},
    {name: 'player',  type: 'string'},
    {name: 'ac',      type: 'int'},
    {name: 'hits',    type: 'int'},
    ],
  proxy: {
    id: 'players',
    type: 'localstorage'
    },
  });

Ext.regModel('Kill', {
  fields: [
    {name: 'id'},
    {name: 'count',   type: 'int'},
    {name: 'name',    type: 'string'},
    {name: 'xp',      type: 'int'},
    ],
  proxy: {
    id: 'kills',
    type: 'localstorage'
    },
  });


Ext.ns('rpgpad.saves');
Ext.ns('rpgpad.record');

// aimed, breath, death/para/poison, petri/poly, spells
rpgpad.saves.ftr = [ // lvl
  [18,20,16,17,19],  // 0
  [16,17,14,15,17],  // 1
  [16,17,14,15,17],  // 2
  [15,16,13,14,16],  // 3
  [14,14,12,13,15],  // 4 (non-standard progression
  [13,13,11,12,14],  // 5
  [13,13,11,12,14],  // 6
  [12,12,10,11,13],  // 7
  [11,10, 9,10,12],  // 8 (non-standard progression
  [10, 9, 8, 9,11],  // 9
  [10, 9, 8, 9,11],  // 10
  [ 9, 8, 7, 8,10],  // 11
  [ 8, 6, 6, 7, 9],  // 12 (non-standard progression
  [ 7, 5, 5, 6, 8],  // 13
  [ 7, 5, 5, 6, 8],  // 14
  [ 6, 4, 4, 5, 7],  // 15
  [ 6, 4, 4, 5, 7],  // 16
  ];
rpgpad.saves.mon = rpgpad.saves.ftr; // ftr also also monster saves
rpgpad.saves.pal = [
  [14,15,12,13,15],  // 1
  [14,15,12,13,15],  // 2
  [13,14,11,12,14],  // 3
  [13,14,11,12,14],  // 4
  [11,11, 9,10,12],  // 5
  [11,11, 9,10,12],  // 6
  [10,10, 8, 9,11],  // 7
  [10,10, 8, 9,11],  // 8
  [ 8, 7, 6, 7, 9],  // 9
  [ 8, 7, 6, 7, 9],  // 10
  ];
rpgpad.saves.clr = [
  [14,16,10,13,15],  // 1
  [14,16,10,13,15],  // 2
  [14,16,10,13,15],  // 3
  [13,15, 9,12,14],  // 4
  [13,15, 9,12,14],  // 5
  [13,15, 9,12,14],  // 6
  [11,13, 7,10,12],  // 7
  [11,13, 7,10,12],  // 8
  [11,13, 7,10,12],  // 9
  ];
rpgpad.saves.drd = rpgpad.saves.clr; // clr also also druid saves
rpgpad.saves.mu = [
  [11,15,14,13,12],  // 1
  [11,15,14,13,12],  // 2
  [11,15,14,13,12],  // 3
  [11,15,14,13,12],  // 4
  [11,15,14,13,12],  // 5
  [ 9,13,13,11,10],  // 6
  [ 9,13,13,11,10],  // 7
  [ 9,13,13,11,10],  // 8
  [ 9,13,13,11,10],  // 9
  [ 9,13,13,11,10],  // 10
  ];
rpgpad.saves.ill = rpgpad.saves.mu; // mu also also illusionist saves
rpgpad.saves.th = [
  [14,16,13,12,15],  // 1
  [14,16,13,12,15],  // 2
  [14,16,13,12,15],  // 3
  [14,16,13,12,15],  // 4
  [12,15,12,11,13],  // 5
  [12,15,12,11,13],  // 6
  [12,15,12,11,13],  // 7
  [12,15,12,11,13],  // 8
  [19,14,11,10,11],  // 9
  [19,14,11,10,11],  // 10
  [19,14,11,10,11],  // 11
  [19,14,11,10,11],  // 12
  ];

// XP for monsters table
rpgpad.xp_table = [
// base, perhitpoint  ignoring special/exceptional xp bonus
  [   5,  1, ],
  [  10,  1, ],
  [  30,  1, ],
  [  50,  2, ],
  [  75,  3, ],
  [ 110,  4, ],
  [ 160,  5, ],
  [ 225,  8, ],
  [ 350, 10, ],
  [ 600, 12, ],
  [ 700, 13, ],
  [ 900, 14, ],
  [1200, 16, ],
  [1500, 17, ],
  [1810, 18, ],
  [2110, 19, ],
  [2400, 20, ],
  [2700, 23, ],
  [3000, 25, ],
  [3500, 28, ],
  [4000, 30, ],
  [4500, 33, ],
  [5000, 35, ],
  ];


rpgpad.SpellBook = function() {
  // Definitions of all spells in game. Provides constructor for Mobs to memorize individual spells.
  function SpellRecord(lvl, segments, name, duration, description) {
    // Create Spell Definition Record
    return {
      lvl: lvl,
      name: name,
      segments: segments,
      duration: duration,
      description: description,
      cast: function(caster, target) {
        if (this.description) {
          var description = ' [' + this.description + ']';
        } else {
          var description = '';
          }
        if (target) {
          target = ' at' + target;
        } else {
          target = '';
          }
        rpgpad.console.log('"' + caster + '" casts ' + this.name + description + target + '.');
        this.casted = true;
        return this;
        },
      };
    };
  return {
    memorize: function(spell) {
      // Return instance of memorized spell.
      var vancian = Object.spawn(this.spells[spell]);
      vancian.casted = false;
      return vancian;
      },
    spells: {               // lvl, segments, name, duration, notes
      command:        SpellRecord(1,  1, 'Command', '1rds', ''),
      detectmagic:    SpellRecord(1, 10, 'Detect Magic', '1turns', ''),
      curelt:         SpellRecord(1,  5, 'Cure Light', 'perm', 'd8'),
      curse:          SpellRecord(1, 10, 'Curse', '6rds', '-1 tohit'),
      bless:          SpellRecord(1, 10, 'Bless', '6rds', '+1 tohit'),
      sanctuary:      SpellRecord(1,  4, 'Sanctuary', '2rds+1/lvl', 'save vs Spell to attack'),
      protgood:       SpellRecord(1,  4, 'Prot vs Good', '3rds/lvl', '-2 tohit, +2 saves'),
      aid:            SpellRecord(2,  4, 'Aid', '1rds+1/lvl', 'bless + d8hp'),
      holdperson:     SpellRecord(2,  5, 'Hold Person', '4rds+1/lvl', '-2 one, -1 two, -0 three. '),
      silence15:      SpellRecord(2,  5, 'Silence 15r', '2rds/lvl', ''),
      augury:         SpellRecord(2,100, 'Augurary', 'inst', ''),
      resistfire:     SpellRecord(2,  6, 'Resist Fire', '1turns/lvl', 'imm normal. +3, half damage'),
      speakanimals:   SpellRecord(2,  5, 'Speak w/ Animals', '2rnds/lvl', ''),
      locateobject:   SpellRecord(3,100, 'Locate Object', '1rnds/lvl', "60'+10'/lvl"),
      contdark:       SpellRecord(3,  6, 'Continual Darkness', 'perm', '60\'r'),
      causeblind:     SpellRecord(3,  6, 'Cause Blindness', 'perm', ''),
      prayer:         SpellRecord(3,  6, 'Prayer', '1rd/lvl', '+1/-1 all rolls'),
      dispel:         SpellRecord(3,  6, 'Dispel Magic', 'inst', '30\'r, 50% +5/-2 per lvl diff'),

      // illusonist
      changeself:     SpellRecord(1,  1, 'Change Self', '2d6rds+2rds/lvl', "bipedal humanoid"),
      colorspray:    SpellRecord(1,  1, 'Colour Spray', 'inst', "cone 10'/lvl long, creatures == to caster lvl"),
      walloffog:      SpellRecord(1,  1, 'Wall of Fog', '2d4rds+1rd/lvl', "20'/lvl cube, 30' range"),
      detectinviso:   SpellRecord(1,  1, 'Detect Inviso', '5rd/lvl', "10'/lvl long"),
      phantasmalforce: SpellRecord(1, 1, 'Phantasmal Force', 'inst', "40'+10'/lvl cube, 60'+10'/lvl range"),
      hypnopattern:   SpellRecord(2,  2, 'Hypnotic Pattern', 'concentration', "silent, save or 'hypnotised', 30'x30'"),
      magicmouth:     SpellRecord(2,  2, 'Magic Mouth', 'perm', ""),
      misdirection:   SpellRecord(2,  2, 'Misdirection', '1rd/lvl', "30'range"),
      inviso10r:      SpellRecord(3,  3, 'Inviso 10r', 'special', ""),

      sleep:          SpellRecord(1,  1, 'Sleep', '5rds/lvl', ""),
      comprehendlang: SpellRecord(1, 10, 'Comprehend Languages', '5rds/lvl', "written"),
      esp:            SpellRecord(2,  2, 'ESP', '1rd/lvl', "5'r/lvl, surface thoughts"),
      suggestion:     SpellRecord(3,  3, 'Suggestion', '60rds+60rds/lvl', ""),
      },
    }
  }();


rpgpad.MonsterManual = function() {
  // Definitions of all mobs in game. "Mob" is something players fight.
  // Provides constructors to create MobRecords
  var MobRecord = {
    // Base Record class,
    // "Record" being constructor function that create "smart" data records.
    calc_loot: function() { return []; },
    calc_spells: function() { return []; },
    parse_attack_routine: function(type, text, melee, ranged) {
      // ('claws', '+3 d6/+3 d6').  melee if melee attackable, ranged if ranged attackable, can be both.
      var bits, attacks = [];
      Ext.each(text.split('/'), function(attack) {
        bits = attack.split(' ');
        attacks.push({type: type, text:attack, tohit:parseInt(bits[0]), calc_damage:Dice.parse(bits[1])});
        });
      return {type: type, text: text, melee: melee, ranged: ranged, attacks: attacks};
      },
    /* Following methods are meant to be chained MobRecord(blah).routine(foo).routine(bar).spelllist(foo,bar) */
    magic_resistance: function(amount) {
      // Adds magic resistance to mob type.
      this.special_defence.push(amount + '% mr');
      this.test_mr = function() {
        return Dice.d100() <= amount;
        };
      return this;
      },
    immunities: function() {
      // Adds immunities to mob type.
      var imm = Array.prototype.slice.call(arguments); // variable arguments
      this.special_defence.push('imm ' + imm.join('/'));
      return this;
      },
    routine: function(type, attacks, ranged) {
      // Adds routine(1 target) attack option to mob type.
      this.attack_options.push(this.parse_attack_routine(type, attacks, true, ranged));
      return this;
      },
    ranged: function(type, attacks, melee) {
      // Adds ranged(multi targets) attack option to mob type.
      this.attack_options.push(this.parse_attack_routine(type, attacks, melee, true));
      return this;
      },
    multi: function() {
      // Adds melee(multi targets) attack option to mob type.
      var multis = Array.prototype.slice.call(arguments); // variable arguments
      var type=[], text=[], attacks = [];
      Ext.each(multis, function(stuff) {
        type.push(stuff[0]);
        text.push(stuff[1]);
        attacks.push(this.parse_attack_routine(stuff[0], stuff[1], true))
        }, this);
      this.attack_options.push({type:type.join(', '), text:text.join('/'), multi:true, melee:true, attacks:attacks});
      return this;
      },
    spelllist: function() {
      // Adds specific spell list to mob type.
      var spells = Array.prototype.slice.call(arguments); // variable arguments
      this.calc_spells = function() {
        var list = [];
        Ext.each(spells, function(spell) { list.push(rpgpad.SpellBook.memorize(spell)) });
        return list;
        };
      return this;
      },
    treasure: function() {
      // Adds specific treasure to mob type.
      var loots = Array.prototype.slice.call(arguments); // variable arguments
      this.calc_loot = function() {
        var list = [];
        // TODO:
        return list;
        };
      return this;
      },
    };

  function MonsterRecord(type, HD, hpbonus, hpmin, ac, notes) {
    // Record constructor helper for "Monsters".
    var mob = Object.create(MobRecord);
    mob.count = 0;
    mob.type = type;
    mob.hitdice = function() {
        if (HD == 0) { return '1/2HD'; }
        else if (hpbonus != 0) { return HD + '+' + hpbonus + 'HD '; }
        else { return HD + 'HD '; }
        }();
    mob.ac = ac;
    mob.HD = HD;
    mob.saves = rpgpad.saves.mon[ function(HD, bonus) { if (HD > 0 && bonus > 0) { return HD+2 } else { return HD+1 } }(HD, hpbonus) ];
    mob.notes = notes;
    mob.special_defence = [],
    mob.special_attack = [],
    mob.attack_options = [];
    mob.calc_xp = function(hp) {
      return rpgpad.xp_table[this.HD][0] + (hp * rpgpad.xp_table[this.HD][1]);
      };
    mob.calc_hp = function() {
                      // d6+2 aka 3-8 hitpoints for monsters
      function roll_hp(hd) {return Dice.roll(hd, 6, (hd*2) + hpbonus)};
      var roll;
      if (HD > 1) { // max(8) first HD
        roll = 8 + roll_hp(HD-1);
      } else if (HD == 1) {
        roll = roll_hp(1);
      } else { // 0HD assumed d4 hp
        roll = Dice.roll(1, 4, hpbonus)
        }
      return Math.max(hpmin, roll)
      };
    return mob;
    };
  function BadGuyRecord(type, lvl, hitdie, conbonus, hpmin, ac, xp, notes, klass, saves) {
    // Record creation helper for human/demihuman mobs.
    // hitdie is size of dice to roll per level.
    if (klass == undefined) { klass='ftr'; saves = rpgpad.saves.ftr };
    var mob = Object.spawn(MobRecord, {
      count: 0,
      type: type,
      hitdice: lvl + klass,
      ac: ac,
      HD: lvl,
      saves: saves[lvl],
      notes: notes,
      special_defence: [],
      special_attack: [],
      attack_options: [],
      calc_hp: function() {
        var dice = Math.max(1, lvl);
        var roll = Dice.roll(dice, hitdie, dice*conbonus);
        return Math.max(hpmin, roll);
        },
      calc_xp: function(hp) { return xp || rpgpad.xp_table[lvl][0] + (hp * rpgpad.xp_table[lvl][1]); },
      });
    return Object.spawn(mob);
    };

  return {
    selectbox_list: function() {
      // Create array for Mob selectbox.
      var list = new Array();
      Ext.each(this.data, function(m) {
        list.push( {text: m.type, value: m} );
        });
      return list;
      },
    reset_counts: function() {
      // Mobs have sequence #1 foo, #2 foo. Reset this sequence.
      Ext.each(this.data, function(m) {
        m.count = 0;
        });
        },
    data: [                // type, lvl, hitdie, hdbonus, hpmin, ac, xp, notes, saves
      //MonsterRecord('Babbler', 5, 0,  0, 6, '40% hide, large yellow trex humanoid').multi(['r claw', '+5 d6'], ['l claw', '+5 d6'], ['bite', '+5 d8']).routine('poop', '+5 d100').magic_resistance(80),
      BadGuyRecord('Bandit (sw/xbow)', 0, 4,3,1, 6, 0, 'ringmail/sh').ranged('lt xbow', '+0 d6+1').routine('cutlass', '+0 d8').routine('spear', '+0 d6', true),
      BadGuyRecord('Bandit Sgt(2)', 2, 10,0,10, 4, 0, 'chain/sh').ranged('lt xbow', '+1 d6+1').routine('cutlass', '+1 d8').routine('spear', '+1 d6', true),
      BadGuyRecord('Bandit Ldr(4)', 4, 10,0,10, 4, 0, 'chain/sh').ranged('sbow', '+3 d6/+3 d6').routine('axe', '+3 d8'),
      BadGuyRecord('Pirate (0)', 0, 4,2,1, 8, 0, 'leather').routine('axe', '+0 d8').ranged('axe/bow/etc', '+0 d6'),
      BadGuyRecord('Bosun (2)', 2, 10,0,1, 5, 0, 'chain').routine('axe', '+1 d8').ranged('lt xbow', '+1 d6+1'),
      BadGuyRecord('Mate (4)', 4, 10,0,1, 4, 0, 'chain/sh').routine('cutlass', '+3 d8').routine('haxe', '+3 d6', true),

                        // type, HD, hpbonus, hpmin, ac, notes
      MonsterRecord('War Dog', 2, 2, 10, 4, 'barding').routine('bite', '+3 2d4'),
      BadGuyRecord('Footman', 0, 3,4,1, 6, 0, 'scale or studded/sh').routine('spear', '+0 d8', true).routine('sword', '+0 d8'),
      BadGuyRecord('Xbowman', 0, 3,3,1, 6, 0, 'ringmail').ranged('lt xbow', '+0 d6+1').routine('btl axe', '+0 d8'),
      BadGuyRecord('Sbowman', 0, 3,3,1, 5, 0, 'chain').ranged('sbow', '+0 d6/+0 d6').routine('sw sword', '+0 d6'),
      BadGuyRecord('Guard', 0, 3,4,1, 4, 0, 'jav, chain/sh').routine('sword', '+0 d8').ranged('javelin', '+0 d6'),
      BadGuyRecord('Sgt(1)', 2, 10,0,10, 4, 0, 'chain/sh').routine('spear', '+1 d8', true).routine('sword', '+1 d8'),
      BadGuyRecord('Lt(3)', 3, 10,1,17, 3, 0, 'p heal, plate').ranged('hv xbow', '+2 d6+2').routine('mstar', '+2 2d4').routine('spear', '+2 d8', true),
      BadGuyRecord('Cmdr(5)', 5, 10,1,20, 2, 0, '+1 baxe, plate/sh').routine('+1baxe', '+5 d8+1'),
      BadGuyRecord('Ldr(6)', 6, 10,2,43, 0, 0, '+1 long sword, chain/sh+2/-2dx').routine('+1sword', '+6 d8+2').routine('h axe', '+5 d6+1'),
      BadGuyRecord('Apprentice', 3, 8,1,14, 0, 0, 'metalized AC3/-3dx, p climb, pain mace, 16 17 18 17 15 14').routine('pain mace', '+1 d4+2').spelllist('sanctuary', 'silence15', 'holdperson', 'curse', 'curelt', 'command', 'resistfire'),

      BadGuyRecord('Lareth', 5, 8,1,39,-2, 0, '+3 x2-3staff(20chg), +1plate/-4dx, 18 17 18 18 15 18').routine('staff/mace', '+6 3d6+5/+1 d4+2').spelllist('bless', 'protgood', 'command', 'curelt', 'sanctuary', 'aid', 'holdperson', 'silence15', 'resistfire', 'prayer', 'contdark').immunities('para'),

      MonsterRecord('Skeleton', 1,0,2, 7, '').routine('melee', '+1 d6').immunities('cold', 'sleep', 'charm', 'hold', 'mental'),
      MonsterRecord('Skeleton (gnoll)', 2,0,8, 7, '').routine('melee', '+2 d6+1').immunities('cold', 'sleep', 'charm', 'hold', 'mental'),
      MonsterRecord('Zombie', 2,0,1, 8, '').routine('melee', '+2 d8').immunities('cold', 'sleep', 'charm', 'hold', 'mental'),
      MonsterRecord('Ghoul', 2,0,8, 6, 'para').routine('c/c/b', '+2 d3/+2 d3/+2 d6').immunities('sleep', 'charm'),
      MonsterRecord('Ghast', 4,0,8, 4, 'stench(-2), para').routine('c/c/b', '+4 d4/+4 d4/+4 d8').immunities('sleep', 'charm', 'protevil'),
      //MonsterRecord('Zombie Xvart', 3, 0,  8, 8, 'electrical').routine('melee', '+3 d8').immunities('cold', 'sleep', 'charm', 'hold', 'mental'),
      //MonsterRecord('Zombling', 1, 0,  1, 8, 'leap').routine('melee', '+1 d4').immunities('cold', 'sleep', 'charm', 'hold', 'mental'),
      //MonsterRecord('Zombie Turtle', 6, 0, 36, 2, '').routine('c/c/b', '+4 d6/+4 d6/+6 2d8').immunities('cold', 'sleep', 'charm', 'hold', 'mental'),


      MonsterRecord('G. Raven', 3,2,8, 4, "fly, 6-10' wingspan").routine('melee', '+4 d4+2').immunities('cold', 'sleep', 'charm', 'hold', 'mental'),
      MonsterRecord('G. Rat', 0,0,1, 7, '5%disease').routine('bite', '-1 d3'),
      MonsterRecord('G. Tick', 3,0,8, 3, 'blood drain').routine('bite', '+3 d4'),
      MonsterRecord('G. Snake', 4,2,8, 5, 'poison').routine('bite', '+5 d3'),
      MonsterRecord('G. Gar', 8,0,8, 3, 'Whirlpool, nat20 swallow(5% culm drown, iflict 10hp to escape').routine('bite', '+8 2d10'),
      MonsterRecord('G. Lizard', 3,1,8, 5, 'x2 on 20').routine('bite', '+4 d8'),
      MonsterRecord('G. Crayfish', 4,4,20, 4, '1-3 sup, mv 6/12", L 8ft').multi(['r claw', '+5 2d6'], ['l claw', '+5 2d6']),
      MonsterRecord('G. Leech(1)', 1,0,0, 9, 'after hit drain 1hp, disease').routine('bite', '+1 d4'),
      MonsterRecord('G. Leech(2)', 2,0,8, 9, 'after hit drain 2hp, disease').routine('bite', '+2 d6'),
      MonsterRecord('G. Leech(3)', 3,0,8, 9, 'after hit drain 3hp, disease').routine('bite', '+3 d6'),
      MonsterRecord('G. Leech(4)', 4,0,8, 9, 'after hit drain 4hp, disease').routine('bite', '+4 d8'),
      MonsterRecord('G. Frog 2ft', 1,0,0, 4, '1-4sup, 90ft leap, tongue->max damage, swallow(50lb)').routine('tongue', '+5 d1').routine('bite', '+1 d3'),
      MonsterRecord('G. Frog 4ft', 2,0,8, 7, '1-4sup, 60ft leap, tongue->max damage, swallow(150lb)').routine('tongue', '+6 d1').routine('bite', '+2 d6'),
      MonsterRecord('G. Frog 6ft', 3,0,8, 7, '1-4sup, 30ft leap, tongue->max damage, swallow(250lb)').routine('tongue', '+7 d1').routine('bite', '+3 2d4'),
      MonsterRecord('Crocodile', 3,0,8, 4, '1-3sup').routine('bite', '+3 2d4').routine('death roll', '+3 d12'),
      MonsterRecord('Crocogator', 7,0,8, 3, '1-3sup').routine('bite', '+7 3d6').routine('death roll', '+7 2d10'),
      MonsterRecord('Babbler', 5,0,8, 6, '40% hide, large yellow trex humanoid').routine('c/c/b', '+5 d6/+5 d6/+5 d8'),

      MonsterRecord('Stirge', 1,1,2, 8, '3"/18" mv, d4 blood drain').routine('probiscis', '+4 d3'),
      MonsterRecord('Drelb', 5,3,8, 2, '6" mv, Magic to hit, chill attack, size change, ').routine('chill touch', '+6 3d4'),
      MonsterRecord('Harpie', 3,0,8, 7, '6"/15" mv, sing/charm').routine('c/c/b', '+3 d3/+3 d3/+3 d6'),
      MonsterRecord('Nereid', 4,0,8, 10, 'kiss drowns(vs poison), spittle blinds, infatuate males(no save) try to catch 50% nereids run away').ranged('water', '+4 d4', true).ranged('spittle', '+4 d0', true),
      MonsterRecord('Sea Hag', 4,0,8, 7, 'silver/coldiron,magic to hit, evil eye 3/day(vs poison), true appearence(vs spells) 1/2 str for d6 turns').magic_resistance(50).routine('claws', '+4 d3+3/+4 d3+3').routine('trident', '+4 d8+3').immunities('charm', 'fear', 'sleep', 'fire', 'cold'),

                           // type, lvl, hitdie, hdbonus, hpmin, ac, xp, notes, saves
      BadGuyRecord('Otis (6/6ass)', 6, 8,3.5,0, 1, 0, 'Fire operative, poison, assinate, thief-2, 4x backstab, +2leather, +2ringprot').routine('shortswd+2', '+8 d6+5').routine('hammer', '+6 d4+3').ranged('poison dart', '+8 d2/+8 d2/+8 d2'),
      BadGuyRecord('Dick Rentsch (5)', 5, 10,1,1, 4, 0, 'Earth spy, dagger+1 in arm holster, rags of chain, 17 8 13 15 15 7').routine('dagger+1', '+6 d4+2', true).routine('bootblade', '+5 d3+1/+5 d3+1'),
      BadGuyRecord('Screng (6witch)', 6, 6,2,1, 10, 0, "Iuz, potions/scrolls, MS35%, HS35%, turn4th, True Name(wish), witch's caldrun(fly,brew), Talking Skull, 13 12 17 15 16 3").magic_resistance(25).routine('dagger+1 poison', '+3 d4+1').spelllist('sleep', 'comprehendlang', 'command', 'augury', 'speakanimals', 'esp', 'dispel', 'suggestion'),
      BadGuyRecord('Hruda (3witch)', 3, 6,1,1, 10, 0, "Slaadi, potions/scrolls, MS20%, HS20%, turn1st, True Name(wish), staff of withering 2chg (age 10), 3 chg (wither limb+age 10), broom fly, 15 9 18 11 15 6").routine('wither staff+1', '+2 d4+1').spelllist('changeself', 'sleep', 'holdperson'),
      MonsterRecord('Flying Skull', 3,0,1, 2, 'ray enfeeblement, sage, Screngs familiar').routine('bite', '+3 d4').immunities('cold', 'sleep', 'charm', 'hold', 'mental'),
      BadGuyRecord('Roberts (6/1ill)', 6, 10,0,0, 6, 0, 'Water pawn, whip of grabbing, leather+2').routine('whip', '+5 d2').routine('saber+1', '+6 d8+1').spelllist('colorspray'),
      BadGuyRecord('Tianna (8)', 8, 10,1,62, 2, 0, 'Water?, 3/2attacks, magnetic shield, spear+1 dagger+2 leather+1, ring prot+3, 17(19) 9 10 15 15 17').routine('spear+1', '+11 d8+7').routine('dagger+2', '+12 d4+8', true),
      BadGuyRecord('Gruxanthor (5/mu5)', 5, 6,0,59, 4, 0, 'Water follower, dagger +1 chain+1, 15 10 10 12 17 14').routine('staff', '+4 d8').routine('dagger+1', '+5 d4+1', true).spelllist('inviso10r', 'hypnopattern', 'magicmouth', 'misdirection', 'colorspray', 'walloffog', 'detectinviso', 'phantasmalforce' ),

      MonsterRecord('Gnoll (lbow)', 2,0,8, 5, 'scale').routine('zwei', '+2 2d4').ranged('lbow', '+2 d6/+2 d6'),
      MonsterRecord('Gnoll (axe)', 2,0,8, 5, 'scale').routine('mstar', '+2 2d4').ranged('haxe', '+2 d6'),
      MonsterRecord('Gnoll guard', 3,0,16, 4, 'mail').routine('pole', '+3 d10').ranged('lbow', '+3 d6/+3 d6'),
      MonsterRecord('Gnoll leader', 3,0,20, 5, 'scale').routine('zwei', '+3 2d4').ranged('lbow', '+4 d8/+4 d8'),
      MonsterRecord('Gnoll chief', 4,0,24, 3, 'mail').routine('baxe',  '+4 3d4+2'),
      MonsterRecord('Gnoll fm', 1,0,2, 7, '').routine('melee', '+1 d4'),

      MonsterRecord('Hobgoblin', 1,1,2, 5, '').routine('sw', '+2 d8').ranged('cbow', '+2 d6/+2 d6'),

      MonsterRecord('Bugbear (xbow)', 3,1,8, 5, '1-3sup, lamellar').routine('melee', '+4 2d8').ranged('hvy', '+4 d12'),
      MonsterRecord('Bugbear leader', 4,1,20, 4, '1-3sup, lamellar').routine('melee', '+5 2d8+1').ranged('hvy', '+4 d12'),
      MonsterRecord('Bugbear chief', 4,1,32, 3, '1-3sup, plate').routine('melee', '+6 2d8+2'),
      MonsterRecord('Bugbear fm', 1,1,3, 5, '1-3sup').routine('melee', '+2 d8'),
      MonsterRecord('Bugbear young', 0,0,2, 7, '1-3sup').routine('melee', '-1 d4'),

      MonsterRecord('Ogre', 4,1,20, 4, 'mv 8"').routine('stone club', '+5 d6+4').ranged('rock', '+5 d10'),
      MonsterRecord('Ogre chief', 3,1,26, 4, 'mv 8"').routine('baxe', '+5 d8+4').ranged('rock', '+5 d12'),

      MonsterRecord('Lizardman', 2,1,8, 5, '').routine('c/c/b', '+3 d2/+3 d2/+3 d8').ranged('javelin', '+3 d6').ranged('barbed darts', '+3 d3+1/+3 d3+1'),
      MonsterRecord('Lizardman Shaman', 2,1,22, 5, '5th lvl shaman').routine('c/c/b', '+7 d2/+7 d2/+7 d8').spelllist('curelt', 'protgood', 'detectmagic', 'resistfire', 'augury', 'speakanimals', 'dispel'),

      MonsterRecord('Gobo (sbow)', 1,-1,2, 6, '').routine('melee', '+0 d6').ranged('sbow', '+1 d4/+1 d4'),
      MonsterRecord('Gobo (dart)', 1,-1,2, 6, '').ranged('dart', '+1 d2/+1 d2/+1 d2').routine('melee', '+0 d6'),

      MonsterRecord('Fire Mephit', 3,1,8, 5, "BW 15' jet(d8+1)/5'blanket(d4), 2xmagicmissle 3/day, heatmetal 1/day, 33% gate mephit, licked by flames, 4' tall, bat winged outlandish, cigar smoking").routine('claws', '+4 d3+1/+4 d3+1'),
      MonsterRecord('Earth Mephit', 3,2,8, 2, "BW 15' cone(d4+50% blinded/stunned), dig earth 1/day, 33% gate mephit, stoney, 4' tall, bat winged outlandish, cigar smoking").routine('claws', '+4 d4/+4 d4'),
      MonsterRecord('Steam Mephit', 3,3,8, 7, "BW 20'r steam(d3+50% stun), 40'x40' boiling rain(2d6) 1/day, contaminate water 1/day, 33% gate mephit, sweats boiling water, 4' tall, bat winged outlandish, cigar smoking").routine('claws', '+4 d4/+4 d4'),
      MonsterRecord('Smoke Mephit', 3,0,8, 4, "BW 20' ball(d4+blind d2rnds), inviso 1/day, dancing lights 1/day, 33% gate mephit, emits smoke, 4' tall, bat winged outlandish, cigar smoking").routine('claws', '+3 d2/+3 d2'),
      MonsterRecord('Lava Mephit', 3,0,8, 6, "BW 10' ball(d6), shape change into lava pool, regen 2hp in lava, 33% gate mephit, licked by flames, 4' tall, bat winged outlandish, cigar smoking").routine('claws', '+3 d8+1/+3 d8+1'),

      MonsterRecord('Big Spider', 1,1,2, 6, '+4poison').routine('bite', '+2 d4'),
      MonsterRecord('Bigger Spider', 2,2,8, 6, '30ft jump, +2poison').routine('bite', '+3 d6'),
      MonsterRecord('Biggest Spider', 4,4,8, 4, 'web, poison').routine('bite', '+5 d8'),
      MonsterRecord('Wolf', 2,2,8, 7, '10').routine('bite', '+3 d4+1'),
      //MonsterRecord('Lilwere', 2, 1, 10, 3, '8 1-3sup, silv/magic').routine('bite', '+3 d4'),
      MonsterRecord('Werewolf', 4,3,20, 5, '8 1-3sup, silv/magic').routine('bite', '+5 2d4'),

      MonsterRecord('Orc (xbow)', 1,0,2, 6, 'scale').routine('scim', '+1 d8').ranged('lt xbow', '+1 d6+1'),
      MonsterRecord('Orc (sbow)', 1,0,2, 6, 'scale').routine('scim', '+1 d8').ranged('sbow', '+1 d6/+1 d6'),
      MonsterRecord('Orc guard', 2,0,11, 4, 'banded').routine('pole', '+2 d10').ranged('lt xbow', '+2 d6+1'),
      MonsterRecord('Orc captian', 2,0,15, 4, 'mail/sh').routine('scim', '+2 d8+1').ranged('sbow', '+2 d6/+2 d6'),
      MonsterRecord('Orc chief', 3,0,18, 3, 'plate').routine('baxe', '+3 3d4+1'),

      BadGuyRecord('Alcolyte', 1, 8,0,4, 4, 0, 'p unholy, banded').routine('mace', '+0 d6+2').spelllist('curelt', 'bless', 'curse', 'command'),
      MonsterRecord('Bogling (blow)', 0,0,2, 7, 'leap dart poison (+2Para) ').routine('fists', '-1 d4').ranged('blowgun', '+0 d2'),
      MonsterRecord('Bog Chief', 1,0,4, 5, '').routine('nat', '1 d4'),

      MonsterRecord('Troglodyte', 2,0,8, 5, 'odor, chameleon').routine('b/c/c', '+2 d4+1/+2 d3/+2 d3').routine('club', '+2 d6', true),
      MonsterRecord('Trog guard', 3,0,12, 5, 'odor, chameleon').routine('club', '+3 d6+1', true),
      MonsterRecord('Trog leader', 4,0,24, 5, 'odor, chameleon').routine('axe', '+4 d8+1', true),
      MonsterRecord('Trog chief', 6,0,36, 5, 'odor, chameleon').routine('axe', '+6 d8+2', true),
      MonsterRecord('Trog fm', 1,1,2, 5, 'odor, chameleon').routine('b/c/c', '+2 d4+1/+2 d3/+2 d3'),
      MonsterRecord('Trog young', 0,0,2, 7, 'chameleon').routine('bite', '-1 d4'),
      ],
    }
  }();


rpgpad.melee_count = 0; // Global!

rpgpad.new_melee = function() {
  // A Melee is group of mobs and player characters that are positioned to ettack ach other.
  function MeleeHeader() {
    // Melee title and list of participating characters.
    var header = new Ext.Container({
      itemId: 'b_characters',
      cls: 'pc_list',
      layout: { type: 'hbox', pack: 'start', align: 'center' },
      items: [ { xtype: 'component', flex:1 }, ],
      // Attributes
      _title: 'Battle' + rpgpad.melee_count,
      _characters: [],
      // Methods
      get_characters: function() {
        return this._characters;
        },
      add_character: function(character) {
        if (this._characters.indexOf(character) == -1 ) { this._characters.push(character) };
        _update_text();
        },
      remove_character: function(character) {
        if (this._characters.indexOf(character) != -1 ) { this._characters.remove(character) };
        _update_text();
        },
      });
    function _update_text() {
      var txt = header._title + ':';
      Ext.each(header._characters, function(c) { txt += ' ' + c.model.data.name; });
      header.getComponent(0).update(txt);
      header.getComponent(0).doComponentLayout();
      }
    _update_text();
    return header;
    };

  function MobList() {
    // Container below header, holds mobs.
    return new Ext.Container({
      title: 'mobs' + rpgpad.melee_count,
      itemId: 'm_mobs',
      cls: 'mob_list',
      layout: { type: 'vbox', align: 'stretch' },
      })
    };

  function Mob(mm) {
    // Instance of a Mob, mm is mob record from monstermanual.
    function mynameis() { return '#' + mm.count + ' ' + mm.type; };
    mm.count += 1;
    var hitpoints = mm.calc_hp();
    var mob = new Ext.Toolbar({
      name: mynameis(),
      mm: mm,
      xp: mm.calc_xp(hitpoints),
      spells: mm.calc_spells(),
      loot: mm.calc_loot(),
      cls: 'mob',
      height: 60,
      layout: { type: 'hbox', pack: 'justify', align : 'center' },
      defaults: {ui:'small', centered:true, },
      items: [
        { text: mynameis(), badgeText: mm.hitdice, width:120, padding: '10 0 10 0', handler: function(button, e) {
          mob.toggle_selection();
          },
        },
        { itemId:'m_attack', width:120, padding:10, handler: function(button, e) {
          mob.do_attack();
          },
        },
        { xtype:'spacer' },
        { text: 'Action', itemId:'m_action', padding:10, handler: function(button, e) {
          mob._melee.action_overlay.show_action([mob]);
          },
        },
        { xtype:'component', html:'AC '+ mm.ac, cls:'m_ac', margin:5 },
        { iconMask: true, iconCls: 'add', ui:'plain', padding:'17 5 0 15', centered:true, handler: function(button, e) {
          mob.hitpoints(1);
          },
        },
        { xtype:'textfield', itemId:'hitpoints', width:30, padding:0, centered:true, value:hitpoints, },
        { iconMask: true, iconCls: '/minus.png', ui:'plain', padding:'17 15 0 5', handler: function(button, e) {
          mob.hitpoints(-1);
          },
        },
        { xtype:'spacer' },
        { xtype:'textfield', name:'special', value: mm.notes + ' ' + mm.special_attack.join(', ') + ' ' + mm.special_defence.join(', ') },
        ],
      });
    mob.toggle_selection = function(on) {
      // Toggle/set Mob's selected.
      if (on == true) { this.selected = false }
      if (on == false) { this.selected = true }
      if (this.selected) {
        this.removeCls('selected');
        this.selected = false;
      } else {
        this.addCls('selected');
        this.selected = true;
        }
      };
    mob.roll_mr = function () {
      // Roll magic resistance.
      if (mm.test_mr != undefined) {
        return mm.test_mr;
      } else {
        return function() { return undefined; };
        }
      }();
    mob.roll_saves = function() {
      // Roll all saves.
      var roll = Dice.d20();
      return {roll: roll, aimed: roll-mm.saves[0], bw: roll-mm.saves[1], dpp: roll-mm.saves[2], pp: roll-mm.saves[3], spell: roll-mm.saves[4]};
      };
    mob.roll_attack = function(attack) {
      // Roll one attack of an attack routine.
      if (this.incapacitated == true) {
        return { roll:0, hitac:'incapacitated', attack:0, damage:0 };
        }
      var roll = Dice.d20();
      return {
        roll: roll,
        hitac: 20 - (roll + attack.tohit),
        attack: roll + attack.tohit,
        damage: attack.calc_damage(),
        type: attack.type,
        }
      };
    mob.hitpoints = function(delta) {
      // Modify and return mob's hitpoints.
      var control = this.getComponent('hitpoints');
      var hitpoints = parseInt(control.getValue()) + delta;
      control.setValue(hitpoints);
      if (hitpoints < 0) {
        this.dead();
        };
      return hitpoints;
      };
    mob.dead = function() {
      // Mark mob as dead, send to killtab.
      rpgpad.KillTab.record_death(this.name, this.mm.type, this.xp);
      this._melee.remove_mob(this);
      return this;
      };
    mob.captured = function() {
      // Mark mob as captured, send to killtab.
      rpgpad.KillTab.record_capture(this.name, this.mm.type, this.xp);
      this._melee.remove_mob(this);
      return this;
      };
    mob.incapacitate = function(rounds) {
      // Mark mob as incapacitated.
      this.incapacitated = true;
      this.addCls('incapacitated');
      this.getComponent('m_attack').setDisabled(true);
      this.toggle_selection(false);
      if (this.incapacitated == true) {
        rpgpad.console.log(this.name + ' incapacitated for ' + rounds + 'rnds.');
        }
      return this;
      };
    mob.revive = function() {
      // Mark mob as no longer incapacitated.
      this.incapacitated = false;
      this.removeCls('incapacitated');
      this.getComponent('m_attack').setDisabled(false);
      if (this.incapacitated == true) {
        rpgpad.console.log(this.name + ' revived.');
        }
      return this;
      };
    mob.get_attacks = function() {
      // Return current attack routines/multi attacks.
      var attacks = [];
      if (this.attack.multi) {
        // already split into multiple attacks
        attacks = this.attack.attacks;
      } else if (this.attack.ranged) {
        // split into multiple attacks
        Ext.each(this.attack.attacks, function(a) {
          attacks.push({type: this.attack.type, ranged: true, multi: true, text: a.text, attacks: a});
          }, this);
      } else {
        attacks.push(this.attack);
        }
      return attacks;
      };
    mob.resolve_attacks = function(next_target, any_target, format) {
      // Resolve all attacks for mob.
      var result = '';
      Ext.each(this.get_attacks(), function(routine) {
        if (routine.multi) {
          target = any_target(mob);
        } else {
          target = next_target(mob);
          }
        Ext.each(routine['attacks'], function(attack) {
          result += format(mob, this.attack_html(this.roll_attack(attack), target));
          }, this);
        }, this);
      return result
      };
    mob.do_attack = function() {
      // One mob's full attacks, no target, pops up overlay.
      var html, result;
      html = '<div align="center"><h3>' + this.name + '</h3>' + 'HD: ' + this.mm.HD + ' "' + this.attack['text'] + '"<br /><br /></div>';
      Ext.each(this.get_attacks(), function(routine) {
        Ext.each(routine['attacks'], function(attack) {
          result = this.attack_html(this.roll_attack(attack), {ac:10});
          rpgpad.console.log('"' + this.name + '" Attack: ' + result);
          html += '<h3>' + result + '</h3></div>'
          }, this);
        }, this);
      this._melee.attack_overlay.my_show(html, this);
      };
    mob.attack_html = function(r, target) {
      // r is mob.roll_attack result.
      if (r.hitac == 'incapacitated') {
        return '(-) Incapacitated!'
      } else {
        var name, html, damage;
        if (target.name == undefined) { name = '' }
        else { name = target.name + ' '; }
        html = '<i>' + r.type +'</i> ';
        damage = name + r.damage + ' hits';
        if (r.roll == 20) {
          return html += '<b>Hit</b> (<span style="color:green"><b>Natural 20!</b></span>) <span style="color:red"> ' + damage + '</span>';
        } else if (r.roll == 1) {
          return html += '<b>Missed</b> (<span style="color:green"><b>Natural 1!</b></span>) ' + damage
        } else if (r.hitac <= target.ac) {
          return html += '<b>Hit</b> (AC' + r.hitac + ') <span style="color:red"> ' + damage + '</span>';
        } else {
          return html += '<b>Missed</b> (AC' + r.hitac + ') ' + damage;
          }
        }
      };
    mob.switch_attack = function(attack) {
      // Switch between available attack options.
      this.attack = attack;
      var control = this.getComponent('m_attack');
      control.setText(attack['text']);
      control.setBadge(attack['type']);
      control.doComponentLayout();
      };
    mob.switch_attack(mm.attack_options[0]);
    return mob;
    };

  var attack_overlay = new Ext.Panel({
    modal: true,
    floating: true,
    centered: true,
    styleHtmlContent: true,
    cls: 'attack_overlay',
    dockedItems: [
      new Ext.Toolbar({
        dock : 'bottom',
        height: 54,
        layout: { type:'hbox', align: 'stretch', pack: 'justify' },
        defaults: {margin: 6, },
        items: [],
        }),
      ],
    my_show: function(html, mob) {
      function add_option(who, what, attack) {
        return {
          text: what + ' ' + attack['text'], handler: function(button, e) {
            attack_overlay.hide();
            mob.switch_attack(attack);
            mob.do_attack();
            },
          };
        };
      var bob = this.getDockedItems()[0];
      bob.removeAll(true);
      Ext.each(mob.mm.attack_options, function(option) {
        if (option != mob.attack) {
          bob.add(add_option(mob, option['type'], option));
          }
        });
      bob.doLayout();
      this.update(html);
      this.show();
      this.doComponentLayout();
      },
    });

  var multi_attack_overlay = new Ext.Panel({
    modal: true,
    floating: true,
    centered: true,
    styleHtmlContent: true,
    cls: 'multi_attack_overlay',
    my_show: function(html) {
      this.update(html);
      this.show();
      this.doComponentLayout();
      },
    });

  var action_overlay = new Ext.Panel({
    modal: true,
    floating: true,
    centered: true,
    cls: 'action_overlay',
    width: 400,
    layout: { type: 'vbox', align: 'stretch' },
    defaults: {xtype:'button', margin:'6 10 6 10', cls: 'bigbutton', centered:true, flex:1, },
    items: [
      { xtype: 'component', itemId:'a_header', styleHtmlContent: true, },
      { text: 'Revive', handler: function(button, e) { Ext.each(action_overlay._mobs, function(m) { m.revive() }); action_overlay.hide(); }, },
      { text: 'Incapacitate', margin: '3 10 10 10', handler: function(button, e) { Ext.each(action_overlay._mobs, function(m) { m.incapacitate() }); action_overlay.hide(); }, },
      { text: 'Aimed Save', ui:'confirm', handler: function(button, e) { action_overlay.show_save('Rod/Wand/Staff', 'aimed') } },
      { text: 'Breath Save', ui:'confirm', handler: function(button, e) { action_overlay.show_save('Breath Weapon', 'bw') } },
      { text: 'Death/Para/Poison', ui:'confirm', handler: function(button, e) { action_overlay.show_save('Death/Paralysis/Poison', 'dpp') } },
      { text: 'Petri/Poly Save', ui:'confirm', handler: function(button, e) { action_overlay.show_save('Petrification/Polymorph', 'pp') } },
      { text: 'Spell Save', ui:'confirm', handler: function(button, e) { action_overlay.show_save('Spell', 'spell') } },
      { text: 'Spells', itemId:'a_spells', margin: '10', handler: function(button, e) {
        action_overlay.hide();
        spell_overlay.my_show(action_overlay._mobs[0]);
        },
      },
      { text: 'To Dead Pile', ui:'decline', handler: function(button, e) { Ext.each(action_overlay._mobs, function(m) { m.dead() }); action_overlay.hide(); }, },
      { text: 'To Captured', ui:'decline', handler: function(button, e) { Ext.each(action_overlay._mobs, function(m) { m.captured() }); action_overlay.hide(); }, },
      { text: 'Remove', ui: 'decline', margin: '10', handler: function(button, e) {
        Ext.each(action_overlay._mobs, function(m) { melee.remove_mob(m) });
        melee.doComponentLayout();
        action_overlay.hide();
        },
      },
      ],
    });
  action_overlay.show_action = function(mobs) {
    // Display Action picker for multiple mobs.
    this._mobs = mobs;
    if (this._mobs.length > 0) {
      for (var i=this.items.length;i > 12; i--) {
        this.remove(i-1);
        }
      Ext.each(rpgpad.Combat.get_melees(), function(m) {
        if (m.title != melee.title) {
          this.add({
            text: 'To ' + m.title,
            xtype:'button', margin: 10, cls: 'bigbutton', centered:true, flex:1,
            scope: this,
            handler: function(button, e) {
              Ext.each(this._mobs, function(mob) {
                melee.move_mob(mob, m);
                }, this);
              this.hide();
              },
            });
          }
        }, this);
      var header = this.getComponent('a_header');
      var html = this._mobs.length + ': ';
      Ext.each(this._mobs, function(m) { html += m.name + ', ' });
      header.update(html);
      this.getComponent('a_spells').setDisabled(this._mobs.length != 1 || this._mobs[0].spells.length == 0);
      this.doLayout();
      this.show();
      }
    };
  action_overlay.show_save = function(name, save) {
    // Show save and magic_resistance results for multiple mobs.
    // TODO: magic_resistance is always in effect, up to user to determine if that is valid.
    var saves, roll, val, msg;
    var saved = [], failed = [];
    var html = '<h2>Save vs ' + name + '</h2>';
    Ext.each(this._mobs, function(m) {
      saves = m.roll_saves();
      roll = saves['roll'];
      val = saves[save];
      html += m.name + ' roll: ' + roll;
      if (val >= 0) {
        saved.push(m);
        m.toggle_selection();
        msg = ' <b>Saved</b> by ' + val + '!';
      } else {
        var mr = m.roll_mr();
        if (mr == undefined) {
          failed.push(m);
          msg = ' <b>Failed Save</b> by ' + Math.abs(val) + '.';
        } else if (mr) {
          saved.push(m);
          m.toggle_selection();
          msg = ' <b>MR Rolled</b>, Failed Save by ' + Math.abs(val) + '.';
        } else {
          failed.push(m);
          msg = ' <b>MR Failed, Failed Save</b> by ' + Math.abs(val) + '.';
          }
        }
      rpgpad.console.log('"' + m.name + '" Save vs ' + name + ': (' + roll + ')' + msg);
      html += msg + '<br />';
      });
    this.hide();
    saves_overlay.my_show(html, saved, failed)
    };

  var saves_overlay = new Ext.Panel({
    modal: true,
    floating: true,
    centered: true,
    styleHtmlContent: true,
    cls: 'saves_overlay',
    dockedItems: [
      new Ext.Toolbar({
        dock : 'bottom',
        height: 54,
        layout: { type:'hbox', align: 'stretch', pack: 'start' },
        defaults: {margin: 6, },
        items: [
          { text: 'Incapacitate', handler: function(button, e) {
              Ext.each(saves_overlay._failed, function(m) {
                m.incapacitate()
                });
              saves_overlay.hide();
            },
          },
          { xtype:'spacer' },
          { xtype:'numberfield', itemId:'damage', cls:'bigtext', value:'0', width:60, },
          { text: 'Damage', handler: function(button, e) {
              var damage = parseInt(button.previousSibling().getValue());
              if (damage > 0) {
                var half = Math.floor(damage/2);
                Ext.each(saves_overlay._failed, function(m) {
                  rpgpad.console.log(m.name + ' took <b>' + damage + 'hits</b> from failed save.');
                  m.hitpoints(-damage)
                  });
                Ext.each(saves_overlay._saved, function(m) {
                  rpgpad.console.log(m.name + ' took <b>' + half + 'hits</b> from passed save.');
                  m.hitpoints(-half)
                  });
              saves_overlay.hide();
              }
            },
          },
          ],
        }),
      ],
    my_show: function(html, saved, failed) {
      this._saved = saved;
      this._failed = failed;
      this.update(html);
      this.show();
      this.doComponentLayout();
      },
    });

  var spell_overlay = new Ext.Panel({
    modal: true,
    floating: true,
    centered: true,
    cls: 'action_overlay',
    width: 400,
    layout: { type: 'vbox', align: 'stretch' },
    defaults: { xtype:'button', margin:6, cls: 'bigbutton', centered:true, flex:1,
      handler: function(button, e) {
        var spell = spell_overlay._mob.spells[button.spelldex];
        spell.cast(spell_overlay._mob.name);
        spell_overlay.hide();
        },
      },
    items: [
      ],
    my_show: function(mob) {
      this._mob = mob;
      this.removeAll();
      for (var i=0; i < this._mob.spells.length; i++) {
        var spell = this._mob.spells[i];
        this.add({text: spell.name + ' (' + spell.segments + 'seg)', spelldex: i, disabled: spell.casted == true});
        };
      this.show();
      this.doLayout();
      },
    });

  rpgpad.melee_count += 1
  var melee = new Ext.Panel({
    title: 'Battle' + rpgpad.melee_count,
    cls: 'melee',
    layout: { type: 'vbox', align: 'stretch' },
    items: [ MeleeHeader(), MobList() ],
    dockedItems: [
      new Ext.Toolbar({
        dock : 'top',
        height: 54,
        layout: { type: 'hbox', align: 'stretch', pack: 'justify' },
        defaults: { margin: 6, },
        items: [
          { text: 'New', ui: 'confirm', handler: function(button, e) {
            var new_melee = rpgpad.new_melee()
            rpgpad.console.log('<b>' + new_melee.title + ' started.</b>');
            rpgpad.Combat.add(new_melee);
            rpgpad.Combat.doLayout();
            },
          },
          { text: 'End', ui: 'decline', handler: function(button, e) {
            if (rpgpad.Combat.items.getCount() == 1 && melee.getComponent('m_mobs').items.getCount() == 0) {
              return;
              }
            rpgpad.console.log('<b>' + melee.title + ' ended.</b>');
            melee.removeAll();
            rpgpad.Combat.remove(melee);
            if (rpgpad.Combat.items.getCount() == 0) {
              rpgpad.Combat.add(rpgpad.new_melee());
              rpgpad.MonsterManual.reset_counts();
              }
            rpgpad.Combat.doLayout();
            },
          },
          { xtype:'spacer' },

          new Ext.form.Select({
            id: 'select_mob',
            name: 'mob',
            modal: true,
            width: 140,
            centered: true,
            options: rpgpad.MonsterManual.selectbox_list(),
          }),
          { iconMask: true, ui: 'plain', margin:'5 0 0 0', iconCls: 'add', handler: function(button, e) {
            var selector = button.previousSibling();
            melee.add_mob(Mob(selector.getValue()));
            },
          },
          { xtype:'spacer' },

          { xtype: 'selectfield',
            width: 80,
            options: function() {
              var list = [];
              for (var i=1; i<=60; i++) {
                list.push({text:  ''+i, value: i});
                }
              return list;
              }(),
          },

          { text: 'Random', handler: function(button, e) {
            var mobs = melee.getComponent('m_mobs').items;
            var length = mobs.getCount()
            var count = button.previousSibling().getValue();
            melee.clear_selected();
            if (count >= length) {
              mobs.each(function(m) { m.toggle_selection(true) });
            } else {
              var pick, these=new Array();
              for (var i=0; i < length; i++) {
                these[i] = mobs.getAt(i);
                }
              for (var i=count; i > 0; i--) {
                pick = Dice.randint(0, these.length-1);
                these[pick].toggle_selection();
                these.remove(these[pick]);
                }
              }
            melee.action_overlay.show_action(melee.get_selected());
            },
          },
          { xtype:'spacer' },

          { text: 'Selected', handler: function(button, e) {
            melee.action_overlay.show_action(melee.get_selected());
            },
          },
          { xtype:'spacer' },
          { text: 'Ranged', handler: function(button, e) {
            var html = '<h2>' + melee.title + ' Ranged</h2>';
            html += melee.do_full_attack(melee.get_active_ranged());
            melee.multi_attack_overlay.my_show(html);
            },
          },
          { text: 'Melee', handler: function(button, e) {
            var html = '<h2>' + melee.title + '</h2>';
            html += melee.do_full_attack(melee.get_active_melee());
            melee.multi_attack_overlay.my_show(html);
            },
          },
          ]
        }),
      ],
    add_character: function(pc) {
      this.getComponent('b_characters').add_character(pc);
      },
    remove_character: function(pc) {
      this.getComponent('b_characters').remove_character(pc);
      },
    get_characters: function(pc) {
      return this.getComponent('b_characters').get_characters();
      },
    add_mob: function(mob) {
      rpgpad.console.log('"' + mob.name + '" Added to ' + this.title);
      mob._melee = this;
      var mobs = this.getComponent('m_mobs');
      mobs.add(mob);
      mobs.doLayout();
      rpgpad.Combat.doLayout();
      return mob;
      },
    remove_mob: function(mob) {
      rpgpad.console.log('"' + mob.name + '" Removed from ' + this.title);
      var mobs = this.getComponent('m_mobs');
      mobs.remove(mob);
      mobs.doLayout();
      rpgpad.Combat.doLayout();
      return mob;
      },
    move_mob: function(mob, new_home) {
      rpgpad.console.log('"' + mob.name + '" moved from ' + this.title + ' to ' + new_home.title);
      var mobs = this.getComponent('m_mobs');
      var nobs = new_home.getComponent('m_mobs');
      mobs.remove(mob, false);
      nobs.add(mob);
      mob._melee = new_home;
      mobs.doLayout();
      nobs.doLayout();
      rpgpad.Combat.doLayout();
      return mob;
      },
    random_mob: function(mob) {
      var mobs = this.getComponent('m_mobs').items;
      var count = mobs.getCount()
      if (count > 0) {
        return mobs.getAt(Dice.randint(0, count-1));
        }
      },
    get_active: function() {
      var mob_list = [];
      var mobs = this.getComponent('m_mobs').items;
      mobs.each(function(m) { if (m.incapacitated != true) {mob_list.push(m);} });
      return mob_list;
      },
    get_active_melee: function() {
      var mob_list = [];
      var mobs = this.getComponent('m_mobs').items;
      mobs.each(function(m) { if (m.incapacitated != true && m.attack.melee == true) {mob_list.push(m);} });
      return mob_list;
      },
    get_active_ranged: function() {
      var mob_list = [];
      var mobs = this.getComponent('m_mobs').items;
      mobs.each(function(m) { if (m.incapacitated != true && m.attack.ranged == true) {mob_list.push(m);} });
      return mob_list;
      },
    get_selected: function() {
      var mob_list = [];
      var mobs = this.getComponent('m_mobs').items;
      mobs.each(function(m) { if (m.selected) { mob_list.push(m)} });
      return mob_list;
      },
    clear_selected: function() {
      var mobs = this.getComponent('m_mobs').items;
      mobs.each(function(m) { m.toggle_selection(false) });
      },
    do_full_attack: function(mobs) {
      function fill_pool(pool) {
        pool.length = 0;
        Ext.each(pcs, function(c) { pool.push(c); });
        return pool;
        }
      function any_target(mob, any) {
        // Grab target from all characters, no distribution.
        return pcs[Dice.randint(0, pcs.length-1)];
        }
      function next_target(mob, any) {
        // Evenly distribute routines across targets.
        if (cpool.length == 0) { fill_pool(cpool) };
        var c = cpool[Dice.randint(0, cpool.length-1)];
        cpool.remove(c);
        return c;
        }
      function format_results(mob, result) {
        rpgpad.console.log('"' + mob.name + '" Attack: ' + result);
        return '<h3>' + mob.name + ': ' + result + '</h3>'
        }
      var pcs, html='', cpool=[];
      pcs = this.get_characters();
      if (pcs.length == 0)  {
        html += 'Move some characters into melee.';
      } else if (mobs.length == 0)  {
        html += 'No bad guys can attack.';
      } else {
        Ext.each(mobs, function(m) {
          html += m.resolve_attacks(next_target, any_target, format_results);
          });
        }
      return html;
      },
    });
  melee.action_overlay = action_overlay;
  melee.attack_overlay = attack_overlay;
  melee.multi_attack_overlay = multi_attack_overlay;
  return melee;
  };

rpgpad.Combat = new Ext.Container({
  cls: 'combat',
  height: '100%',
  scroll: 'vertical',
  flex: 5,
  layout: { type: 'vbox', align: 'stretch' },
  items: [rpgpad.new_melee()],
  // methods
  get_melees: function() {
    return this.items.items;
    },
  remove_character: function(pc) {
    // from all melees
    Ext.each(this.get_melees(), function(b) {
      b.remove_character(pc);
      });
    },
  });

rpgpad.Bullpen = function() {
  function Character(record) {
    return new Ext.Button({
      text: name,
      model: record,
      cls: 'pc_button',
      handler: function(button, e) {
        character_edit_overlay.show_pc(this);
        },
      listeners: {
        added: {
          fn: function() {
            this._update();
            },
          },
        },
      _update: function() {
        this.ac = this.model.data.ac;
        this.name = this.model.data.name;
        this.setText(this.model.data.name);
        this.setBadge(""+this.model.data.ac);
        return this;
        },
      hitpoints: function(delta) {
        this.model.data.hits += delta;
        this.model.save();
        this.setBadge(this.model.data.hits);
        return this;
        },
      });
    }
  var character_edit_overlay = new Ext.form.FormPanel({
    modal: true,
    floating: true,
    hideOnMaskTap: false,
    centered: true,
    width: 400,
    layout: { type: 'vbox', align: 'stretch', pack: 'justify' },
    defaults: { flex: 1, margin: 4, },
    items: [
      { xtype: 'textfield',
      name : 'name',
      label: 'Name',
      },
      { xtype: 'textfield',
      name : 'player',
      label: 'Player',
      },
      { xtype: 'spinnerfield',
      name : 'ac',
      label: 'AC',
      minValue: -10,
      maxValue: 10,
      },
      { xtype: 'spinnerfield',
      name : 'hits',
      label: 'HP',
      minValue: 1,
      },
    ],
    dockedItems: [
      new Ext.Toolbar({
        dock: 'top',
        height: 54,
        layout: { type: 'hbox', align: 'stretch', pack: 'center' },
        defaults: { margin: 6, },
        items: [ ],
        }),
      ],
    listeners: {
      beforehide: function(me) {
        me.updateRecord(me.pc.model);
        me.pc.model.save();
        me.pc._update();
        },
      beforesubmit: function(me) { return false; },
      },
    show_pc: function(pc) {
      this.pc = pc;
      this.load(pc.model);
      var dock = this.getDockedItems()[0];
      dock.removeAll()
      Ext.each(rpgpad.Combat.get_melees(), function(b) {
        dock.add( { text: 'To ' + b.title, handler: function(button, e) {
            character_edit_overlay.hide();
            b.add_character(character_edit_overlay.pc);
            },
          })
        });
      dock.add( { text: 'Remove', handler: function(button, e) {
            character_edit_overlay.hide();
            rpgpad.Combat.remove_character(character_edit_overlay.pc);
            rpgpad.Bullpen.remove(character_edit_overlay.pc);
            rpgpad.Bullpen.character_store.remove(character_edit_overlay.pc.model);
            rpgpad.Bullpen.character_store.sync();
            },
          });
      dock.add( { text: 'To Bullpen', handler: function(button, e) {
            character_edit_overlay.hide();
            rpgpad.Combat.remove_character(character_edit_overlay.pc);
            },
          });
      dock.doLayout();
      this.doComponentLayout();
      this.show();
      },
  });

  return new Ext.Panel({
    launch: function() {
      rpgpad.Bullpen.character_store.load();
      rpgpad.Bullpen.character_store.each(function(record) {
        rpgpad.Bullpen.add(new Character(record));
        });
      rpgpad.Bullpen.doLayout();
      },
    character_store: new Ext.data.Store({
      model: 'PC',
      autoLoad: false,
      }),
    cls: 'characters',
    height: '100%',
    scroll: 'vertical',
    flex: 1,
    layout: { type: 'vbox', align: 'stretch' },
    defaults: {margin: 6, },
    items: [],
    dockedItems: [
      new Ext.Toolbar({
        dock: 'top',
        height: 54,
        layout: { type: 'hbox', align: 'stretch', pack: 'center' },
        defaults: {margin: 6, },
        items: [
          { text: 'New', ui: 'confirm', handler: function(button, e) {
            var pc = new Character(Ext.ModelMgr.create({
                name: '',
                player: '',
                hits: 4,
                AC: 9,
                }, 'PC'));
            character_edit_overlay.show_pc(pc);
            rpgpad.Bullpen.add(pc);
            rpgpad.Bullpen.doLayout();
            },
          },
          ],
        }),
      ],
    });
  }();

rpgpad.CombatTab = new Ext.Panel({
  title: 'Combat',
  cls: 'combat-tab',
  iconCls: 'user',
  height: '100%',
  layout: { type: 'hbox', align: 'stretch' },
  items: [rpgpad.Combat, rpgpad.Bullpen,],
  });

rpgpad.KillTab = new Ext.Panel({
  title: 'Death Toll',
  pile_store: new Ext.data.Store({
    model: 'Kill',
    autoLoad: false,
    listeners: {
      datachanged: {
        fn: function(store) {
          var xp = store.sum('xp');
          rpgpad.KillTab.xp.update('<h2>'+ Math.floor(xp*1.2) + ' Monster Experience ' + xp + '</h2>');
          },
        },
      },
    }),
  cls: 'deathtoll',
  iconCls: 'x-icon-mask trash',
  height: '100%',
  width: '100%',
  scroll: 'vertical',
  layout: { type: 'vbox', align: 'stretch', pack: 'start', },
  items: [
    new Ext.Container({
      height: 40,
      layout: { type: 'hbox', align: 'stretch', pack: 'start', },
      items: [
        new Ext.Button({
          text: 'Clear List',
          margin: 5,
          padding: '4 10 4 10',
          handler: function(button, e) {
            rpgpad.KillTab.empty();
            },
          }),
        { xtype: 'component', margin: '0 0 0 60', padding: 0, styleHtmlContent: true},
        ],
      }),
    { xtype: 'list', store: null, scroll: 'vertical',
      disableSelection: true, loadingText: 'Loading...',
      itemTpl:'{count} {name}, {xp} xp',
      tpl: '<tpl for="."><div class="x-list-item-body">{count} {name}, {xp} xp</div></tpl>',
    },
    ],
  launch: function() {
    this.xp = this.items.getAt(0).items.getAt(1);
    this.pile = this.items.getAt(1);
    this.pile_store.load();
    rpgpad.KillTab.pile.bindStore(rpgpad.KillTab.pile_store);
    },
  empty: function() {
    this.pile_store.proxy.clear();
    this.pile_store.load();
    },
  record_death: function(name, type, xp) {
    rpgpad.console.log('"' + name + '" Defeated for <b>' + xp + 'xp</b>.');
    this._upsert(type, xp);
    },
  record_capture: function(name, type, xp) {
    xp = 2 * xp;
    rpgpad.console.log('"' + name + '" Captured for <b>' + xp + 'xp</b>.');
    this._upsert('(c)' + type, xp);
    },
  _upsert: function(name, xp) {
    var record = this.pile_store.findRecord('name', name);
    if (record == null) {
      record = Ext.ModelMgr.create({count: 0, xp: 0, name: name}, 'Kill');
      }
    record.data.count += 1;
    record.data.xp += xp;
    record.save();
    this.pile_store.load();
    },
  });


rpgpad.LootTab = new Ext.Panel({
  title: 'Loot',
  copper: 0,
  silver: 0,
  gold: 0,
  plat: 0,
  goods: {},  // gems and jewerly and such
  cls: 'loot',
  iconCls: 'favorites',
  height: '100%',
  width: '100%',
  scroll: 'both',
  layout: { type: 'vbox', align: 'stretch' },
  defaults: { margin:'0 0 0 10 ', styleHtmlContent: true, },
  items: [
    { xtype: 'component', itemId: 'lt_coins', padding: 10, centered: true, },
    ],
  record: function(mob) {
    var msg;
    var msg = this.copper + 'cp ' + this.silver + 'sp ' + this.gold + 'gp ' + this.plat + 'pp';
    this.getComponent('lt_coins').update('<h4>' + msg + '</h4>');
    rpgpad.console.log('"' + mob.name + '" ' + msg);
    this.copper += mob.treasure.copper;
    this.silver += mob.treasure.silver;
    this.gold += mob.treasure.gold;
    this.plat += mob.treasure.plat;
    },
  });


rpgpad.TreasureTab = new Ext.Panel({
  title: 'Treasure',
  cls: 'treasure',
  iconCls: 'favorites',
  scroll: 'both',
  html: 'TODO',
  });


rpgpad.ConsoleTab = new Ext.Panel({
  title: 'Console',
  cls: 'console',
  iconCls: 'info',
  scroll: 'both',
  html: '',
  });

rpgpad.console = {
  log: function(msg) {
    rpgpad.ConsoleTab.update('<li>' + msg + '</li>' + rpgpad.ConsoleTab.html);
    },
  clear: function() {
    rpgpad.ConsoleTab.update('');
    },
  };

rpgpad.Main = Ext.extend(Ext.TabPanel, {
  title: 'RPGPad',
  shortUrl: 'https://github.com/njharman/rpgpad',
  fullscreen: true,
  cardSwitchAnimation: { type:'cube', cover:true },
  tabBar: { dock:'bottom', layout:{ type:'hbox', align:'stretch', pack:'justify' } },
  items: [
    rpgpad.CombatTab,
    rpgpad.KillTab,
    rpgpad.LootTab,
    rpgpad.TreasureTab,
    rpgpad.ConsoleTab,
    ],
  launch: function() {
    rpgpad.KillTab.launch();
    rpgpad.Bullpen.launch();
    rpgpad.App.setActiveItem(rpgpad.KillTab);
    rpgpad.App.setActiveItem(rpgpad.CombatTab);
    },
  });

Ext.setup({
  icon: 'i/icon.png',
  tabletStartupScreen: 'i/startup_tablet.png',
  statusBarStyle: 'black',
  onReady: function() {
    rpgpad.App = new rpgpad.Main();
    rpgpad.App.launch();
    rpgpad.App.doComponentLayout();
    }
  });
