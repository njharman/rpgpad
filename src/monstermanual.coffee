# vim: set expandtab tabstop=4 shiftwidth=4:
# Norman J. Harman Jr. njharman@gmail.com

namespace = (target, name, block) ->
    [target, name, block] = [(if typeof exports isnt 'undefined' then exports else window), arguments...] if arguments.length < 3
    top = target
    target = target[item] or= {} for item in name.split '.'
    block target, top

global_saves = {}
# aimed, breath, death/para/poison, petri/poly, spells
global_saves.ftr = [ # lvl
  [18,20,16,17,19]  # 0
  [16,17,14,15,17]  # 1
  [16,17,14,15,17]  # 2
  [15,16,13,14,16]  # 3
  [14,14,12,13,15]  # 4 (non-standard progression
  [13,13,11,12,14]  # 5
  [13,13,11,12,14]  # 6
  [12,12,10,11,13]  # 7
  [11,10, 9,10,12]  # 8 (non-standard progression
  [10, 9, 8, 9,11]  # 9
  [10, 9, 8, 9,11]  # 10
  [ 9, 8, 7, 8,10]  # 11
  [ 8, 6, 6, 7, 9]  # 12 (non-standard progression
  [ 7, 5, 5, 6, 8]  # 13
  [ 7, 5, 5, 6, 8]  # 14
  [ 6, 4, 4, 5, 7]  # 15
  [ 6, 4, 4, 5, 7]  # 16
  ]
global_saves.mon = global_saves.ftr; # ftr also also monster saves
global_saves.pal = [
  [14,15,12,13,15]  # 1
  [14,15,12,13,15]  # 2
  [13,14,11,12,14]  # 3
  [13,14,11,12,14]  # 4
  [11,11, 9,10,12]  # 5
  [11,11, 9,10,12]  # 6
  [10,10, 8, 9,11]  # 7
  [10,10, 8, 9,11]  # 8
  [ 8, 7, 6, 7, 9]  # 9
  [ 8, 7, 6, 7, 9]  # 10
  ]
global_saves.clr = [
  [14,16,10,13,15]  # 1
  [14,16,10,13,15]  # 2
  [14,16,10,13,15]  # 3
  [13,15, 9,12,14]  # 4
  [13,15, 9,12,14]  # 5
  [13,15, 9,12,14]  # 6
  [11,13, 7,10,12]  # 7
  [11,13, 7,10,12]  # 8
  [11,13, 7,10,12]  # 9
  ]
global_saves.drd = global_saves.clr; # clr also also druid saves
global_saves.mu = [
  [11,15,14,13,12]  # 1
  [11,15,14,13,12]  # 2
  [11,15,14,13,12]  # 3
  [11,15,14,13,12]  # 4
  [11,15,14,13,12]  # 5
  [ 9,13,13,11,10]  # 6
  [ 9,13,13,11,10]  # 7
  [ 9,13,13,11,10]  # 8
  [ 9,13,13,11,10]  # 9
  [ 9,13,13,11,10]  # 10
  ]
global_saves.ill = global_saves.mu; # mu also also illusionist saves
global_saves.th = [
  [14,16,13,12,15]  # 1
  [14,16,13,12,15]  # 2
  [14,16,13,12,15]  # 3
  [14,16,13,12,15]  # 4
  [12,15,12,11,13]  # 5
  [12,15,12,11,13]  # 6
  [12,15,12,11,13]  # 7
  [12,15,12,11,13]  # 8
  [19,14,11,10,11]  # 9
  [19,14,11,10,11]  # 10
  [19,14,11,10,11]  # 11
  [19,14,11,10,11]  # 12
  ]



namespace 'rpgpad.MonsterManual', (self) ->
    xp_table = [
        # base, perhitpoint  TODO: ignoring special/exceptional xp bonus
        [   5,  1, ]
        [  10,  1, ]
        [  30,  1, ]
        [  50,  2, ]
        [  75,  3, ]
        [ 110,  4, ]
        [ 160,  5, ]
        [ 225,  8, ]
        [ 350, 10, ]
        [ 600, 12, ]
        [ 700, 13, ]
        [ 900, 14, ]
        [1200, 16, ]
        [1500, 17, ]
        [1810, 18, ]
        [2110, 19, ]
        [2400, 20, ]
        [2700, 23, ]
        [3000, 25, ]
        [3500, 28, ]
        [4000, 30, ]
        [4500, 33, ]
        [5000, 35, ]
        ]
    # Definitions of all mobs in game. "Mob" is something players fight.
    self.selectbox_list = () ->
        # Create array for Mob selectbox.
        ({text: m.type, value: m} for m in mobs)

    self.reset_counts = () ->
        # Mobs have sequence #1 foo, #2 foo. Reset the sequence.
        (m) -> m.count = 0 for m in mobs

    class MobRecord
        # Base Record class,
        # "Record" being constructor function that create "smart" data records.
        constructor: (@type, @HD, @ac, @notes) ->
            @count = 0
            @special_defence = []
            @special_attack = []
            @attack_options = []

        calc_loot: () -> []

        calc_spells: () -> []

        parse_attack_routine: (type, text, melee, ranged) ->
            # ('claws', '+3 d6/+3 d6').    melee if melee attackable, ranged if ranged attackable, can be both.
            attacks = []
            for attack in text.split('/')
                bits = attack.split(' ')
                attacks.push({type: type, text:attack, tohit:parseInt(bits[0]), calc_damage:Dice.parse(bits[1])})
            {type: type, text: text, melee: melee, ranged: ranged, attacks: attacks}

        # The following methods are chainable MobRecord(blah).routine(foo).routine(bar).spelllist(foo,bar)
        routine: (type, attacks, ranged) ->
            # Adds routine(1 target) attack option to mob type.
            @attack_options.push(@parse_attack_routine(type, attacks, true, ranged))
            @

        ranged: (type, attacks, melee) ->
            # Adds ranged(multi targets) attack option to mob type.
            @attack_options.push(@parse_attack_routine(type, attacks, melee, true))
            @

        multi: (multis...) ->
            # Adds melee(multi targets) attack option to mob type.
            type = []
            text = []
            attacks = []
            for stuff in multis
                type.push(stuff[0])
                text.push(stuff[1])
                attacks.push(@parse_attack_routine(stuff[0], stuff[1], true))
            @attack_options.push({type:type.join(', '), text:text.join('/'), multi:true, melee:true, attacks:attacks})
            @

        spelllist: (spells...) ->
            # Adds specific spell list to mob type.
            @calc_spells = () ->
                (rpgpad.SpellBook.memorize(spell) for spell in spells)
            @

        immunitylist: (immunities...) ->
            # Adds immunities to mob type.
            @special_defence.push('imm ' + immunities.join('/'))
            @

        magic_resistance: (amount) ->
            # Adds magic resistance to mob type.
            @special_defence.push(amount + '% mr')
            @test_mr = () ->
                Dice.d100() <= amount
            @

    class MonsterRecord extends MobRecord
        constructor: (type, HD, hpbonus, hpmin, ac, notes) ->
            super type, HD, ac, notes
            @hitdice =
                if HD == 0
                    '1/2HD'
                else if hpbonus != 0
                    HD + '+' + hpbonus + 'HD '
                else
                    HD + 'HD '
            @saves = global_saves.mon[ if HD > 0 && hpbonus > 0 then HD+2 else HD+1 ]
            @calc_xp = (hp) ->
                xp_table[@HD][0] + (hp * xp_table[@HD][1])
            @calc_hp = () ->
                roll_hp = (hd) ->
                    # d6+2 aka 3-8 hitpoints for monsters
                    Dice.roll(hd, 6, (hd*2) + hpbonus)
                if (HD > 1) # max(8) first HD
                    roll = 8 + roll_hp(HD-1)
                else if (HD == 1)
                    roll = roll_hp(1)
                else # 0HD assumed d4 hp
                    roll = Dice.roll(1, 4, hpbonus)
                Math.max(hpmin, roll)

    class BadGuyRecord extends MobRecord
        # Record creation helper for human/demihuman mobs.
        constructor: (type, lvl, hitdie, conbonus, hpmin, ac, xp, notes, klass, saves) ->
            # hitdie is size of die/ll per level.
            super type, lvl, ac, notes
            if klass == undefined
                klass = 'ftr'
                saves = global_saves.ftr
            @saves = saves[lvl]
            @hitdice = lvl + klass
            @calc_hp = () ->
                dice = Math.max(1, lvl)
                roll = Dice.roll(dice, hitdie, dice * conbonus)
                Math.max(hpmin, roll)
            @calc_xp = (hp) ->
                xp or xp_table[lvl][0] + (hp * xp_table[lvl][1])

    mobs = [                           # type, lvl, hitdie, hdbonus, hpmin, ac, xp, notes, saves
        new BadGuyRecord('Bandit (sw/xbow)', 0, 4,3,1, 6, 0, 'ringmail/sh').ranged('lt xbow', '+0 d6+1').routine('cutlass', '+0 d8').routine('spear', '+0 d6', true)
        new BadGuyRecord('Bandit Sgt(2)', 2, 10,0,10, 4, 0, 'chain/sh').ranged('lt xbow', '+1 d6+1').routine('cutlass', '+1 d8').routine('spear', '+1 d6', true)
        new BadGuyRecord('Bandit Ldr(4)', 4, 10,0,10, 4, 0, 'chain/sh').ranged('sbow', '+3 d6/+3 d6').routine('axe', '+3 d8')
        new BadGuyRecord('Pirate (0)', 0, 4,2,1, 8, 0, 'leather').routine('axe', '+0 d8').ranged('axe/bow/etc', '+0 d6')
        new BadGuyRecord('Bosun (2)', 2, 10,0,1, 5, 0, 'chain').routine('axe', '+1 d8').ranged('lt xbow', '+1 d6+1')
        new BadGuyRecord('Mate (4)', 4, 10,0,1, 4, 0, 'chain/sh').routine('cutlass', '+3 d8').routine('haxe', '+3 d6', true)

                                            # type, HD, hpbonus, hpmin, ac, notes
        new MonsterRecord('War Dog', 2, 2, 10, 4, 'barding').routine('bite', '+3 2d4')
        new BadGuyRecord('Footman', 0, 3,4,1, 6, 0, 'scale or studded/sh').routine('spear', '+0 d8', true).routine('sword', '+0 d8')
        new BadGuyRecord('Xbowman', 0, 3,3,1, 6, 0, 'ringmail').ranged('lt xbow', '+0 d6+1').routine('btl axe', '+0 d8')
        new BadGuyRecord('Sbowman', 0, 3,3,1, 5, 0, 'chain').ranged('sbow', '+0 d6/+0 d6').routine('sw sword', '+0 d6')
        new BadGuyRecord('Guard', 0, 3,4,1, 4, 0, 'jav, chain/sh').routine('sword', '+0 d8').ranged('javelin', '+0 d6')
        new BadGuyRecord('Sgt(1)', 2, 10,0,10, 4, 0, 'chain/sh').routine('spear', '+1 d8', true).routine('sword', '+1 d8')
        new BadGuyRecord('Lt(3)', 3, 10,1,17, 3, 0, 'p heal, plate').ranged('hv xbow', '+2 d6+2').routine('mstar', '+2 2d4').routine('spear', '+2 d8', true)
        new BadGuyRecord('Cmdr(5)', 5, 10,1,20, 2, 0, '+1 baxe, plate/sh').routine('+1baxe', '+5 d8+1')
        new BadGuyRecord('Ldr(6)', 6, 10,2,43, 0, 0, '+1 long sword, chain/sh+2/-2dx').routine('+1sword', '+6 d8+2').routine('h axe', '+5 d6+1')
        new BadGuyRecord('Apprentice', 3, 8,1,14, 0, 0, 'metalized AC3/-3dx, p climb, pain mace, 16 17 18 17 15 14').routine('pain mace', '+1 d4+2').spelllist('sanctuary', 'silence15', 'holdperson', 'curse', 'curelt', 'command', 'resistfire')

        new BadGuyRecord('Lareth', 5, 8,1,39,-2, 0, '+3 x2-3staff(20chg), +1plate/-4dx, 18 17 18 18 15 18').routine('staff/mace', '+6 3d6+5/+1 d4+2').spelllist('bless', 'protgood', 'command', 'curelt', 'sanctuary', 'aid', 'holdperson', 'silence15', 'resistfire', 'prayer', 'contdark').immunitylist('para')

        new MonsterRecord('Skeleton', 1,0,2, 7, '').routine('melee', '+1 d6').immunitylist('cold', 'sleep', 'charm', 'hold', 'mental')
        new MonsterRecord('Skeleton (gnoll)', 2,0,8, 7, '').routine('melee', '+2 d6+1').immunitylist('cold', 'sleep', 'charm', 'hold', 'mental')
        new MonsterRecord('Zombie', 2,0,1, 8, '').routine('melee', '+2 d8').immunitylist('cold', 'sleep', 'charm', 'hold', 'mental')
        new MonsterRecord('Ghoul', 2,0,8, 6, 'para').routine('c/c/b', '+2 d3/+2 d3/+2 d6').immunitylist('sleep', 'charm')
        new MonsterRecord('Ghast', 4,0,8, 4, 'stench(-2), para').routine('c/c/b', '+4 d4/+4 d4/+4 d8').immunitylist('sleep', 'charm', 'protevil')
        #new MonsterRecord('Zombie Xvart', 3, 0,    8, 8, 'electrical').routine('melee', '+3 d8').immunitylist('cold', 'sleep', 'charm', 'hold', 'mental')
        #new MonsterRecord('Zombling', 1, 0,    1, 8, 'leap').routine('melee', '+1 d4').immunitylist('cold', 'sleep', 'charm', 'hold', 'mental')
        #new MonsterRecord('Zombie Turtle', 6, 0, 36, 2, '').routine('c/c/b', '+4 d6/+4 d6/+6 2d8').immunitylist('cold', 'sleep', 'charm', 'hold', 'mental')


        new MonsterRecord('G. Raven', 3,2,8, 4, "fly, 6-10' wingspan").routine('melee', '+4 d4+2').immunitylist('cold', 'sleep', 'charm', 'hold', 'mental')
        new MonsterRecord('G. Rat', 0,0,1, 7, '5%disease').routine('bite', '-1 d3')
        new MonsterRecord('G. Tick', 3,0,8, 3, 'blood drain').routine('bite', '+3 d4')
        new MonsterRecord('G. Snake', 4,2,8, 5, 'poison').routine('bite', '+5 d3')
        new MonsterRecord('G. Gar', 8,0,8, 3, 'Whirlpool, nat20 swallow(5% culm drown, iflict 10hp to escape').routine('bite', '+8 2d10')
        new MonsterRecord('G. Lizard', 3,1,8, 5, 'x2 on 20').routine('bite', '+4 d8')
        new MonsterRecord('G. Crayfish', 4,4,20, 4, '1-3 sup, mv 6/12", L 8ft').multi(['r claw', '+5 2d6'], ['l claw', '+5 2d6'])
        new MonsterRecord('G. Leech(1)', 1,0,0, 9, 'after hit drain 1hp, disease').routine('bite', '+1 d4')
        new MonsterRecord('G. Leech(2)', 2,0,8, 9, 'after hit drain 2hp, disease').routine('bite', '+2 d6')
        new MonsterRecord('G. Leech(3)', 3,0,8, 9, 'after hit drain 3hp, disease').routine('bite', '+3 d6')
        new MonsterRecord('G. Leech(4)', 4,0,8, 9, 'after hit drain 4hp, disease').routine('bite', '+4 d8')
        new MonsterRecord('G. Frog 2ft', 1,0,0, 4, '1-4sup, 90ft leap, tongue->max damage, swallow(50lb)').routine('tongue', '+5 d1').routine('bite', '+1 d3')
        new MonsterRecord('G. Frog 4ft', 2,0,8, 7, '1-4sup, 60ft leap, tongue->max damage, swallow(150lb)').routine('tongue', '+6 d1').routine('bite', '+2 d6')
        new MonsterRecord('G. Frog 6ft', 3,0,8, 7, '1-4sup, 30ft leap, tongue->max damage, swallow(250lb)').routine('tongue', '+7 d1').routine('bite', '+3 2d4')
        new MonsterRecord('Crocodile', 3,0,8, 4, '1-3sup').routine('bite', '+3 2d4').routine('death roll', '+3 d12')
        new MonsterRecord('Crocogator', 7,0,8, 3, '1-3sup').routine('bite', '+7 3d6').routine('death roll', '+7 2d10')
        new MonsterRecord('Babbler', 5,0,8, 6, '40% hide, large yellow trex humanoid').routine('c/c/b', '+5 d6/+5 d6/+5 d8')

        new MonsterRecord('Stirge', 1,1,2, 8, '3"/18" mv, d4 blood drain').routine('probiscis', '+4 d3')
        new MonsterRecord('Drelb', 5,3,8, 2, '6" mv, Magic to hit, chill attack, size change, ').routine('chill touch', '+6 3d4')
        new MonsterRecord('Harpie', 3,0,8, 7, '6"/15" mv, sing/charm').routine('c/c/b', '+3 d3/+3 d3/+3 d6')
        new MonsterRecord('Nereid', 4,0,8, 10, 'kiss drowns(vs poison), spittle blinds, infatuate males(no save) try to catch 50% nereids run away').ranged('water', '+4 d4', true).ranged('spittle', '+4 d0', true)
        new MonsterRecord('Sea Hag', 4,0,8, 7, 'silver/coldiron,magic to hit, evil eye 3/day(vs poison), true appearence(vs spells) 1/2 str for d6 turns').magic_resistance(50).routine('claws', '+4 d3+3/+4 d3+3').routine('trident', '+4 d8+3').immunitylist('charm', 'fear', 'sleep', 'fire', 'cold')

                                                    # type, lvl, hitdie, hdbonus, hpmin, ac, xp, notes, saves
        new BadGuyRecord('Otis (6/6ass)', 6, 8,3.5,0, 1, 0, 'Fire operative, poison, assinate, thief-2, 4x backstab, +2leather, +2ringprot').routine('shortswd+2', '+8 d6+5').routine('hammer', '+6 d4+3').ranged('poison dart', '+8 d2/+8 d2/+8 d2')
        new BadGuyRecord('Dick Rentsch (5)', 5, 10,1,1, 4, 0, 'Earth spy, dagger+1 in arm holster, rags of chain, 17 8 13 15 15 7').routine('dagger+1', '+6 d4+2', true).routine('bootblade', '+5 d3+1/+5 d3+1')
        new BadGuyRecord('Screng (6witch)', 6, 6,2,1, 10, 0, "Iuz, potions/scrolls, MS35%, HS35%, turn4th, True Name(wish), witch's caldrun(fly,brew), Talking Skull, 13 12 17 15 16 3").magic_resistance(25).routine('dagger+1 poison', '+3 d4+1').spelllist('sleep', 'comprehendlang', 'command', 'augury', 'speakanimals', 'esp', 'dispel', 'suggestion')
        new BadGuyRecord('Hruda (3witch)', 3, 6,1,1, 10, 0, "Slaadi, potions/scrolls, MS20%, HS20%, turn1st, True Name(wish), staff of withering 2chg (age 10), 3 chg (wither limb+age 10), broom fly, 15 9 18 11 15 6").routine('wither staff+1', '+2 d4+1').spelllist('changeself', 'sleep', 'holdperson')
        new MonsterRecord('Flying Skull', 3,0,1, 2, 'ray enfeeblement, sage, Screngs familiar').routine('bite', '+3 d4').immunitylist('cold', 'sleep', 'charm', 'hold', 'mental')
        new BadGuyRecord('Roberts (6/1ill)', 6, 10,0,0, 6, 0, 'Water pawn, whip of grabbing, leather+2').routine('whip', '+5 d2').routine('saber+1', '+6 d8+1').spelllist('colorspray')
        new BadGuyRecord('Tianna (8)', 8, 10,1,62, 2, 0, 'Water?, 3/2attacks, magnetic shield, spear+1 dagger+2 leather+1, ring prot+3, 17(19) 9 10 15 15 17').routine('spear+1', '+11 d8+7').routine('dagger+2', '+12 d4+8', true)
        new BadGuyRecord('Gruxanthor (5/mu5)', 5, 6,0,59, 4, 0, 'Water follower, dagger +1 chain+1, 15 10 10 12 17 14').routine('staff', '+4 d8').routine('dagger+1', '+5 d4+1', true).spelllist('inviso10r', 'hypnopattern', 'magicmouth', 'misdirection', 'colorspray', 'walloffog', 'detectinviso', 'phantasmalforce' )

        new MonsterRecord('Gnoll (lbow)', 2,0,8, 5, 'scale').routine('zwei', '+2 2d4').ranged('lbow', '+2 d6/+2 d6')
        new MonsterRecord('Gnoll (axe)', 2,0,8, 5, 'scale').routine('mstar', '+2 2d4').ranged('haxe', '+2 d6')
        new MonsterRecord('Gnoll guard', 3,0,16, 4, 'mail').routine('pole', '+3 d10').ranged('lbow', '+3 d6/+3 d6')
        new MonsterRecord('Gnoll leader', 3,0,20, 5, 'scale').routine('zwei', '+3 2d4').ranged('lbow', '+4 d8/+4 d8')
        new MonsterRecord('Gnoll chief', 4,0,24, 3, 'mail').routine('baxe',    '+4 3d4+2')
        new MonsterRecord('Gnoll fm', 1,0,2, 7, '').routine('melee', '+1 d4')

        new MonsterRecord('Hobgoblin', 1,1,2, 5, '').routine('sw', '+2 d8').ranged('cbow', '+2 d6/+2 d6')

        new MonsterRecord('Bugbear (xbow)', 3,1,8, 5, '1-3sup, lamellar').routine('melee', '+4 2d8').ranged('hvy', '+4 d12')
        new MonsterRecord('Bugbear leader', 4,1,20, 4, '1-3sup, lamellar').routine('melee', '+5 2d8+1').ranged('hvy', '+4 d12')
        new MonsterRecord('Bugbear chief', 4,1,32, 3, '1-3sup, plate').routine('melee', '+6 2d8+2')
        new MonsterRecord('Bugbear fm', 1,1,3, 5, '1-3sup').routine('melee', '+2 d8')
        new MonsterRecord('Bugbear young', 0,0,2, 7, '1-3sup').routine('melee', '-1 d4')

        new MonsterRecord('Ogre', 4,1,20, 4, 'mv 8"').routine('stone club', '+5 d6+4').ranged('rock', '+5 d10')
        new MonsterRecord('Ogre chief', 3,1,26, 4, 'mv 8"').routine('baxe', '+5 d8+4').ranged('rock', '+5 d12')

        new MonsterRecord('Lizardman', 2,1,8, 5, '').routine('c/c/b', '+3 d2/+3 d2/+3 d8').ranged('javelin', '+3 d6').ranged('barbed darts', '+3 d3+1/+3 d3+1')
        new MonsterRecord('Lizardman Shaman', 2,1,22, 5, '5th lvl shaman').routine('c/c/b', '+7 d2/+7 d2/+7 d8').spelllist('curelt', 'protgood', 'detectmagic', 'resistfire', 'augury', 'speakanimals', 'dispel')

        new MonsterRecord('Gobo (sbow)', 1,-1,2, 6, '').routine('melee', '+0 d6').ranged('sbow', '+1 d4/+1 d4')
        new MonsterRecord('Gobo (dart)', 1,-1,2, 6, '').ranged('dart', '+1 d2/+1 d2/+1 d2').routine('melee', '+0 d6')

        new MonsterRecord('Fire Mephit', 3,1,8, 5, "BW 15' jet(d8+1)/5'blanket(d4), 2xmagicmissle 3/day, heatmetal 1/day, 33% gate mephit, licked by flames, 4' tall, bat winged outlandish, cigar smoking").routine('claws', '+4 d3+1/+4 d3+1')
        new MonsterRecord('Earth Mephit', 3,2,8, 2, "BW 15' cone(d4+50% blinded/stunned), dig earth 1/day, 33% gate mephit, stoney, 4' tall, bat winged outlandish, cigar smoking").routine('claws', '+4 d4/+4 d4')
        new MonsterRecord('Steam Mephit', 3,3,8, 7, "BW 20'r steam(d3+50% stun), 40'x40' boiling rain(2d6) 1/day, contaminate water 1/day, 33% gate mephit, sweats boiling water, 4' tall, bat winged outlandish, cigar smoking").routine('claws', '+4 d4/+4 d4')
        new MonsterRecord('Smoke Mephit', 3,0,8, 4, "BW 20' ball(d4+blind d2rnds), inviso 1/day, dancing lights 1/day, 33% gate mephit, emits smoke, 4' tall, bat winged outlandish, cigar smoking").routine('claws', '+3 d2/+3 d2')
        new MonsterRecord('Lava Mephit', 3,0,8, 6, "BW 10' ball(d6), shape change into lava pool, regen 2hp in lava, 33% gate mephit, licked by flames, 4' tall, bat winged outlandish, cigar smoking").routine('claws', '+3 d8+1/+3 d8+1')

        new MonsterRecord('Big Spider', 1,1,2, 6, '+4poison').routine('bite', '+2 d4')
        new MonsterRecord('Bigger Spider', 2,2,8, 6, '30ft jump, +2poison').routine('bite', '+3 d6')
        new MonsterRecord('Biggest Spider', 4,4,8, 4, 'web, poison').routine('bite', '+5 d8')
        new MonsterRecord('Wolf', 2,2,8, 7, '10').routine('bite', '+3 d4+1')
        #new MonsterRecord('Lilwere', 2, 1, 10, 3, '8 1-3sup, silv/magic').routine('bite', '+3 d4')
        new MonsterRecord('Werewolf', 4,3,20, 5, '8 1-3sup, silv/magic').routine('bite', '+5 2d4')

        new MonsterRecord('Orc (xbow)', 1,0,2, 6, 'scale').routine('scim', '+1 d8').ranged('lt xbow', '+1 d6+1')
        new MonsterRecord('Orc (sbow)', 1,0,2, 6, 'scale').routine('scim', '+1 d8').ranged('sbow', '+1 d6/+1 d6')
        new MonsterRecord('Orc guard', 2,0,11, 4, 'banded').routine('pole', '+2 d10').ranged('lt xbow', '+2 d6+1')
        new MonsterRecord('Orc captian', 2,0,15, 4, 'mail/sh').routine('scim', '+2 d8+1').ranged('sbow', '+2 d6/+2 d6')
        new MonsterRecord('Orc chief', 3,0,18, 3, 'plate').routine('baxe', '+3 3d4+1')

        new BadGuyRecord('Alcolyte', 1, 8,0,4, 4, 0, 'p unholy, banded').routine('mace', '+0 d6+2').spelllist('curelt', 'bless', 'curse', 'command')
        new MonsterRecord('Bogling (blow)', 0,0,2, 7, 'leap dart poison (+2Para) ').routine('fists', '-1 d4').ranged('blowgun', '+0 d2')
        new MonsterRecord('Bog Chief', 1,0,4, 5, '').routine('nat', '1 d4')

        new MonsterRecord('Troglodyte', 2,0,8, 5, 'odor, chameleon').routine('b/c/c', '+2 d4+1/+2 d3/+2 d3').routine('club', '+2 d6', true)
        new MonsterRecord('Trog guard', 3,0,12, 5, 'odor, chameleon').routine('club', '+3 d6+1', true)
        new MonsterRecord('Trog leader', 4,0,24, 5, 'odor, chameleon').routine('axe', '+4 d8+1', true)
        new MonsterRecord('Trog chief', 6,0,36, 5, 'odor, chameleon').routine('axe', '+6 d8+2', true)
        new MonsterRecord('Trog fm', 1,1,2, 5, 'odor, chameleon').routine('b/c/c', '+2 d4+1/+2 d3/+2 d3')
        new MonsterRecord('Trog young', 0,0,2, 7, 'chameleon').routine('bite', '-1 d4')
        ]
