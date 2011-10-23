# vim: set expandtab tabstop=4 shiftwidth=4:
# Norman J. Harman Jr. njharman@gmail.com

namespace = (target, name, block)->
    [target, name, block] = [(if typeof exports isnt 'undefined' then exports else window), arguments...] if arguments.length < 3
    top = target
    target = target[item] or= {} for item in name.split '.'
    block target, top
