/* vim: set expandtab tabstop=2 shiftwidth=2: */
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


rpgpad.randint = function(start, end) {
  return start + Math.floor(Math.random()*(end+1));
  }

rpgpad.dice = function(count, sides) {
  // roll count x sided dice.
  var roll, total = 0;
  for (var i=count; i>0; i--) {
    roll = 1 + Math.floor(Math.random()*sides);
    total += roll
    rpgpad.console.log('d' + sides + ': ' + roll);
    }
  return total
  }

rpgpad.roll = function(roll) {
  // parse and roll "2d6+2" formated strings.
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


rpgpad.SpellBook = function() {
  function SpellRecord(lvl, segments, name, description) {
    // Create Spell Record
    return {
      lvl: lvl,
      name: name,
      segments: segments,
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
      // return instance of memorized spell
      foo = Object.spawn(this.spells[spell]);
      foo.casted = false;
      return foo;
      },
    spells: {               // lvl, segments, name, notes
      command:      SpellRecord(1,  1, 'Command', ''),
      curelt:       SpellRecord(1,  5, 'Cure Light', 'd8'),
      curse:        SpellRecord(1, 10, 'Curse', '-1 tohit'),
      sanctuary:    SpellRecord(1,  4, 'Sanctuary', 'save vs SpellRecord to attack'),
      protgood:     SpellRecord(1,  4, 'Prot vs Good', ''),
      holdperson:   SpellRecord(1,  5, 'Hold Person', ''),
      silence15:    SpellRecord(1,  5, 'Silence 15r', ''),
      augurary:     SpellRecord(1,100, 'Augurary', ''),
      locateobject: SpellRecord(1,100, 'Locate Object', ''),
      contdark:     SpellRecord(1,  6, 'Continual Darkness', ''),
      resistfire:   SpellRecord(1,  6, 'Resist Fire', '+3, half damage'),
      causeblind:   SpellRecord(1,  6, 'Cause Blindness', ''),
      prayer:       SpellRecord(1,  6, 'Prayer', '+1/-1 all rolls'),
      },
    }
  }();



rpgpad.MonsterManual = function() {
  var Mob = {
    // Base Record class, "mob" is something players fight.
    // "Record" being constructor function that create "smart" data records.
    calc_loot: function() { return [] },
    calc_spells: function() { return [] },
    // TODO: this is one attack routine, need method to define multiple attacks (which can hit multiple targets)
    parse_attack_routine: function(type, text) {
      // given ('lbow', '+3 d6/+3 d6') return list of {tohit, damage}
      var bits, attacks = [];
      Ext.each(text.split('/'), function(attack) {
        bits = attack.split(' ');
        attacks.push({type: type, text:attack, tohit:parseInt(bits[0]), damage:bits[1]});
        });
      return {type: type, text: text, attacks: attacks};
      },
    // following are meant to be chained record.Mob(blah).attack(blah).attack(blah).spelllist(foo,bar)
    attack: function(type, attacks) {
      // adds attack option to mob type
      this.attacks.push(this.parse_attack_routine(type, attacks));
      return this;
      },
    spelllist: function() {
      // adds specific spell list to mob type
      var spells = Array.prototype.slice.call(arguments); // variable arguments
      this.calc_spells = function() {
        var list = [];
        Ext.each(spells, function(spell) { list.push(rpgpad.SpellBook.memorize(spell)) });
        return list;
        };
      return this;
      },
    treasure: function() {
      // adds specific treasure to mob type
      var loots = Array.prototype.slice.call(arguments); // variable arguments
      this.calc_loot = function() {
        var list = [];
        // TODO:
        return list;
        };
      return this;
      },
    };

  var Monster = Object.spawn(Mob, {
    calc_xp: function(hp) {
      return rpgpad.xp_table[this.HD][0] + (hp * rpgpad.xp_table[this.HD][1]);
      },
    });

  function MonsterRecord(type, HD, hpbonus, hpmin, ac, special) {
    // Record constructor helper for "Monsters".
    mob = Object.create(Monster);
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
    mob.special = special;
    mob.attacks = [];
    mob.calc_hp = function() {
                      // d6+2 aka 3-8 hitpoints for monsters
      function hp(hd) {rpgpad.dice(hd, 6) + (hd*2) + hpbonus};
      var roll;
      if (HD > 1) { // max(8) first HD
        roll = 8 + hp(HD-1);
      } else if (HD == 1) {
        roll = hp(1);
      } else { // 0HD assumed d4 hp
        roll = rpgpad.dice(1, 4) + hpbonus
        }
      return Math.max(hpmin, roll)
      };
    return mob;
    };
  function BadGuyRecord(type, lvl, hitdie, conbonus, hpmin, ac, xp, special, klass, saves) {
    // Record creation helper for human/demihuman mobs
    if (klass == undefined) { klass='ftr'; saves = rpgpad.saves.ftr };
    poop = Object.spawn(Mob, {
      count: 0,
      type: type,
      hitdice: lvl + klass,
      ac: ac,
      HD: lvl,
      saves: saves[lvl],
      special: special,
      attacks: [],
      calc_hp: function() {
        var dice = Math.max(1, lvl);
        var roll = rpgpad.dice(dice, hitdie) + (dice*conbonus);
        return Math.max(hpmin, roll);
        },
      calc_xp: function(hp) { return xp || rpgpad.xp_table[lvl][0] + (hp * rpgpad.xp_table[lvl][1]); },
      });
    return Object.spawn(poop);
    };

  return {
    selectbox_list: function() {
      // create array for selectbox
      var list = new Array();
      Ext.each(this.data, function(m) {
        list.push( {text: m.type, value: m} );
        });
      return list;
      },
    reset_counts: function() {
      // monsters have seq #1 foo, #2 foo. reset that.
      Ext.each(this.data, function(m) {
        m.count = 0;
        });
        },
    data: [                // type, lvl, hitdie, hdbonus, hpmin, ac, xp, special, saves
      BadGuyRecord('Guard (xbow)', 0, 4, 3,  1, 5, 0, 'scale/sh').attack('lt xbow', '+0 d6+1').attack('lng sw', '+0 d8'),
      BadGuyRecord('Guard (spear)', 0, 4, 3,  1, 5, 0, 'scale/sh').attack('spear', '+0 d6'),
      BadGuyRecord('Guard (pole)', 0, 4, 3,  1, 5, 0, 'mail').attack('pole', '+0 d10'),
      BadGuyRecord('Sgt (xbow)', 2,10, 0, 15, 4, 0, 'p unholy, mail/sh').attack('mstar', '+1 2d4').attack('lt xbow', '+1 d6+1'),
      BadGuyRecord('Lt (lbow)', 4,10, 3, 31, 1, 0, 'p heal, plate/sh/-1').attack('lbow', '+3 d6/+3 d6').attack('haxe', '+3 d6+1'),
      BadGuyRecord('Lareth', 5, 8, 1, 39,-2, 0, 'x2-3staff, im para, +1plate/-4, 18 17 18 18 15 18').attack('staff/mace', '+6 d6+5/+1 d4+2').spelllist('curelt', 'curelt', 'command', 'protgood', 'sanctuary', 'holdperson', 'holdperson', 'silence15', 'silence15', 'resistfire', 'prayer', 'contdark'),
      BadGuyRecord('Alcolyte', 1, 8, 0,  4, 4, 0, 'p unholy, banded').attack('mace', '+1 d6+2').spelllist('curelt', 'bless', 'curse', 'command'),
      BadGuyRecord('Apprentice', 2, 8, 1, 10, 1, 0, 'p climb, pain mace, banded/-3, 16 17 18 17 15 14').attack('mace', '+1 d6+2').spelllist('curelt', 'command', 'curse', 'sanctuary'),

                        // type, HD, hpbonus, hpmin, ac, special
      MonsterRecord('War Dog', 2, 2, 10, 4, 'barding').attack('bite', '+3 2d4'),
      MonsterRecord('Skeleton', 1, 0,  1, 7, 'imm cold/sleep/charm/hold/mental').attack('melee', '+1 d6'),
      MonsterRecord('Zombie', 2, 0,  1, 8, 'imm cold/sleep/charm/hold/mental').attack('melee', '+2 d8'),
      MonsterRecord('Zombie Xvart', 3, 0,  8, 8, 'electrical, imm cold/sleep/charm/hold/mental').attack('melee', '+3 d8'),

      MonsterRecord('Wolf', 2, 2,  2, 7, '10').attack('bite', '+3 d4+1'),
      MonsterRecord('Lilwere', 2, 1, 10, 3, '8 1-3sup, silv/magic').attack('bite', '+3 d4'),
      MonsterRecord('Werewolf', 4, 3, 20, 5, '8 1-3sup, silv/magic').attack('bite', '+5 2d4'),

      MonsterRecord('Giant Rat', 0, 0,  0, 7, '5%disease').attack('bite', '-1 d3'),
      MonsterRecord('Giant Tick', 3, 0,  0, 3, 'blood drain').attack('bite', '+3 d4'),
      MonsterRecord('Giant Snake', 4, 2,  0, 5, 'poison').attack('bite', '+5 d3'),
      MonsterRecord('Giant Lizard', 3, 1,  0, 5, 'x2 on 20').attack('bite', '+4 d8'),
      MonsterRecord('Giant Frog 6ft', 3, 0,  0, 7, '1-4sup, 30ft leap, swallow(250lb)').attack('tongue', '+7 d1').attack('bite', '+3 2d4'),
      MonsterRecord('Giant Frog 4ft', 2, 0,  0, 7, '1-4sup, 60ft leap, swallow(150lb)').attack('tongue', '+6 d1').attack('bite', '+2 d6'),
      MonsterRecord('Giant Frog 2ft', 1, 0,  0, 4, '1-4sup, 90ft leap, swallow(50lb)').attack('bite', '+1 d3').attack('tongue', '+5 d1'),
      MonsterRecord('Crocodile', 3, 0,  0, 4, '1-3sup').attack('bite', '+3 2d4').attack('death roll', '+3 d12'),
      MonsterRecord('Crocogator', 7, 0,  0, 3, '1-3sup').attack('bite', '+7 3d6').attack('death roll', '+7 2d10'),

      MonsterRecord('Ogre', 4, 1, 20, 5, '').attack('melee', '+5 d10').attack('rock', '+4 d6'),

      MonsterRecord('Zombling', 1, 0,  1, 8, 'leap').attack('melee', '+1 d4'),
      MonsterRecord('Zombie Turtle', 6, 0, 36, 2, 'imm cold/sleep/charm/hold/mental').attack('c/c/b', '+4 d6/+4 d6/+6 2d8'),
      MonsterRecord('Ghoul', 2, 0,  2, 6, 'para, imm sleep/charm').attack('c/c/b', '+2 d3/+2 d3/+2 d6'),

      MonsterRecord('Gobo (sbow)', 1,-1,  2, 6, '').attack('melee', '+0 d6').attack('sbow', '+1 d4/+1 d4'),
      MonsterRecord('Gobo (dart)', 1,-1,  2, 6, '').attack('dart', '+1 d2/+1 d2/+1 d2').attack('melee', '+0 d6'),

      MonsterRecord('Bogling (blow)', 0, 0,  2, 7, 'leap dart poison (+2Para) ').attack('nat', '-1 d4').attack('blowgun', '+0 d2'),
      MonsterRecord('Bog Chief', 1, 0,  4, 5, '').attack('nat', '1 d4'),

      MonsterRecord('Orc (xbow)', 1, 0,  2, 6, 'scale').attack('scim', '+1 d8').attack('lt xbow', '+1 d6+1'),
      MonsterRecord('Orc (sbow)', 1, 0,  2, 6, 'scale').attack('scim', '+1 d8').attack('sbow', '+1 d6/+1 d6'),
      MonsterRecord('Orc guard', 2, 0, 11, 4, 'banded').attack('pole', '+2 d10').attack('lt xbow', '+2 d6+1'),
      MonsterRecord('Orc captian', 2, 0, 15, 4, 'mail/sh').attack('scim', '+2 d8+1').attack('sbow', '+2 d6/+2 d6'),
      MonsterRecord('Orc chief', 3, 0, 18, 3, 'plate').attack('baxe', '+3 3d4+1'),

      MonsterRecord('Gnoll (lbow)', 2, 0,  4, 5, 'scale').attack('zwei', '+2 2d4').attack('lbow', '+2 d6/+2 d6'),
      MonsterRecord('Gnoll guard', 3, 0, 16, 4, 'mail').attack('pole', '+3 d10').attack('lbow', '+3 d6/+3 d6'),
      MonsterRecord('Gnoll leader', 3, 0, 20, 5, 'scale').attack('zwei', '+3 2d4').attack('lbow', '+4 d8/+4 d8'),
      MonsterRecord('Gnoll chief', 4, 0, 24, 3, 'mail').attack('baxe',  '+4 3d4+2'),
      MonsterRecord('Gnoll fm', 1, 0,  2, 7, '').attack('melee', '+1 d4'),
      MonsterRecord('Large Spider', 2, 2,  0, 6, '30ft jump, +3poison').attack('bite', '+3 d6'),
      MonsterRecord('Huge Spider', 1, 1,  0, 6, '+2poison').attack('bite', '+2 d4'),
      MonsterRecord('Giant Spider', 4, 4,  0, 4, 'web, poison').attack('bite', '+5 d8'),

      MonsterRecord('Bugbear (xbow)', 3, 1,  3, 5, '1-3sup, lamellar').attack('melee', '+4 2d8').attack('hvy', '+4 d12'),
      MonsterRecord('Bugbear leader', 4, 1, 20, 4, '1-3sup, lamellar').attack('melee', '+5 2d8+1').attack('hvy', '+4 d12'),
      MonsterRecord('Bugbear chief', 4, 1, 32, 3, '1-3sup, plate').attack('melee', '+4 2d8+2'),
      MonsterRecord('Bugbear fm', 1, 1,  3, 5, '1-3sup').attack('melee', '+2 d8'),
      MonsterRecord('Bugbear young', 0, 0,  2, 7, '1-3sup').attack('melee', '-1 d4'),

      MonsterRecord('Troglodyte', 2, 0,  4, 5, 'odor, chameleon').attack('bite', '+2 d4+1/+2 d3/+2 d3').attack('club', '+2 d6'),
      MonsterRecord('Trog guard', 3, 0, 12, 5, 'odor, chameleon').attack('club', '+3 d6+1'),
      MonsterRecord('Trog leader', 4, 0, 24, 5, 'odor, chameleon').attack('axe', '+4 d8+1'),
      MonsterRecord('Trog chief', 6, 0, 36, 5, 'odor, chameleon').attack('axe', '+6 d8+2'),
      MonsterRecord('Trog fm', 1, 1,  2, 5, 'odor, chameleon').attack('bite', '+2 d4+1/+2 d3/+2 d3'),
      MonsterRecord('Trog young', 0, 0,  2, 7, 'chameleon').attack('bite', '-1 d4'),
      ],
    }
  }();


rpgpad.melee_count = 0; // Global!

rpgpad.new_melee = function() {
  // A Melee is group of mobs and player characters, grouped cause they attack each other.
  function MeleeHeader() {
    // Melee title and list of participating characters
    var mything = new Ext.Container({
      itemId: 'b_characters',
      cls: 'pc_list',
      layout: { type: 'hbox', pack: 'start', align: 'center' },
      items: [ { xtype: 'component', flex:1 }, ],
      // Attributes
      _title: 'Melee' + rpgpad.melee_count,
      _characters: [],
      // Methods
      update_text: function() {
        var txt = this._title + ':';
        Ext.each(this._characters, function(c) { txt += ' ' + c.model.data.name; });
        this.getComponent(0).update(txt);
        this.getComponent(0).doComponentLayout();
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

  function MobList() {
    return new Ext.Container({
      title: 'monsters'+rpgpad.melee_count,
      itemId: 'b_monsters',
      cls: 'monster_list',
      layout: { type: 'vbox', align: 'stretch' },
      })
    };

  function Monster(mm) {
    // instance of a Mob
    function mynameis() { return '#' + mm.count + ' ' + mm.type; };
    mm.count += 1;
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
          monster.toggle_selection();
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
        { iconMask: true, iconCls: '/minus.png', ui:'plain', padding:'17 15 0 5', handler: function(button, e) {
          monster.hitpoints(-1);
          },
        },
        { xtype:'spacer' },
        { xtype:'textfield', name:'special', value: mm.special },
        ]
      });
    monster.toggle_selection = function(on) {
      if (on == true) { this.selected = false }
      if (on == false) { this.selected = true }
      if (this.selected) {
        this.removeCls('selected');
        this.selected = false;
        }
      else {
        this.addCls('selected');
        this.selected = true;
        }
      };
    monster.hitpoints = function(delta) {
      // modify and return monster's hitpoints
      var control = this.getComponent('hitpoints');
      var hitpoints = parseInt(control.getValue()) + delta;
      control.setValue(hitpoints);
      if (hitpoints < 0) {
        this.dead();
        };
      return hitpoints;
      };
    monster.dead = function() {
      // mark monster as dead
      rpgpad.KillTab.record_death(this.name, this.mm.type, this.xp);
      melee.remove_monster(this);
      return this;
      };
    monster.captured = function() {
      // mark monster as captured
      rpgpad.KillTab.record_capture(this.name, this.mm.type, this.xp);
      melee.remove_monster(this);
      return this;
      };
    monster.incapacitate = function(rounds) {
      // mark monster as incapacitated
      this.incapacitated = true;
      this.addCls('incapacitated');
      this.getComponent('m_attack').setDisabled(true);
      this.toggle_selection(false);
      if (this.incapacitated == true) {
        rpgpad.console.log(this.name + ' incapacitated for ' + rounds + 'rnds.');
        }
      return this;
      };
    monster.revive = function() {
      // mark monster as no longer incapacitated
      this.incapacitated = false;
      this.removeCls('incapacitated');
      this.getComponent('m_attack').setDisabled(false);
      if (this.incapacitated == true) {
        rpgpad.console.log(this.name + ' revived.');
        }
      return this;
      };
    monster.do_attack = function() {
      // one monster's full attacks no target, pops up overlay
      var html, result;
      html = '<div align="center"><h3>' + this.name + '</h3>' + 'HD: ' + mm.HD + ' "' + this.attack['text'] + '"<br /><br /></div>';
      Ext.each(this.attack['attacks'], function(attack) {
        result = this.attack_html(this.roll_attack(attack), {ac:10});
        rpgpad.console.log('"' + this.name + '" Attack: ' + result);
        html += '<h3>' + result + '</h3></div>'
        });
      attack_overlay.my_show(html, this);
      };
    monster.roll_saves = function() {
      // Roll all saves
      var roll = rpgpad.dice(1, 20);
      return {roll: roll, aimed: roll-mm.saves[0], bw: roll-mm.saves[1], dpp: roll-mm.saves[2], pp: roll-mm.saves[3], spell: roll-mm.saves[4]};
      };
    monster.roll_attack = function(attack) {
      // Roll one attack of an attack routine
      if (this.incapacitated == true) {
        return { roll:0, hitac:'incapacitated', attack:0, damage:0 };
        }
      var roll = rpgpad.dice(1, 20);
      return {
        roll: roll,
        hitac: 20 - (roll + attack.tohit),
        attack: roll + attack.tohit,
        damage: rpgpad.roll(attack.damage),
        type: attack.type,
        }
      };
    monster.attack_html = function(r, target) {
      // r is monster.roll_attack result
      if (r.hitac == 'incapacitated') {
        return '(-) Incapacitated!'
      } else {
        var name, html, damage;
        if (target.name == undefined) { name = '' }
        else { name = target.name + ' '; }
        html = '<i>' + r.type +'</i> ';
        damage = name + r.damage + ' hits';
        if (r.roll == 20) {
          return html += '<b>Hit</b>(<span style="color:green"><b>Natural 20!</b></span>) <span style="color:red"> ' + damage + '</span>';
        } else if (r.roll == 1) {
          return html += '<b>Missed</b>(<span style="color:green"><b>Natural 1!</b></span>) ' + damage
        } else if (r.hitac <= target.ac) {
          return html += '<b>Hit</b>(AC' + r.hitac + ') <span style="color:red"> ' + damage + '</span>';
        } else {
          return html += '<b>Missed</b>(AC' + r.hitac + ') ' + damage;
          }
        }
      };
    monster.switch_attack = function(attack) {
      // switch between available attack routines
      this.attack = attack;
      var control = this.getComponent('m_attack');
      control.setText(attack['text']);
      control.setBadge(attack['type']);
      control.doComponentLayout();
      };
    monster.switch_attack(mm.attacks[0]);
    return monster;
    };

  var melee, characters, monsters, selector, action_overlay, spell_overlay, attack_overlay;

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
      { text: 'To Dead Pile', ui:'decline', handler: function(button, e) { Ext.each(action_overlay._monsters, function(m) { m.dead() }); action_overlay.hide(); }, },
      { text: 'To Captured', ui:'decline', handler: function(button, e) { Ext.each(action_overlay._monsters, function(m) { m.captured() }); action_overlay.hide(); }, },
      { text: 'Remove', ui: 'decline', margin:10, handler: function(button, e) {
        Ext.each(action_overlay._monsters, function(m) { melee.remove_monster(m) });
        melee.doComponentLayout();
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
      saves = m.roll_saves();
      roll = saves['roll'];
      val = saves[save];
      html += m.name + ' roll: ' + roll;
      if (val >= 0) {
        saved.push(m);
        m.toggle_selection();
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
        spell.cast(spell_overlay._monster.name);
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
        spell_overlay.add({text: spell.name + ' (' + spell.segments + ')', spelldex: i, disabled: spell.casted == true});
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

  rpgpad.melee_count += 1
  melee = new Ext.Panel({
    title: 'Melee' + rpgpad.melee_count,
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
            rpgpad.Combat.add(rpgpad.new_melee());
            rpgpad.Combat.doLayout();
            rpgpad.console.log('<b>' + melee.title + ' started.</b>');
            },
          },
          { text: 'End', ui: 'decline', handler: function(button, e) {
            if (rpgpad.Combat.items.getCount() == 1 && melee.getComponent('b_monsters').items.getCount() == 0) {
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
            id: 'select_monster',
            name: 'monster',
            modal: true,
            width: 140,
            centered: true,
            options: rpgpad.MonsterManual.selectbox_list(),
          }),
          { iconMask: true, ui: 'plain', margin:'5 0 0 0', iconCls: 'add', handler: function(button, e) {
            selector = button.previousSibling();
            melee.add_monster(Monster(selector.getValue()));
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
            monsters = melee.getComponent('b_monsters').items;
            var length = monsters.getCount()
            var count = button.previousSibling().getValue();
            melee.clear_selected();
            if (count >= length) {
              monsters.each(function(m) { m.toggle_selection(true) });
              }
            else {
              var pick, these=new Array();
              for (var i=0; i < length; i++) {
                these[i] = monsters.getAt(i);
                }
              for (var i=count; i > 0; i--) {
                pick = rpgpad.randint(0, these.length-1);
                these[pick].toggle_selection();
                these.remove(these[pick]);
                }
              }
            action_overlay.funkyMcFunkStein(melee.get_selected());
            },
          },
          { xtype:'spacer' },

          { text: 'Selected', handler: function(button, e) {
            action_overlay.funkyMcFunkStein(melee.get_selected());
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
            monsters = melee.get_active();
            characters = melee.get_characters();
            html = '<h2>' + melee.title + '</h2>';
            if (monsters.length == 0)  {
              html += 'Add some bad guys to melee.';
              }
            else if (characters.length == 0)  {
              html += 'Add some characters to melee.';
              }
            else {
              Ext.each(monsters, function(m) {
                html += melee.resolve_attack_routine(m, pick_character());
                });
              }
            multi_attack_overlay.my_show(html);
            },
          },
          ]
        }),
      ],
    // Melee Container Methods
    resolve_attack_routine: function(monster, character) {
      var html = '', result;
      Ext.each(monster.attack['attacks'], function(attack) {
        result = monster.attack_html(monster.roll_attack(attack), character);
        rpgpad.console.log('"' + monster.name + '" Attack: ' + result);
        html += '<h3>' + monster.name + ': ' + result + '</h3>'
        });
      return html;
      },
    add_monster: function(monster) {
      monsters = melee.getComponent('b_monsters');
      monsters.add(monster);
      monsters.doLayout();
      rpgpad.Combat.doLayout();
      rpgpad.console.log('"' + monster.name + '" Added.');
      return monster;
      },
    remove_monster: function(monster) {
      monsters = melee.getComponent('b_monsters');
      monsters.remove(monster);
      monsters.doLayout();
      rpgpad.Combat.doLayout();
      rpgpad.console.log('"' + monster.name + '" Removed.');
      return monster;
      },
    random_monster: function(monster) {
      monsters = melee.getComponent('b_monsters').items;
      var count = monsters.getCount()
      if (count > 0) {
        return monsters.getAt(rpgpad.dice(1, count) - 1);
        }
      },
    get_active: function() {
      var monster_list = [];
      monsters = melee.getComponent('b_monsters').items;
      monsters.each(function(m) { if (m.incapacitated != true) { monster_list.push(m)} });
      return monster_list;
      },
    get_selected: function() {
      var monster_list = [];
      monsters = melee.getComponent('b_monsters').items;
      monsters.each(function(m) { if (m.selected) { monster_list.push(m)} });
      return monster_list;
      },
    clear_selected: function() {
      monsters = melee.getComponent('b_monsters').items;
      monsters.each(function(m) { m.toggle_selection(false) });
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
      Ext.each(rpgpad.Combat.get_melees(), function(b) {
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

