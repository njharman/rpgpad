# vim: set expandtab tabstop=4 shiftwidth=4:
# Norman J. Harman Jr. njharman@gmail.com

namespace = (target, name, block) ->
    [target, name, block] = [(if typeof exports isnt 'undefined' then exports else window), arguments...] if arguments.length < 3
    top = target
    target = target[item] or= {} for item in name.split '.'
    block target, top


namespace 'rpgpad.SpellBook', (self) ->
    # Definitions of all spells in game. Provides constructor for Mobs to memorize individual spells.
    self.memorize = (spell) ->
        # Return instance of memorized spell.
        new Spell(spells[spell]...)

    class Spell
        # Memorized Spell.
        constructor: (@lvl, @segments, @name, @duration, @description) ->
            @casted = false

        cast: (caster, target) ->
            # Mark memorized spell as cast.
            target = if target? then " at #{ target }" else ""
            description = if this.description then " [#{ @description }]" else ""
            rpgpad.console.log("\"#{ caster }\" casts #{ @name + description + @duration + target }.")
            @casted = true
            @

    spells =              # lvl, segments, name, duration, notes
            command:         [1,    1, 'Command', '1rds', '']
            detectmagic:     [1, 10, 'Detect Magic', '1turns', '']
            curelt:          [1,    5, 'Cure Light', 'perm', 'd8']
            curse:           [1, 10, 'Curse', '6rds', '-1 tohit']
            bless:           [1, 10, 'Bless', '6rds', '+1 tohit']
            sanctuary:       [1,    4, 'Sanctuary', '2rds+1/lvl', 'save vs Spell to attack']
            protgood:        [1,    4, 'Prot vs Good', '3rds/lvl', '-2 tohit, +2 saves']
            aid:             [2,    4, 'Aid', '1rds+1/lvl', 'bless + d8hp']
            holdperson:      [2,    5, 'Hold Person', '4rds+1/lvl', '-2 one, -1 two, -0 three. ']
            silence15:       [2,    5, 'Silence 15r', '2rds/lvl', '']
            augury:          [2,100, 'Augurary', 'inst', '']
            resistfire:      [2,    6, 'Resist Fire', '1turns/lvl', 'imm normal. +3, half damage']
            speakanimals:    [2,    5, 'Speak w/ Animals', '2rnds/lvl', '']
            locateobject:    [3,100, 'Locate Object', '1rnds/lvl', "60'+10'/lvl"]
            contdark:        [3,    6, 'Continual Darkness', 'perm', '60\'r']
            causeblind:      [3,    6, 'Cause Blindness', 'perm', '']
            prayer:          [3,    6, 'Prayer', '1rd/lvl', '+1/-1 all rolls']
            dispel:          [3,    6, 'Dispel Magic', 'inst', '30\'r, 50% +5/-2 per lvl diff']

            # illusonist
            changeself:      [1,    1, 'Change Self', '2d6rds+2rds/lvl', "bipedal humanoid"]
            colorspray:      [1,    1, 'Colour Spray', 'inst', "cone 10'/lvl long, creatures == to caster lvl"]
            walloffog:       [1,    1, 'Wall of Fog', '2d4rds+1rd/lvl', "20'/lvl cube, 30' range"]
            detectinviso:    [1,    1, 'Detect Inviso', '5rd/lvl', "10'/lvl long"]
            phantasmalforce: [1, 1, 'Phantasmal Force', 'inst', "40'+10'/lvl cube, 60'+10'/lvl range"]
            hypnopattern:    [2,    2, 'Hypnotic Pattern', 'concentration', "silent, save or 'hypnotised', 30'x30'"]
            magicmouth:      [2,    2, 'Magic Mouth', 'perm', ""]
            misdirection:    [2,    2, 'Misdirection', '1rd/lvl', "30'range"]
            inviso10r:       [3,    3, 'Inviso 10r', 'special', ""]

            sleep:                    [1,    1, 'Sleep', '5rds/lvl', ""]
            comprehendlang:  [1, 10, 'Comprehend Languages', '5rds/lvl', "written"]
            esp:             [2,    2, 'ESP', '1rd/lvl', "5'r/lvl, surface thoughts"]
            suggestion:      [3,    3, 'Suggestion', '60rds+60rds/lvl', ""]
