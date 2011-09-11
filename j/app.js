/* vim: set expandtab tabstop=2 shiftwidth=2: */
String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

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

rpgpad.saves.clr = [
  [14,26,10,13,15],  // 1
  [14,26,10,13,15],  // 2
  [14,26,10,13,15],  // 3
  [13,15, 9,12,14],  // 4
  [13,15, 9,12,14],  // 5
  [13,15, 9,12,14],  // 6
  [11,13, 7,10,12],  // 7
  [11,13, 7,10,12],  // 8
  [11,13, 7,10,12],  // 9
  ];
// also monster saves
rpgpad.saves.ftr = [
  [18,20,16,17,19],  // 0
  [16,17,14,15,17],  // 1
  [16,17,14,15,17],  // 2
  [15,16,13,14,16],  // 3
  [15,16,13,14,16],  // 4
  [13,13,11,12,14],  // 5
  [13,13,11,12,14],  // 6
  [12,12,10,11,13],  // 7
  [12,12,10,11,13],  // 8
  [10, 9, 8, 9,11],  // 9
  [10, 9, 8, 9,11],  // 10
  ];
rpgpad.saves.mon = rpgpad.saves.ftr;
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

// ignoring special/exceptional
rpgpad.xp_table = [
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


rpgpad.SpellRecord = function(lvl, segments, name, description) {
  return {
    lvl: lvl,
    name: name,
    segments: segments,
    description: description,
    };
  };

rpgpad.spells = {                 // lvl, segments, name, notes
  command:      rpgpad.SpellRecord(1,  1, 'Command', ''),
  curelt:       rpgpad.SpellRecord(1,  5, 'Cure Light', 'd8'),
  curse:        rpgpad.SpellRecord(1, 10, 'Curse', '-1 tohit'),
  sanctuary:    rpgpad.SpellRecord(1,  4, 'Sanctuary', 'save vs spell to attack'),
  protgood:     rpgpad.SpellRecord(1,  4, 'Prot vs Good', ''),
  holdperson:   rpgpad.SpellRecord(1,  5, 'Hold Person', ''),
  silence15:    rpgpad.SpellRecord(1,  5, 'Silence 15r', ''),
  augurary:     rpgpad.SpellRecord(1,100, 'Augurary', ''),
  locateobject: rpgpad.SpellRecord(1,100, 'Locate Object', ''),
  contdark:     rpgpad.SpellRecord(1,  6, 'Continual Darkness', ''),
  resistfire:   rpgpad.SpellRecord(1,  6, 'Resist Fire', '+3, half damage'),
  causeblind:   rpgpad.SpellRecord(1,  6, 'Cause Blindness', ''),
  prayer:       rpgpad.SpellRecord(1,  6, 'Prayer', '+1/-1 all rolls'),
  };
rpgpad.Spell = function(spell) {
  return { cast: false, data: rpgpad.spells[spell] };
  };


rpgpad.parse_attacks = function(type, str) {
  // return list of {tohit, damage}
  var attacks = [];
  var attack, mess;
  Ext.each(str.split('/'), function(attack) {
    mess = attack.split(' ');
    attacks.push({text:attack, tohit:parseInt(mess[0]), damage:mess[1]});
    });
  return {type: type, text: str, attacks: attacks};
  };

// TODO: local storage of unique peoples

rpgpad.MonsterRecord = function(hd, hpbonus, hpmin, ac, special) {
  var muffin = {
    count: 0,
    hitdice: function() {
      if (hd == 0) { return '1/2HD'; }
      else if (hpbonus != 0) { return hd + '' + hpbonus + 'HD '; }
      else { return hd + 'HD '; }
      }(),
    ac: ac,
    HD: hd,
    calc_hp: function() { return rpgpad.dmhp(hd, hpbonus, hpmin); },
    calc_xp: function(hp) { return rpgpad.xp_table[hd][0] + (hp * rpgpad.xp_table[hd][1]); },
    calc_loot: function() { return [] },
    calc_spells: function() { return [] },
    saves: rpgpad.saves.mon[ function(HD, bonus) { if (HD > 0 && bonus > 0) { return HD+2 } else { return HD+1 } }(hd, hpbonus) ],
    special: special,
    attacks: [],
    // Methods
    attack: function(type, attacks) {
      // adds attack option to monster type
      this.attacks.push(rpgpad.parse_attacks(type, attacks));
      return this;
      },
    spelllist: function() {
      // adds specific spell list to monster type
      var spells = Array.prototype.slice.call(arguments);
      this.calc_spells = function() {
        var list = [];
        Ext.each(spells, function(s) { list.push(rpgpad.Spell(s)) });
        return list;
        };
      return this;
      },
    spellbook: function() {
      // adds spell book to monster type
      // TODO: random determine spells
      return this;
      },
    treasure: function() {
      // adds specific treasure to monster type
      var stuff = Array.prototype.slice.call(arguments);
      this.calc_loot = function() {
        var list = [];
        Ext.each(stuff, function(s) { list.push(rpgpad.Spell(s)) });
        return list;
        };
      return this;
      },
    };
    return muffin;
  }

rpgpad.BadGuyRecord = function(lvl, hitdie, hdbonus, hpmin, ac, xp, special, klass, saves) {
  if (klass == undefined) { klass='ftr'; saves = rpgpad.saves.ftr };
  var muffin = {
    count: 0,
    hitdice: lvl+klass,
    ac: ac,
    HD: lvl,
    calc_hp: function() { return rpgpad.dhp(lvl, hitdie, hdbonus, hpmin); },
    calc_xp: function(hp) { return xp || rpgpad.xp_table[lvl][0] + (hp * rpgpad.xp_table[lvl][1]); },
    calc_loot: function() { return [] },
    calc_spells: function() { return [] },
    saves: saves[lvl],
    special: special,
    attacks: [],
    // Methods
    attack: function(type, attacks) {
      // adds attack option to bad guy type
      this.attacks.push(rpgpad.parse_attacks(type, attacks));
      return this;
      },
    spelllist: function() {
      // adds specific spell list to monster type
      var spells = Array.prototype.slice.call(arguments);
      this.calc_spells = function() {
        var list = [];
        Ext.each(spells, function(s) { list.push(rpgpad.Spell(s)) });
        return list;
        };
      return this;
      },
    treasure: function() {
      // adds specific treasure to monster type
      this.treasure = Array.prototype.slice.call(arguments);
      return this;
      },
    };
    return muffin;
  }


rpgpad.monstermanual = {
                    // lvl, hitdie, hdbonus, hpmin, ac, xp, special, saves
  'War Dog':        rpgpad.MonsterRecord(2, 2, 10, 4, 'barding').attack('bite', '+3 2d4'),

  'Guard (xbow)':   rpgpad.BadGuyRecord(0, 4, 3,  1, 5, 0, 'scale/sh').attack('lng sw', '+0 d8').attack('lt xbow', '+0 d6+1'),
  'Guard (spear)':  rpgpad.BadGuyRecord(0, 4, 3,  1, 5, 0, 'scale/sh').attack('spear', '+0 d6'),
  'Guard (pole)':   rpgpad.BadGuyRecord(0, 4, 3,  1, 5, 0, 'mail').attack('pole', '+0 d10'),
  'Sgt (xbow)':     rpgpad.BadGuyRecord(2,10, 0, 15, 4, 0, 'p unholy, mail/sh').attack('mstar', '+1 2d4').attack('lt xbow', '+1 d6+1'),
  'Lt (lbow)':      rpgpad.BadGuyRecord(4,10, 3, 31, 1, 0, 'p heal, plate/sh/-1').attack('lbow', '+3 d6/+3 d6').attack('haxe', '+3 d6+1'),
  'Alcolyte':       rpgpad.BadGuyRecord(1, 8, 0,  4, 4, 0, 'p unholy, banded').attack('mace', '+1 d6+2').spelllist('curelt', 'bless', 'curse', 'command'),
  'Apprentice':     rpgpad.BadGuyRecord(2, 8, 1, 10, 1, 0, 'p climb, pain mace, banded/-3, 16 17 18 17 15 14').attack('mace', '+1 d6+2').spelllist('curelt', 'command', 'curse', 'sanctuary'),
  'Lareth':         rpgpad.BadGuyRecord(5, 8, 1, 39,-2, 0, 'x2-3staff, im para, +1plate/-4, 18 17 18 18 15 18').attack('staff/mace', '+6 d6+5/+1 d4+2').spelllist('curelt', 'curelt', 'command', 'protgood', 'sanctuary', 'holdperson', 'holdperson', 'silence15', 'silence15', 'resistfire', 'prayer', 'contdark'),

                    // HD, hpbonus, hpmin, ac, special
  'Skeleton':       rpgpad.MonsterRecord(1, 0,  1, 7, 'imm cold/sleep/charm/hold/mental').attack('melee', '+1 d6'),
  'Zombie':         rpgpad.MonsterRecord(2, 0,  1, 8, 'imm cold/sleep/charm/hold/mental').attack('melee', '+2 d8'),
  'Zombie Xvart':   rpgpad.MonsterRecord(3, 0,  8, 8, 'electrical, imm cold/sleep/charm/hold/mental').attack('melee', '+3 d8'),

  'Wolf':           rpgpad.MonsterRecord(2, 2,  2, 7, '10').attack('bite', '+3 d4+1'),
  'Lilwere':        rpgpad.MonsterRecord(2, 1, 10, 3, '8 1-3sup, silv/magic').attack('bite', '+3 d4'),
  'Werewolf':       rpgpad.MonsterRecord(4, 3, 20, 5, '8 1-3sup, silv/magic').attack('bite', '+5 2d4'),

  'Giant Rat':      rpgpad.MonsterRecord(0, 0,  0, 7, '5%disease').attack('bite', '-1 d3'),
  'Giant Tick':     rpgpad.MonsterRecord(3, 0,  0, 3, 'blood drain').attack('bite', '+3 d4'),
  'Giant Snake':    rpgpad.MonsterRecord(4, 2,  0, 5, 'poison').attack('bite', '+5 d3'),
  'Giant Lizard':   rpgpad.MonsterRecord(3, 1,  0, 5, 'x2 on 20').attack('bite', '+4 d8'),
  'Giant Frog 6ft': rpgpad.MonsterRecord(3, 0,  0, 7, '1-4sup, 30ft leap, swallow(250lb)').attack('tongue', '+7 d1').attack('bite', '+3 2d4'),
  'Giant Frog 4ft': rpgpad.MonsterRecord(2, 0,  0, 7, '1-4sup, 60ft leap, swallow(150lb)').attack('tongue', '+6 d1').attack('bite', '+2 d6'),
  'Giant Frog 2ft': rpgpad.MonsterRecord(1, 0,  0, 4, '1-4sup, 90ft leap, swallow(50lb)').attack('bite', '+1 d3').attack('tongue', '+5 d1'),
  'Crocodile':      rpgpad.MonsterRecord(3, 0,  0, 4, '1-3sup').attack('bite', '+3 2d4').attack('death roll', '+3 d12'),
  'Crocogator':     rpgpad.MonsterRecord(7, 0,  0, 3, '1-3sup').attack('bite', '+7 3d6').attack('death roll', '+7 2d10'),

  'Ogre':           rpgpad.MonsterRecord(4, 1, 20, 5, '').attack('melee', '+5 d10').attack('rock', '+4 d6'),

  'Zombling':       rpgpad.MonsterRecord(1, 0,  1, 8, 'leap').attack('melee', '+1 d4'),
  'Zombie Turtle':  rpgpad.MonsterRecord(6, 0, 36, 2, 'imm cold/sleep/charm/hold/mental').attack('c/c/b', '+4 d6/+4 d6/+6 2d8'),
  'Ghoul':          rpgpad.MonsterRecord(2, 0,  2, 6, 'para, imm sleep/charm').attack('c/c/b', '+2 d3/+2 d3/+2 d6'),

  'Gobo (sbow)':    rpgpad.MonsterRecord(1,-1,  2, 6, '').attack('melee', '+0 d6').attack('sbow', '+1 d4/+1 d4'),
  'Gobo (dart)':    rpgpad.MonsterRecord(1,-1,  2, 6, '').attack('dart', '+1 d2/+1 d2/+1 d2').attack('melee', '+0 d6'),

  'Bogling (blow)': rpgpad.MonsterRecord(0, 0,  2, 7, 'leap dart poison (+2Para) ').attack('nat', '-1 d4').attack('blowgun', '+0 d2'),
  'Bog Chief':      rpgpad.MonsterRecord(1, 0,  4, 5, '').attack('nat', '1 d4'),

  'Orc (xbow)':     rpgpad.MonsterRecord(1, 0,  2, 6, 'scale').attack('scim', '+1 d8').attack('lt xbow', '+1 d6+1'),
  'Orc (sbow)':     rpgpad.MonsterRecord(1, 0,  2, 6, 'scale').attack('scim', '+1 d8').attack('sbow', '+1 d6/+1 d6'),
  'Orc guard':      rpgpad.MonsterRecord(2, 0, 11, 4, 'banded').attack('pole', '+2 d10').attack('lt xbow', '+2 d6+1'),
  'Orc captian':    rpgpad.MonsterRecord(2, 0, 15, 4, 'mail/sh').attack('scim', '+2 d8+1').attack('sbow', '+2 d6/+2 d6'),
  'Orc chief':      rpgpad.MonsterRecord(3, 0, 18, 3, 'plate').attack('baxe', '+3 3d4+1'),

  'Gnoll (lbow)':   rpgpad.MonsterRecord(2, 0,  4, 5, 'scale').attack('zwei', '+2 2d4').attack('lbow', '+2 d6/+2 d6'),
  'Gnoll guard':    rpgpad.MonsterRecord(3, 0, 16, 4, 'mail').attack('pole', '+3 d10').attack('lbow', '+3 d6/+3 d6'),
  'Gnoll leader':   rpgpad.MonsterRecord(3, 0, 20, 5, 'scale').attack('zwei', '+3 2d4').attack('lbow', '+4 d8/+4 d8'),
  'Gnoll chief':    rpgpad.MonsterRecord(4, 0, 24, 3, 'mail').attack('baxe',  '+4 3d4+2'),
  'Gnoll fm':       rpgpad.MonsterRecord(1, 0,  2, 7, '').attack('melee', '+1 d4'),
  'Large Spider':   rpgpad.MonsterRecord(2, 2,  0, 6, '30ft jump, +3poison').attack('bite', '+3 d6'),
  'Huge Spider':    rpgpad.MonsterRecord(1, 1,  0, 6, '+2poison').attack('bite', '+2 d4'),
  'Giant Spider':   rpgpad.MonsterRecord(4, 4,  0, 4, 'web, poison').attack('bite', '+5 d8'),

  'Bugbear (xbow)': rpgpad.MonsterRecord(3, 1,  3, 5, '1-3sup, lamellar').attack('melee', '+4 2d8').attack('hvy', '+4 d12'),
  'Bugbear leader': rpgpad.MonsterRecord(4, 1, 20, 4, '1-3sup, lamellar').attack('melee', '+5 2d8+1').attack('hvy', '+4 d12'),
  'Bugbear chief':  rpgpad.MonsterRecord(4, 1, 32, 3, '1-3sup, plate').attack('melee', '+4 2d8+2'),
  'Bugbear fm':     rpgpad.MonsterRecord(1, 1,  3, 5, '1-3sup').attack('melee', '+2 d8'),
  'Bugbear young':  rpgpad.MonsterRecord(0, 0,  2, 7, '1-3sup').attack('melee', '-1 d4'),

  'Troglodyte':     rpgpad.MonsterRecord(2, 0,  4, 5, 'odor, chameleon').attack('bite', '+2 d4+1/+2 d3/+2 d3').attack('club', '+2 d6'),
  'Trog guard':     rpgpad.MonsterRecord(3, 0, 12, 5, 'odor, chameleon').attack('club', '+3 d6+1'),
  'Trog leader':    rpgpad.MonsterRecord(4, 0, 24, 5, 'odor, chameleon').attack('axe', '+4 d8+1'),
  'Trog chief':     rpgpad.MonsterRecord(6, 0, 36, 5, 'odor, chameleon').attack('axe', '+6 d8+2'),
  'Trog fm':        rpgpad.MonsterRecord(1, 1,  2, 5, 'odor, chameleon').attack('bite', '+2 d4+1/+2 d3/+2 d3'),
  'Trog young':     rpgpad.MonsterRecord(0, 0,  2, 7, 'chameleon').attack('bite', '-1 d4'),
  };

rpgpad.monstermanual_reset_counts = function() {
  for (var m in rpgpad.monstermanual) {
    rpgpad.monstermanual[m]['count'] = 0;
    }
  };
rpgpad.monstermanual_SelectBox = function() {
  var list = new Array();
  for (var m in rpgpad.monstermanual) {
    list.push( {text: m, value: m} );
    }
  return list;
  };


rpgpad.randint = function(start, end) {
  return start + Math.floor(Math.random()*(end+1));
  }

// roll some x sided dice
rpgpad.dice = function(count, sides) {
  var roll, total = 0;
  for (i=count; i>0; i--) {
    roll = 1 + Math.floor(Math.random()*sides);
    total += roll
    rpgpad.console.log('d' + sides + ': ' + roll);
    }
  return total
  }

// parse and roll 2d6+2 type string
rpgpad.roll = function(roll) {
  var more, die, mod, total, stuff, count;
  stuff = roll.split('d');
  if (!stuff[0]) { count = 1 }
  else { count = parseInt(stuff[0]) }
  if (stuff[1].contains('+')) {
    more = stuff[1].split('+');
    die = parseInt(more[0]);
    mod = parseInt(more[1]);
    }
  else if (stuff[1].contains('-')) {
    more = stuff[1].split('-');
    die = parseInt(more[0]);
    mod = -parseInt(more[1]);
    }
  else {
    die = parseInt(stuff[1]);
    mod = 0;
    }
  total = rpgpad.dice(count, die) + mod;
  rpgpad.console.log('Dice Roll: ' + roll + ' = ' + total);
  return total
  }

// class hitpoints
rpgpad.dhp = function(hd, hitdie, conbonus, min) {
  var dice = Math.max(1, hd);
  var roll = rpgpad.dice(dice, hitdie) + (dice*conbonus);
  return Math.max(min, roll);
  }
// monster hitpoints
rpgpad.dmhp = function(HD, bonus, min) {
  var roll;
  if (HD == 0) { // 0HD assumed d4 hp
    roll = rpgpad.dice(1, 4) + bonus
    }
  else if (HD == 1) { // 3-8 hitpoints for monsters
    roll = rpgpad.dice(HD, 6) + (HD*2) + bonus;
    }
  else { // and max 1HD if > 2HD
    HD -= 1;
    roll = 8 + rpgpad.dice(HD, 6) + (HD*2) + bonus;
    }
  return Math.max(min, roll);
  }

rpgpad.battle_count = 0;

rpgpad.ridiculous_select =
          { xtype: 'selectfield',
            width: 80,
            options: [
              {text:  '1', value: 1},
              {text:  '2', value: 2},
              {text:  '3', value: 3},
              {text:  '4', value: 4},
              {text:  '5', value: 5},
              {text:  '6', value: 6},
              {text:  '7', value: 7},
              {text:  '8', value: 8},
              {text:  '9', value: 9},
              {text: '10', value: 10},
              {text: '11', value: 11},
              {text: '12', value: 12},
              {text: '13', value: 13},
              {text: '14', value: 14},
              {text: '15', value: 15},
              {text: '16', value: 16},
              {text: '17', value: 17},
              {text: '18', value: 18},
              {text: '19', value: 19},
              {text: '20', value: 20},
              {text: '21', value: 21},
              {text: '22', value: 22},
              {text: '23', value: 23},
              {text: '24', value: 24},
              {text: '25', value: 25},
              {text: '26', value: 26},
              {text: '27', value: 27},
              {text: '28', value: 28},
              {text: '29', value: 29},
              {text: '30', value: 30},
              {text: '31', value: 31},
              {text: '32', value: 32},
              {text: '33', value: 33},
              {text: '34', value: 34},
              {text: '35', value: 35},
              {text: '36', value: 36},
              {text: '37', value: 37},
              {text: '38', value: 38},
              {text: '39', value: 39},
              {text: '40', value: 40},
              {text: '41', value: 41},
              {text: '42', value: 42},
              {text: '43', value: 43},
              {text: '44', value: 44},
              {text: '45', value: 45},
              {text: '46', value: 46},
              {text: '47', value: 47},
              {text: '48', value: 48},
              {text: '49', value: 49},
              {text: '50', value: 50},
              {text: '51', value: 51},
              {text: '52', value: 52},
              {text: '53', value: 53},
              {text: '54', value: 54},
              {text: '55', value: 55},
              {text: '56', value: 56},
              {text: '57', value: 57},
              {text: '58', value: 58},
              {text: '59', value: 59},
              {text: '60', value: 60},
            ]
          };


rpgpad.new_battle = function() {
  function CharacterList() {
    var mything = new Ext.Container({
      itemId: 'b_characters',
      cls: 'pc_list',
      layout: { type: 'hbox', pack: 'start', align: 'center' },
      items: [ { xtype: 'component', flex:1 }, ],
      // Attributes
      _title: 'Battle' + rpgpad.battle_count,
      _monster_count: 0,
      _characters: [],
      // Methods
      update_text: function() {
        var txt = this._title + ' (' + this._monster_count + '):';
        Ext.each(this._characters, function(c) { txt += ' ' + c.model.data.name; });
        this.getComponent(0).update(txt);
        this.getComponent(0).doComponentLayout();
        },
      monster_count: function(count) {
        this._monster_count = count;
        this.update_text();
        return this._monster_count;
        },
      add_character: function(character) {
        if (this._characters.indexOf(character) == -1 ) { this._characters.push(character) };
        this.update_text();
        },
      remove_character: function(character) {
        if (this._characters.indexOf(character) != -1 ) { this._characters.remove(character) };
        this.update_text();
        },
      get_characters: function() {
        return this._characters;
        },
      });
    mything.update_text();
    return mything;
    };

  function MonsterList() {
    return new Ext.Container({
      title: 'monsters'+rpgpad.battle_count,
      itemId: 'b_monsters',
      cls: 'monster_list',
      layout: { type: 'vbox', align: 'stretch' },
      })
    };

  function Monster(name) {
    function mynameis() { return '#' + mm.count + ' ' + name; };
    var mm = rpgpad.monstermanual[name];
    mm.count += 1;
    mm.name = name;
    var hitpoints = mm.calc_hp();
    var monster = new Ext.Toolbar({
      name: mynameis(),
      mm: mm,
      xp: mm.calc_xp(hitpoints),
      spells: mm.calc_spells(),
      loot: mm.calc_loot(),
      cls: 'monster',
      height: 60,
      layout: { type: 'hbox', pack: 'justify', align : 'center' },
      defaults: {ui:'small', centered:true, },
      items: [
        { text: mynameis(), badgeText: mm.hitdice, width:120, padding: '10 0 10 0', handler: function(button, e) {
          monster.toggle();
          },
        },
        { itemId:'m_attack', width:120, padding:10, handler: function(button, e) {
          monster.do_attack();
          },
        },
        { xtype:'spacer' },
        { text: 'Action', itemId:'m_action', padding:10, handler: function(button, e) {
          action_overlay.funkyMcFunkStein([monster]);
          },
        },
        { xtype:'component', html:'AC '+ mm.ac, cls:'m_ac', margin:5 },
        { iconMask: true, iconCls: 'add', ui:'plain', padding:'17 5 0 15', centered:true, handler: function(button, e) {
          monster.hitpoints(1);
          },
        },
        { xtype:'textfield', itemId:'hitpoints', width:30, padding:0, centered:true, value:hitpoints, },
        { iconMask: true, iconCls: 'minus', ui:'plain', padding:'17 15 0 5', handler: function(button, e) {
          monster.hitpoints(-1);
          },
        },
        { xtype:'spacer' },
        { xtype:'textfield', name:'special', value: mm.special },
        ]
      });
    monster.toggle = function(on) {
      if (on == true) { monster.selected = false }
      if (on == false) { monster.selected = true }
      if (monster.selected) {
        monster.removeCls('selected');
        monster.selected = false;
        }
      else {
        monster.addCls('selected');
        monster.selected = true;
        }
      };
    monster.hitpoints = function(delta) {
      var hitpoints = monster.getComponent('hitpoints');
      var value = parseInt(hitpoints.getValue());
      hitpoints.setValue(value + delta);
      if (hitpoints.getValue() < 0) { monster.dead(false) };
      return hitpoints.getValue();
      };
    monster.dead = function(captured) {
      if (captured == true) { rpgpad.KillTab.record_capture(monster); }
      else { rpgpad.KillTab.record_death(monster) }
      if (monster.treasure) { rpgpad.LootTab.record(monster) }
      battle.del_monster(monster);
      monster.destroy();
      };
    monster.incapacitate = function(rounds) {
      monster.incapacitated = true;
      monster.addCls('incapacitated');
      monster.getComponent('m_attack').setDisabled(true);
      monster.toggle(false);
      rpgpad.console.log(monster.name + ' incapacitated for ' + rounds + 'rnds.');
      };
    monster.revive = function() {
      if (monster.incapacitated == true) { rpgpad.console.log(monster.name + ' revived.'); }
      monster.incapacitated = false;
      monster.removeCls('incapacitated');
      monster.getComponent('m_attack').setDisabled(false);
      };
    monster.do_save = function() {
      var roll = rpgpad.dice(1, 20);
      return {roll: roll, aimed: roll-mm.saves[0], bw: roll-mm.saves[1], dpp: roll-mm.saves[2], pp: roll-mm.saves[3], spell: roll-mm.saves[4]};
      };
    monster.switch_attack = function(attack) {
      this.attack = attack;
      var bob = monster.getComponent('m_attack');
      bob.setText(attack['text']);
      bob.setBadge(attack['type']);
      bob.doComponentLayout();
      };
    monster.roll_attack = function(attack) {
      if (this.incapacitated == true) {
        return { roll:0, hitac:'incapacitated', attack:0, damage:0 };
        }
      var roll = rpgpad.dice(1, 20);
      return {
        roll: roll,
        hitac: 20 - (roll + attack.tohit),
        attack: roll + attack.tohit,
        damage: rpgpad.roll(attack.damage),
        }
      };
    monster.do_attack = function() {
      var html, msg;
      html = '<div align="center"><h3>'+monster.name+'</h3>' + 'HD: ' + mm.HD + ' "' + monster.attack['text'] + '"<br /><br /></div>';
      Ext.each(monster.attack['attacks'], function(attack) {
        var r = monster.roll_attack(attack);
        if (r.hitac == 'incapacitated') {
          msg = '(-) Incapacitated!'
          }
        else if (r.hitac <= 10) {
          msg = 'Hit (AC' + r.hitac + ') <span style="color:red">' + r.damage + '</span> damage';
          }
        else {
          msg = 'Missed (AC' + r.hitac + ')(' + r.damage + 'hits)';
          }
        if (r.roll == 20) {
          msg += ' <span style="color:green"><b>Natural 20!</b></span>';
          }
        if (r.roll == 1) {
          msg += ' <span style="color:green"><b>Natural 1!</b></span>';
          }
        rpgpad.console.log('"' + monster.name + '" Attack: ' + msg);
        html += '<h3>' + msg + '</h3></div>'
        });
      attack_overlay.my_show(html, monster);
      };
    monster.switch_attack(mm.attacks[0]);
    return monster;
    };

  var battle, characters, monsters, selector, action_overlay, spell_overlay, attack_overlay;

  action_overlay = new Ext.Panel({
    modal: true,
    floating: true,
    centered: true,
    cls: 'action_overlay',
    width: 400,
    layout: { type: 'vbox', align: 'stretch' },
    defaults: {xtype:'button', margin:6, cls: 'bigbutton', centered:true, flex:1 },
    items: [
      { xtype: 'component', styleHtmlContent: true, },
      { text: 'To Dead Pile', ui:'decline', handler: function(button, e) { Ext.each(action_overlay._monsters, function(m) { m.dead(false) }); action_overlay.hide(); }, },
      { text: 'To Captured', ui:'decline', handler: function(button, e) { Ext.each(action_overlay._monsters, function(m) { m.dead(true) }); action_overlay.hide(); }, },
      { text: 'Remove', ui: 'decline', margin:10, handler: function(button, e) {
        Ext.each(action_overlay._monsters, function(m) { battle.del_monster(m) });
        battle.doComponentLayout();
        action_overlay.hide();
        },
      },
      { text: 'Revive', margin: '10 3 3 3', handler: function(button, e) { Ext.each(action_overlay._monsters, function(m) { m.revive() }); action_overlay.hide(); }, },
      { text: 'Incapacitate', margin: '3 3 10 3', handler: function(button, e) { Ext.each(action_overlay._monsters, function(m) { m.incapacitate() }); action_overlay.hide(); }, },
      { text: 'Aimed Save', ui:'confirm', handler: function(button, e) { action_overlay.show_save('Rod/Wand/Staff', 'aimed') } },
      { text: 'Breath Save', ui:'confirm', handler: function(button, e) { action_overlay.show_save('Breath Weapon', 'bw') } },
      { text: 'Death/Para/Poison', ui:'confirm', handler: function(button, e) { action_overlay.show_save('Death/Paralysis/Poison', 'dpp') } },
      { text: 'Petri/Poly Save', ui:'confirm', handler: function(button, e) { action_overlay.show_save('Petrification/Polymorph', 'pp') } },
      { text: 'Spell Save', ui:'confirm', handler: function(button, e) { action_overlay.show_save('Spell', 'spell') } },
      { text: 'Spells', itemId:'a_spells', margin: '10 3 3 3', handler: function(button, e) {
        action_overlay.hide();
        spell_overlay.my_show(action_overlay._monsters[0]);
        },
      },
      ],
    });
  action_overlay.funkyMcFunkStein = function(monsters) {
    this._monsters = monsters;
    if (this._monsters.length > 0) {
      var header = this.items.getAt(0);
      var html = this._monsters.length + ': ';
      Ext.each(this._monsters, function(m) { html += m.name + ', ' });
      header.update(html);
      header.doComponentLayout();
      this.getComponent('a_spells').setDisabled(this._monsters.length != 1 || this._monsters[0].spells.length == 0);
      this.doLayout();
      this.show();
      }
    }
  action_overlay.show_save = function(name, save) {
    var saves, roll, val, msg;
    var saved = [], failed = [];
    var html = '<h2>Save vs ' + name + '</h2>';
    Ext.each(this._monsters, function(m) {
      saves = m.do_save();
      roll = saves['roll'];
      val = saves[save];
      html += m.name + ' roll: ' + roll;
      if (val >= 0) {
        saved.push(m);
        m.toggle();
        msg = ' <b>Saved</b> by ' + val + '!';
        }
      else {
        failed.push(m);
        msg = ' <b>Failed</b> by ' + Math.abs(val) + '.';
        }
      rpgpad.console.log('"' + m.name + '" Save vs ' + name + ': (' + roll + ')' + msg);
      html += msg + '<br />';
      });
    this.hide();
    saves_overlay.my_show(html, saved, failed)
    }

  spell_overlay = new Ext.Panel({
    modal: true,
    floating: true,
    centered: true,
    cls: 'action_overlay',
    width: 400,
    layout: { type: 'vbox', align: 'stretch' },
    defaults: { xtype:'button', margin:6, cls: 'bigbutton', centered:true, flex:1,
      handler: function(button, e) {
        var spell = spell_overlay._monster.spells[button.spelldex];
        rpgpad.console.log('"' + spell_overlay._monster.name + '" casts ' + spell.data.name + ' [' + spell.data.description + '].');
        spell.casted = true;
        spell_overlay.hide();
        },
      },
    items: [
      ],
    my_show: function(monster) {
      this._monster = monster;
      this.removeAll();
      for (var i=0; i < this._monster.spells.length; i++) {
        var spell = this._monster.spells[i];
        spell_overlay.add({text: spell.data.name + ' (' + spell.data.segments + ')', spelldex: i, disabled: spell.casted == true});
        };
      this.show();
      this.doLayout();
      },
    });

  saves_overlay = new Ext.Panel({
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
              Ext.each(saves_overlay._failed, function(m) { m.incapacitate() });
              saves_overlay.hide();
            },
          },
          { xtype:'spacer' },
          { xtype:'numberfield', itemId:'damage', cls:'bigtext', value:'0', width:60, },
          { text: 'Damage', handler: function(button, e) {
              var damage = parseInt(button.previousSibling().getValue());
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

  attack_overlay = new Ext.Panel({
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
    my_show: function(html, monster) {
      function add_option(who, what, attack) {
        return {
          text: what + ' ' + attack['text'], handler: function(button, e) {
            attack_overlay.hide();
            monster.switch_attack(attack);
            monster.do_attack();
            },
          };
        };
      var bob = this.getDockedItems()[0];
      bob.removeAll(true);
      Ext.each(monster.mm.attacks, function(option) {
        if (option != monster.attack) {
          bob.add(add_option(monster, option['type'], option));
          }
        });
      bob.doLayout();
      this.update(html);
      this.show();
      this.doComponentLayout();
      },
    });

  multi_attack_overlay = new Ext.Panel({
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

  rpgpad.battle_count += 1
  battle = new Ext.Panel({
    title: 'Battle_' + rpgpad.battle_count,
    cls: 'battle',
    layout: { type: 'vbox', align: 'stretch' },
    items: [ CharacterList(), MonsterList() ],
    dockedItems: [
      new Ext.Toolbar({
        dock : 'top',
        height: 54,
        layout: { type: 'hbox', align: 'stretch', pack: 'justify' },
        defaults: { margin: 6, },
        items: [
          { text: 'New', ui: 'confirm', handler: function(button, e) {
            rpgpad.Combat.add(rpgpad.new_battle());
            rpgpad.Combat.doLayout();
            rpgpad.console.log('<b>' + battle.title + ' started.</b>');
            },
          },
          { text: 'End', ui: 'decline', handler: function(button, e) {
            if (rpgpad.Combat.items.getCount() == 1 && battle.getComponent('b_monsters').items.getCount() == 0) {
              return;
              }
            battle.removeAll();
            rpgpad.Combat.remove(battle);
            rpgpad.Combat.doLayout();
            if (rpgpad.Combat.items.getCount() == 0) {
              rpgpad.Combat.add(rpgpad.new_battle());
              rpgpad.Combat.doLayout();
              }
            rpgpad.monstermanual_reset_counts();
            rpgpad.console.log('<b>' + battle.title + ' ended.</b>');
            },
          },
          { xtype:'spacer' },

          new Ext.form.Select({
            id: 'select_monster',
            name: 'monster',
            modal: true,
            width: 140,
            centered: true,
            options: rpgpad.monstermanual_SelectBox(),
          }),
          { iconMask: true, ui: 'plain', margin:'5 0 0 0', iconCls: 'add', handler: function(button, e) {
            selector = button.previousSibling();
            battle.add_monster(Monster(selector.getValue()));
            },
          },
          { xtype:'spacer' },

          rpgpad.ridiculous_select,
          { text: 'Random', handler: function(button, e) {
            monsters = battle.getComponent('b_monsters').items;
            var length = monsters.getCount()
            var count = button.previousSibling().getValue();
            battle.clear_selected();
            if (count >= length) {
              monsters.each(function(m) { m.toggle(true) });
              }
            else {
              var pick, these=new Array();
              for (var i=0; i < length; i++) {
                these[i] = monsters.getAt(i);
                }
              for (var i=count; i > 0; i--) {
                pick = rpgpad.randint(0, these.length-1);
                these[pick].toggle();
                these.remove(these[pick]);
                }
              }
            action_overlay.funkyMcFunkStein(battle.get_selected());
            },
          },
          { xtype:'spacer' },

          { text: 'Selected', handler: function(button, e) {
            action_overlay.funkyMcFunkStein(battle.get_selected());
            },
          },
          { xtype:'spacer' },
          { text: 'Attack', handler: function(button, e) {
            // evenly distribute attacks
            function fill_pool() {
              cpool = [];
              Ext.each(characters, function(c) { cpool.push(c); });
              }
            function pick_character() {
              if (cpool.length == 0) { fill_pool() };
              var c = cpool[rpgpad.randint(0, cpool.length-1)];
              cpool.remove(c);
              return c
              }
            var html, monsters, characters, cpool=[];
            monsters = battle.get_active();
            characters = battle.get_characters();
            html = '<h2>' + battle.title + '</h2>';
            if (monsters.length == 0)  {
              html += 'Add some bad guys to battle.';
              }
            else if (characters.length == 0)  {
              html += 'Add some characters to battle.';
              }
            else {
              Ext.each(monsters, function(m) {
                html += battle.one_foo(m, pick_character());
                });
              }
            multi_attack_overlay.my_show(html);
            },
          },
          ]
        }),
      ],
    // Battle Methods
    one_foo: function(monster, character) {
      var html = '', msg;
      Ext.each(monster.attack['attacks'], function(attack) {
        var r = monster.roll_attack(attack);
        html += '<h3>' + monster.name + ': ';
        if (r.hitac == 'incapacitated') {
          msg = '(-) Incapacitated!'
          }
        else if (r.hitac <= character.ac) {
          msg = '<b>Hit</b> (AC' + r.hitac + ') <span style="color:red">' + character.name + ', ' + r.damage + '</span> damage';
          }
        else {
          msg = '<b>Missed</b> (AC' + r.hitac + ')(' + r.damage + 'hits) ' + character.name;
          }
        if (r.roll == 20) {
          msg += ' <span style="color:green"><b>Natural 20!</b></span>';
          }
        if (r.roll == 1) {
          msg += ' <span style="color:green"><b>Natural 1!</b></span>';
          }
        rpgpad.console.log('"' + monster.name + '" Attack: ' + msg);
        html += msg + '</h3>'
        });
      return html;
      },
    add_monster: function(monster) {
      characters = battle.getComponent('b_characters');
      monsters = battle.getComponent('b_monsters');
      monsters.add(monster);
      monsters.doLayout();
      characters.monster_count(monsters.items.length);
      rpgpad.Combat.doLayout();
      rpgpad.console.log('"' + monster.name + '" Added.');
      return monster;
      },
    del_monster: function(monster) {
      monsters = battle.getComponent('b_monsters');
      monsters.remove(monster);
      monsters.doLayout();
      characters.monster_count(monsters.items.length);
      rpgpad.Combat.doLayout();
      rpgpad.console.log('"' + monster.name + '" Removed.');
      return monster;
      },
    random_monster: function(monster) {
      monsters = battle.getComponent('b_monsters').items;
      var count = monsters.getCount()
      if (count > 0) {
        return monsters.getAt(rpgpad.dice(1, count) - 1);
        }
      },
    get_active: function() {
      var monster_list = [];
      monsters = battle.getComponent('b_monsters').items;
      monsters.each(function(m) { if (m.incapacitated != true) { monster_list.push(m)} });
      return monster_list;
      },
    get_selected: function() {
      var monster_list = [];
      monsters = battle.getComponent('b_monsters').items;
      monsters.each(function(m) { if (m.selected) { monster_list.push(m)} });
      return monster_list;
      },
    clear_selected: function() {
      monsters = battle.getComponent('b_monsters').items;
      monsters.each(function(m) { m.toggle(false) });
      },
    add_character: function(pc) {
      this.getComponent('b_characters').add_character(pc);
      },
    remove_character: function(pc) {
      this.getComponent('b_characters').remove_character(pc);
      },
    get_characters: function(pc) {
      return this.getComponent('b_characters').get_characters();
      },
    });
  return battle;
  };

rpgpad.Combat = new Ext.Container({
  cls: 'combat',
  height: '100%',
  scroll: 'vertical',
  flex: 5,
  layout: { type: 'vbox', align: 'stretch' },
  items: [rpgpad.new_battle()],
  // methods
  get_battles: function() {
    return this.items.items;
    },
  remove_character: function(pc) {
    // from all battles
    Ext.each(this.get_battles(), function(b) {
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
        this.setBadge(this.model.data.hits);
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
      Ext.each(rpgpad.Combat.get_battles(), function(b) {
        dock.add( { text: 'To '+b.title, handler: function(button, e) {
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
    { xtype: 'list', itemTpl:'{count} {name}, {xp} xp', store: null,
      disableSelection: true, loadingText: 'Loading...',
      scroll: 'vertical',
    },
    ],
  launch: function() {
    this.xp = this.items.getAt(0).items.getAt(1);
    this.pile = this.items.getAt(1);
    this.pile.tpl = '<tpl for="."><div class="x-list-item-body">{count} {name}, {xp} xp</div></tpl>';
    this.pile_store.load();
    rpgpad.KillTab.pile.bindStore(rpgpad.KillTab.pile_store);
    },
  empty: function() {
    this.pile_store.proxy.clear();
    this.pile_store.load();
    },
  record_death: function(monster) {
    rpgpad.console.log('"' + monster.name + '" Defeated for <b>' + monster.xp+ 'xp</b>.');
    this._upsert(monster.mm.name, monster.xp);
    },
  record_capture: function(monster) {
    var xp = 2 * monster.xp;
    rpgpad.console.log('"' + monster.name + '" Captured for <b>' + xp + 'xp</b>.');
    this._upsert('(c)' + monster.mm.name, xp);
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
  record: function(monster) {
    var msg;
    var msg = this.copper + 'cp ' + this.silver + 'sp ' + this.gold + 'gp ' + this.plat + 'pp';
    this.copper += monster.treasure.copper;
    this.silver += monster.treasure.silver;
    this.gold += monster.treasure.gold;
    this.plat += monster.treasure.plat;
    this.getComponent('lt_coins').update('<h4>' + msg + '</h4>');
    rpgpad.console.log('"' + monster.name + '" ' + msg);
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

