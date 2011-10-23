# vim: set expandtab tabstop=4 shiftwidth=4:
# Norman J. Harman Jr. njharman@gmail.com


namespace 'Dice', (self) ->
    self.VERSION = '1.0.0'

    self.randint = (min, max) ->
        # Return random integer between min and max inclusive.
        min + Math.floor(Math.random() * max)

    self.d20 = () ->
        self.roll(1,20)

    self.d100 = () ->
        self.roll(1,100)

    self.roll = (count, sides, mod) ->
        # Return total of rolling count dice with x sides.
        rolls = []
        rolls.push(self.randint(1, sides)) for i in [1..count]
        total = 0
        total += roll for roll in rolls
        if mod? and mod != 0
            total += mod
            modtxt = (if mod > 0 then '+' else '-') + mod
        else
            modtxt = ''
        # TODO: pass in log function somehow
        rpgpad.log("Roll #{ count }d #{ sides + modtxt }: (#{ rolls.join(',') }) = #{ total }")
        total

    self.parse = (roll) ->
        # Parse "2d6+2" formated strings into function that returns roll.
        bits = roll.split('d')
        count = if !bits[0] then 1 else parseInt(bits[0])
        if bits[1].contains('+')
                more = bits[1].split('+')
                die = parseInt(more[0])
                mod = parseInt(more[1])
        else if bits[1].contains('-')
                more = bits[1].split('-')
                die = parseInt(more[0])
                mod = -parseInt(more[1])
        else
                die = parseInt(bits[1])
                mod = 0
        () -> self.roll(count, die, mod)
