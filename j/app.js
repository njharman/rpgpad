/* vim: set expandtab tabstop=4 shiftwidth=4: */
// Norman J. Harman Jr. njharman@gmail.com

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
        rpgpad.log(this.name + ' incapacitated for ' + rounds + 'rnds.');
        }
      return this;
      };
    mob.revive = function() {
      // Mark mob as no longer incapacitated.
      this.incapacitated = false;
      this.removeCls('incapacitated');
      this.getComponent('m_attack').setDisabled(false);
      if (this.incapacitated == true) {
        rpgpad.log(this.name + ' revived.');
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
          rpgpad.log('"' + this.name + '" Attack: ' + result);
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
      rpgpad.log('"' + m.name + '" Save vs ' + name + ': (' + roll + ')' + msg);
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
                  rpgpad.log(m.name + ' took <b>' + damage + 'hits</b> from failed save.');
                  m.hitpoints(-damage)
                  });
                Ext.each(saves_overlay._saved, function(m) {
                  rpgpad.log(m.name + ' took <b>' + half + 'hits</b> from passed save.');
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
            rpgpad.log('<b>' + new_melee.title + ' started.</b>');
            rpgpad.Combat.add(new_melee);
            rpgpad.Combat.doLayout();
            },
          },
          { text: 'End', ui: 'decline', handler: function(button, e) {
            if (rpgpad.Combat.items.getCount() == 1 && melee.getComponent('m_mobs').items.getCount() == 0) {
              return;
              }
            rpgpad.log('<b>' + melee.title + ' ended.</b>');
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
            //melee.action_overlay.show_action(melee.get_selected());
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
      rpgpad.log('"' + mob.name + '" Added to ' + this.title);
      mob._melee = this;
      var mobs = this.getComponent('m_mobs');
      mobs.add(mob);
      mobs.doLayout();
      rpgpad.Combat.doLayout();
      return mob;
      },
    remove_mob: function(mob) {
      rpgpad.log('"' + mob.name + '" Removed from ' + this.title);
      var mobs = this.getComponent('m_mobs');
      mobs.remove(mob);
      mobs.doLayout();
      rpgpad.Combat.doLayout();
      return mob;
      },
    move_mob: function(mob, new_home) {
      rpgpad.log('"' + mob.name + '" moved from ' + this.title + ' to ' + new_home.title);
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
        rpgpad.log('"' + mob.name + '" Attack: ' + result);
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


rpgpad.ConsoleTab = new rpgpad.uiparts.ConsoleTab()
rpgpad.log = rpgpad.ConsoleTab.log_callback()
rpgpad.TreasureTab = new rpgpad.uiparts.TreasureTab()
rpgpad.LootTab = new rpgpad.uiparts.LootTab()
rpgpad.KillTab = new rpgpad.uiparts.KillTab()
rpgpad.CombatTab = new rpgpad.uiparts.CombatTab()


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
